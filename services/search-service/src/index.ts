import Fastify from 'fastify';
import { Client } from '@elastic/elasticsearch';
import { prisma } from '../../../database';

const es = new Client({ node: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200' });
const INDEX = 'studymarket_documents';

const server = Fastify({ logger: true });

// ?? Boot: ensure ES index exists ??????????????????????????????????????????????
async function ensureIndex() {
  const exists = await es.indices.exists({ index: INDEX });
  if (!exists) {
    await es.indices.create({
      index: INDEX,
      mappings: {
        properties: {
          title:       { type: 'text',    analyzer: 'standard' },
          description: { type: 'text',    analyzer: 'standard' },
          courseCode:  { type: 'keyword'                        },
          courseName:  { type: 'text'                           },
          university:  { type: 'keyword'                        },
          docType:     { type: 'keyword'                        },
          priceAmount: { type: 'integer'                        },
          rating:      { type: 'float'                          },
          createdAt:   { type: 'date'                           },
        },
      },
    });
    console.log('[search-service] ES index created:', INDEX);
  }
}

// ?? POST /api/search/index — index a document ?????????????????????????????????
server.post<{ Body: { assetId: string } }>('/api/search/index', async (req, reply) => {
  const asset = await prisma.contentAsset.findUnique({
    where: { id: req.body.assetId },
    include: {
      course:  { include: { faculty: { include: { university: true } } } },
      seller:  { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  });
  if (!asset) return reply.status(404).send({ error: 'Asset not found' });

  await es.index({
    index: INDEX,
    id:    asset.id,
    document: {
      title:       asset.title,
      description: asset.description,
      courseCode:  asset.course.courseCode,
      courseName:  asset.course.name,
      university:  asset.course.faculty.university.name,
      docType:     asset.format,
      priceAmount: asset.priceAmount,
      rating:      asset.compositeRating,
      createdAt:   asset.createdAt,
    },
  });

  return reply.send({ indexed: true });
});

// ?? GET /api/search?q= ????????????????????????????????????????????????????????
server.get<{
  Querystring: { q: string; university?: string; docType?: string; minPrice?: string; maxPrice?: string; limit?: string }
}>('/api/search', async (req, reply) => {
  const { q, university, docType, minPrice, maxPrice, limit = '20' } = req.query;

  const filters: any[] = [];
  if (university) filters.push({ term: { university } });
  if (docType)    filters.push({ term: { docType } });
  if (minPrice || maxPrice) {
    filters.push({ range: { priceAmount: {
      ...(minPrice ? { gte: parseInt(minPrice, 10) } : {}),
      ...(maxPrice ? { lte: parseInt(maxPrice, 10) } : {}),
    }}});
  }

  const result = await es.search({
    index: INDEX,
    size:  parseInt(limit, 10),
    query: {
      bool: {
        must:   q ? [{ multi_match: { query: q, fields: ['title^3', 'courseName^2', 'courseCode', 'description'] } }] : [{ match_all: {} }],
        filter: filters,
      },
    },
  });

  const hits = (result.hits.hits as any[]).map(h => ({ id: h._id, score: h._score, ...h._source }));
  return reply.send({ results: hits, total: (result.hits.total as any)?.value ?? hits.length });
});

server.get('/health', async () => ({ status: 'ok', service: 'search-service' }));

const PORT = parseInt(process.env.PORT ?? '3005', 10);
server.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) { server.log.error(err); process.exit(1); }
  console.log('Search service listening at ' + address);
}, async () => {
  await ensureIndex().catch(console.error);
});
