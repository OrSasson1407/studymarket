import Fastify from "fastify";
import { prisma, disconnectPrisma } from "../../../database";
import { requireAuth, getCallerId } from "../../shared/src/jwtMiddleware";
import { withCache, invalidateCachePattern } from "../../shared/src/cache";
import { presignUpload, presignDownload } from "./s3";
import { generatePreviewPdf } from "./pdfProcessor";
import { s3, BUCKET } from "./s3";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const server = Fastify({ logger: true });

const CACHE_TTL   = 60;   // seconds — public list + single doc
const LIST_KEY    = (q: string) => `content:list:${q}`;
const DOC_KEY     = (id: string) => `content:doc:${id}`;

// ?? Public: list published documents (cached 60s) ?????????????????????????????
server.get<{
  Querystring: { search?: string; university?: string; docType?: string; limit?: string; offset?: string }
}>("/api/content/documents", async (req, reply) => {
  const qs = new URLSearchParams(req.query as any).toString();
  const data = await withCache(LIST_KEY(qs), CACHE_TTL, async () => {
    const { search, university, limit = "20", offset = "0" } = req.query;
    const assets = await prisma.contentAsset.findMany({
      where: {
        status: "PUBLISHED",
        ...(search ? {
          OR: [
            { title:       { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { course: { name:       { contains: search, mode: "insensitive" } } },
            { course: { courseCode: { contains: search, mode: "insensitive" } } },
          ],
        } : {}),
        ...(university ? {
          course: { faculty: { university: { name: { contains: university, mode: "insensitive" } } } },
        } : {}),
      },
      include: {
        seller: { include: { user: { select: { firstName: true, lastName: true, verificationStatus: true } } } },
        course: { include: { faculty: { include: { university: true } } } },
      },
      take:    parseInt(limit,  10),
      skip:    parseInt(offset, 10),
      orderBy: { createdAt: "desc" },
    });
    return assets.map(a => ({
      id:              a.id,
      title:           a.title,
      courseCode:      a.course.courseCode,
      courseName:      a.course.name,
      university:      a.course.faculty.university.name,
      faculty:         a.course.faculty.name,
      semester:        a.course.semesterOffered,
      priceAmount:     a.priceAmount,
      currency:        a.currency,
      compositeRating: a.compositeRating,
      purchaseCount:   a.purchaseCount,
      authorName:      `${a.seller.user.firstName} ${a.seller.user.lastName}`,
      authorVerified:  a.seller.user.verificationStatus === "VERIFIED",
      docType:         a.format,
      previewUrl:      a.previewUrl,
      createdAt:       a.createdAt,
    }));
  });
  return reply.send(data);
});

// ?? Public: get single document (cached 60s) ??????????????????????????????????
server.get<{ Params: { id: string } }>("/api/content/documents/:id", async (req, reply) => {
  const data = await withCache(DOC_KEY(req.params.id), CACHE_TTL, async () => {
    const asset = await prisma.contentAsset.findUnique({
      where: { id: req.params.id },
      include: {
        seller: { include: { user: { select: { firstName: true, lastName: true, verificationStatus: true } } } },
        course: { include: { faculty: { include: { university: true } } } },
      },
    });
    if (!asset || asset.status !== "PUBLISHED") return null;
    return asset;
  });

  if (!data) return reply.status(404).send({ error: "Document not found" });

  // Fire-and-forget view count increment (don't await — keeps response fast)
  prisma.contentAsset.update({ where: { id: req.params.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  return reply.send(data);
});

// ?? Protected: request pre-signed upload URL ??????????????????????????????????
server.post<{ Body: { ext: string; type: "document" | "preview" } }>(
  "/api/content/upload-url",
  { preHandler: requireAuth },
  async (req, reply) => {
    const { ext, type } = req.body;
    const allowed = ["pdf", "docx", "pptx", "jpg", "png"];
    if (!allowed.includes(ext.toLowerCase())) {
      return reply.status(400).send({ error: `Unsupported file type: ${ext}` });
    }
    return reply.send(await presignUpload(type === "preview" ? "previews" : "documents", ext.toLowerCase()));
  }
);

// ?? Protected: confirm upload + create asset (PENDING_REVIEW) ?????????????????
server.post<{
  Body: {
    localCourseId: string; title: string; description: string;
    format: string; priceAmount: number; currency?: string;
    fileKey: string; fileUrl: string; pageCount?: number;
  }
}>(
  "/api/content/documents",
  { preHandler: requireAuth },
  async (req, reply) => {
    const callerId = getCallerId(req, reply);
    if (!callerId) return;

    const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId: callerId } });
    if (!sellerProfile) return reply.status(403).send({ error: "No seller profile. Create one first." });

    const { localCourseId, title, description, format, priceAmount, currency = "ILS", fileKey, fileUrl, pageCount = 1 } = req.body;

    const asset = await prisma.contentAsset.create({
      data: { sellerId: sellerProfile.id, localCourseId, title, description, format, priceAmount, currency, fileUrl, pageCount, status: "PENDING_REVIEW" },
    });

    // Invalidate list cache so new submission is visible to the seller (not yet public)
    await invalidateCachePattern("content:list:*");

    if (format.toLowerCase() === "pdf") {
      generatePreviewAsync(asset.id, fileKey).catch((err) =>
        server.log.error({ err, assetId: asset.id }, "Preview generation failed")
      );
    }

    return reply.status(201).send(asset);
  }
);

// ?? Protected: secure download URL (verified purchasers only) ????????????????
server.get<{ Params: { id: string } }>(
  "/api/content/documents/:id/download",
  { preHandler: requireAuth },
  async (req, reply) => {
    const callerId = getCallerId(req, reply);
    if (!callerId) return;

    const asset = await prisma.contentAsset.findUnique({ where: { id: req.params.id } });
    if (!asset || asset.status !== "PUBLISHED") return reply.status(404).send({ error: "Not found" });

    const purchased = await prisma.paymentTransaction.findFirst({
      where: { buyerId: callerId, contentId: asset.id, status: "COMPLETED" },
    });
    if (!purchased) return reply.status(403).send({ error: "Purchase required" });

    const fileKey = new URL(asset.fileUrl).pathname.slice(1);
    const url     = await presignDownload(fileKey, 3600);
    return reply.send({ url, expiresIn: 3600 });
  }
);

// ?? Protected: purchase intent ????????????????????????????????????????????????
server.post<{ Params: { id: string } }>(
  "/api/content/documents/:id/purchase",
  { preHandler: requireAuth },
  async (req, reply) => {
    const asset = await prisma.contentAsset.findUnique({ where: { id: req.params.id } });
    if (!asset || asset.status !== "PUBLISHED") return reply.status(404).send({ error: "Document not found" });
    return reply.status(200).send({ assetId: asset.id, priceAmount: asset.priceAmount, currency: asset.currency });
  }
);

server.get("/health", async () => ({ status: "ok", service: "content-service", cache: "redis", upload: "s3-presigned" }));

// ?? Graceful shutdown ?????????????????????????????????????????????????????????
async function shutdown(signal: string) {
  server.log.info(`${signal} received — shutting down gracefully`);
  await server.close();
  await disconnectPrisma();
  process.exit(0);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

const PORT = parseInt(process.env.PORT ?? "3002", 10);
server.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) { server.log.error(err); process.exit(1); }
  server.log.info("Content service listening at " + address);
});

// ?? Internal: async preview generation ???????????????????????????????????????
async function generatePreviewAsync(assetId: string, fileKey: string) {
  const obj    = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: fileKey }));
  const chunks: Buffer[] = [];
  for await (const chunk of obj.Body as AsyncIterable<Buffer>) chunks.push(Buffer.from(chunk));
  const previewBuffer = await generatePreviewPdf(Buffer.concat(chunks));
  const previewKey    = `previews/${assetId}-preview.pdf`;
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: previewKey, Body: previewBuffer, ContentType: "application/pdf" }));
  const previewUrl = `https://${BUCKET}.s3.amazonaws.com/${previewKey}`;
  await prisma.contentAsset.update({ where: { id: assetId }, data: { previewUrl } });
}
