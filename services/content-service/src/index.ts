import Fastify from 'fastify';
import { prisma } from '../../../database';
import { requireAuth } from '../../shared/src/jwtMiddleware';

const server = Fastify({ logger: true });

// Public: list documents
server.get<{
  Querystring: { search?: string; university?: string; docType?: string; limit?: string; offset?: string }
}>('/api/content/documents', async (req, reply) => {
  const { search, university, limit = '20', offset = '0' } = req.query;
  const assets = await prisma.contentAsset.findMany({
    where: {
      status: 'LIVE',
      ...(search ? {
        OR: [
          { title:       { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { course:      { name:      { contains: search, mode: 'insensitive' } } },
          { course:      { courseCode: { contains: search, mode: 'insensitive' } } },
        ],
      } : {}),
      ...(university ? {
        course: { faculty: { university: { name: { contains: university, mode: 'insensitive' } } } },
      } : {}),
    },
    include: {
      seller: { include: { user: { select: { firstName: true, lastName: true, verificationStatus: true } } } },
      course: { include: { faculty: { include: { university: true } } } },
    },
    take:  parseInt(limit,  10),
    skip:  parseInt(offset, 10),
    orderBy: { createdAt: 'desc' },
  });
  const docs = assets.map(a => ({
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
    authorName:      a.seller.user.firstName + ' ' + a.seller.user.lastName,
    authorVerified:  a.seller.user.verificationStatus === 'VERIFIED',
    docType:         a.format,
    createdAt:       a.createdAt,
  }));
  return reply.send(docs);
});

// Public: get single document
server.get<{ Params: { id: string } }>('/api/content/documents/:id', async (req, reply) => {
  const asset = await prisma.contentAsset.findUnique({
    where: { id: req.params.id },
    include: {
      seller: { include: { user: { select: { firstName: true, lastName: true, verificationStatus: true } } } },
      course: { include: { faculty: { include: { university: true } } } },
    },
  });
  if (!asset || asset.status !== 'LIVE') return reply.status(404).send({ error: 'Document not found' });
  prisma.contentAsset.update({ where: { id: asset.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
  return reply.send(asset);
});

// Protected: purchase intent
server.post<{ Params: { id: string }; Body: { buyerId: string } }>(
  '/api/content/documents/:id/purchase',
  { preHandler: requireAuth },
  async (req, reply) => {
    const asset = await prisma.contentAsset.findUnique({ where: { id: req.params.id } });
    if (!asset || asset.status !== 'LIVE') return reply.status(404).send({ error: 'Document not found' });
    await prisma.contentAsset.update({ where: { id: asset.id }, data: { purchaseCount: { increment: 1 } } });
    return reply.status(201).send({ success: true, assetId: asset.id, fileUrl: asset.fileUrl });
  }
);

// Protected: upload new asset
server.post<{
  Body: {
    sellerId: string; localCourseId: string; title: string;
    description: string; format: string; priceAmount: number;
    currency?: string; fileUrl: string; previewUrl?: string; pageCount?: number;
  }
}>(
  '/api/content/documents',
  { preHandler: requireAuth },
  async (req, reply) => {
    const { sellerId, localCourseId, title, description, format, priceAmount, currency = 'ILS', fileUrl, previewUrl, pageCount = 1 } = req.body;
    const asset = await prisma.contentAsset.create({
      data: { sellerId, localCourseId, title, description, format, priceAmount, currency, fileUrl, previewUrl, pageCount, status: 'DRAFT' },
    });
    return reply.status(201).send(asset);
  }
);

server.get('/health', async () => ({ status: 'ok', service: 'content-service' }));

const PORT = parseInt(process.env.PORT ?? '3002', 10);
server.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) { server.log.error(err); process.exit(1); }
  console.log('Content service listening at ' + address);
});
