import Fastify from 'fastify';
import { Client } from '@elastic/elasticsearch';
import { prisma } from '../../../database';
import { requireAuth } from '../../shared/src/jwtMiddleware';

const es = new Client({ node: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200' });
const INDEX = 'studymarket_documents';
const server = Fastify({ logger: true });

// FIXED: Added retry logic for Docker compose environments
async function ensureIndex(retries = 5) {
  while (retries > 0) {
    try {
      const exists = await es.indices.exists({ index: INDEX });
      if (!exists) {
        await es.indices.create({
          index: INDEX,
          mappings: {
            properties: {
              title:       { type: 'text',    analyzer: 'standard' },
              description: { type: 'text',    analyzer: 'standard' },
              courseCode:  { type: 'keyword' },
              courseName:  { type: 'text' },
              university:  { type: 'keyword' },
              docType:     { type: 'keyword' },
              priceAmount: { type: 'integer' },
              rating:      { type: 'float' },
              createdAt:   { type: 'date' },
            },
          },
        });
        console.log('[search-service] ES index created:', INDEX);
      }
      return;
    } catch (err) {
      console.warn([search-service] ES not ready. Retries left: );
      retries -= 1;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  throw new Error('Elasticsearch failed to connect after multiple retries.');
}

server.post<{ Body: { assetId: string } }>('/api/search/index', { preHandler: requireAuth }, async (req, reply) => {
    // ... (unchanged indexing logic)
    return reply.send({ indexed: true });
});

// FIXED: Added 'page' support for proper pagination
server.get<{
  Querystring: { q: string; university?: string; docType?: string; minPrice?: string; maxPrice?: string; limit?: string; page?: string }
}>('/api/search', async (req, reply) => {
  const { q, university, docType, minPrice, maxPrice, limit = '20', page = '1' } = req.query;
  const size = parseInt(limit, 10);
  const from = (parseInt(page, 10) - 1) * size;
  
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
    size,
    from,
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

ensureIndex().then(() => {
    server.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
      if (err) { server.log.error(err); process.exit(1); }
      console.log('Search service listening at ' + address);
    });
}).catch(console.error);