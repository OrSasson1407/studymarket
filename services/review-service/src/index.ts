import Fastify from "fastify";
import { prisma } from "../../../database";
import { requireAuth, getCallerId } from "../../shared/src/jwtMiddleware";
import { xpToLevel } from "@studymarket/utils";

const server = Fastify({ logger: { level: process.env.LOG_LEVEL ?? "info" } });

// ?? Validation schemas ????????????????????????????????????????????????????????
const createReviewSchema = {
  body: {
    type: "object",
    required: ["score"],
    properties: {
      score:   { type: "integer", minimum: 1, maximum: 5 },
      comment: { type: "string",  maxLength: 1000 },
    },
    additionalProperties: false,
  },
};

// ?? Public: get all reviews for an asset ??????????????????????????????????????
server.get<{
  Params:      { assetId: string };
  Querystring: { limit?: string; offset?: string };
}>("/api/reviews/assets/:assetId", async (req, reply) => {
  const limit  = parseInt(req.query.limit  ?? "20", 10);
  const offset = parseInt(req.query.offset ?? "0",  10);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where:   { assetId: req.params.assetId },
      include: { asset: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take:    limit,
      skip:    offset,
    }),
    prisma.review.count({ where: { assetId: req.params.assetId } }),
  ]);

  return reply.send({ total, reviews });
});

// ?? Protected: submit a review (one per user per asset) ???????????????????????
server.post<{
  Params: { assetId: string };
  Body:   { score: number; comment?: string };
}>(
  "/api/reviews/assets/:assetId",
  { schema: createReviewSchema, preHandler: requireAuth },
  async (req, reply) => {
    const userId = getCallerId(req, reply);
    if (!userId) return;

    const { assetId } = req.params;
    const { score, comment } = req.body;

    // Must have purchased the asset to review it
    const purchased = await prisma.paymentTransaction.findFirst({
      where: { buyerId: userId, contentId: assetId, status: "COMPLETED" },
    });
    if (!purchased) return reply.status(403).send({ error: "You must purchase this document before reviewing it" });

    // Check for existing review (unique constraint: assetId + userId)
    const existing = await prisma.review.findUnique({
      where: { assetId_userId: { assetId, userId } },
    });
    if (existing) return reply.status(409).send({ error: "You have already reviewed this document" });

    // Create review inside a transaction that also recalculates compositeRating
    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: { assetId, userId, score, comment },
      });

      // Recalculate average rating across all reviews for this asset
      const agg = await tx.review.aggregate({
        where:   { assetId },
        _avg:    { score: true },
        _count:  { score: true },
      });

      const newRating = Math.round((agg._avg.score ?? score) * 10) / 10;
      await tx.contentAsset.update({
        where: { id: assetId },
        data:  { compositeRating: newRating },
      });

      // Award XP to seller for receiving a review (5 XP per review)
      const asset = await tx.contentAsset.findUnique({
        where:   { id: assetId },
        select:  { sellerId: true },
      });

      if (asset?.sellerId) {
        const seller = await tx.sellerProfile.findUnique({ where: { id: asset.sellerId } });
        if (seller) {
          const newXp    = seller.xpPoints + 5;
          const newLevel = xpToLevel(newXp);
          await tx.sellerProfile.update({
            where: { id: asset.sellerId },
            data: {
              xpPoints: newXp,
              // Only update level if it increased — never decreases
              ...(newLevel > seller.level ? { level: newLevel } : {}),
            },
          });
          if (newLevel > seller.level) {
            server.log.info(
              { sellerId: asset.sellerId, oldLevel: seller.level, newLevel, xp: newXp },
              "Seller leveled up!"
            );
          }
        }
      }

      return created;
    });

    return reply.status(201).send(review);
  }
);

// ?? Protected: update own review ?????????????????????????????????????????????
server.patch<{
  Params: { reviewId: string };
  Body:   { score?: number; comment?: string };
}>(
  "/api/reviews/:reviewId",
  { preHandler: requireAuth },
  async (req, reply) => {
    const userId = getCallerId(req, reply);
    if (!userId) return;

    const existing = await prisma.review.findUnique({ where: { id: req.params.reviewId } });
    if (!existing)             return reply.status(404).send({ error: "Review not found" });
    if (existing.userId !== userId) return reply.status(403).send({ error: "Not your review" });

    const { score, comment } = req.body;
    const updated = await prisma.$transaction(async (tx) => {
      const upd = await tx.review.update({
        where: { id: req.params.reviewId },
        data: {
          ...(score   !== undefined ? { score }   : {}),
          ...(comment !== undefined ? { comment } : {}),
        },
      });

      // Recalculate compositeRating after edit
      const agg = await tx.review.aggregate({
        where:  { assetId: existing.assetId },
        _avg:   { score: true },
      });
      await tx.contentAsset.update({
        where: { id: existing.assetId },
        data:  { compositeRating: Math.round((agg._avg.score ?? (score ?? existing.score)) * 10) / 10 },
      });

      return upd;
    });

    return reply.send(updated);
  }
);

// ?? Protected: delete own review ?????????????????????????????????????????????
server.delete<{ Params: { reviewId: string } }>(
  "/api/reviews/:reviewId",
  { preHandler: requireAuth },
  async (req, reply) => {
    const userId = getCallerId(req, reply);
    if (!userId) return;

    const existing = await prisma.review.findUnique({ where: { id: req.params.reviewId } });
    if (!existing)             return reply.status(404).send({ error: "Review not found" });
    if (existing.userId !== userId) return reply.status(403).send({ error: "Not your review" });

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: req.params.reviewId } });
      const agg = await tx.review.aggregate({
        where: { assetId: existing.assetId },
        _avg:  { score: true },
      });
      await tx.contentAsset.update({
        where: { id: existing.assetId },
        data:  { compositeRating: Math.round((agg._avg.score ?? 0) * 10) / 10 },
      });
    });

    return reply.send({ success: true });
  }
);

// ?? Public: get seller level + XP info ????????????????????????????????????????
server.get<{ Params: { sellerId: string } }>(
  "/api/reviews/sellers/:sellerId/level",
  async (req, reply) => {
    const profile = await prisma.sellerProfile.findUnique({
      where:  { id: req.params.sellerId },
      select: { level: true, xpPoints: true, overallRating: true, badges: true },
    });
    if (!profile) return reply.status(404).send({ error: "Seller not found" });

    const { xpToLevel: _x, xpToNextLevel } = await import("@studymarket/utils");
    return reply.send({
      level:         profile.level,
      xpPoints:      profile.xpPoints,
      xpToNextLevel: xpToNextLevel(profile.xpPoints),
      overallRating: profile.overallRating,
      badges:        profile.badges,
    });
  }
);

server.get("/health", async () => ({ status: "ok", service: "review-service" }));

// ?? Graceful shutdown ?????????????????????????????????????????????????????????
async function shutdown(signal: string) {
  server.log.info(`${signal} — shutting down review-service`);
  await server.close();
  process.exit(0);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

const PORT = parseInt(process.env.PORT ?? "3009", 10);
server.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) { server.log.error(err); process.exit(1); }
  server.log.info("Review service listening at " + address);
});
