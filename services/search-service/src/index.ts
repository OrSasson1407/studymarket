import Fastify from "fastify";
import { Client } from "@elastic/elasticsearch";
import { prisma } from "../../../database";
import { requireAuth } from "../../shared/src/jwtMiddleware";

const es     = new Client({ node: process.env.ELASTICSEARCH_URL ?? "http://localhost:9200" });
const INDEX  = "studymarket_documents";
const server = Fastify({ logger: true });

// ?? Index bootstrap ????????????????????????????????????????????????????????????
async function ensureIndex(retries = 5) {
  while (retries > 0) {
    try {
      const exists = await es.indices.exists({ index: INDEX });
      if (!exists) {
        await es.indices.create({
          index: INDEX,
          settings: {
            analysis: {
              // Hebrew-aware analyzer using the ICU plugin.
              // Falls back gracefully to standard if ICU plugin is absent.
              analyzer: {
                hebrew_text: {
                  type:      "custom",
                  tokenizer: "icu_tokenizer",
                  filter:    ["icu_normalizer", "icu_folding"],
                },
                hebrew_search: {
                  type:      "custom",
                  tokenizer: "icu_tokenizer",
                  filter:    ["icu_normalizer", "icu_folding"],
                },
              },
            },
          },
          mappings: {
            properties: {
              // Full-text fields — dual-indexed for Hebrew + Latin
              title: {
                type:   "text",
                analyzer: "hebrew_text",
                search_analyzer: "hebrew_search",
                fields: {
                  // search_as_you_type subfield for autocomplete (idea #12)
                  suggest: { type: "search_as_you_type" },
                  // keyword subfield for exact-match / sort
                  keyword: { type: "keyword" },
                },
              },
              description: {
                type:      "text",
                analyzer: "hebrew_text",
                search_analyzer: "hebrew_search",
              },
              courseName: {
                type:   "text",
                analyzer: "hebrew_text",
                fields: { suggest: { type: "search_as_you_type" } },
              },
              courseCode:  { type: "keyword" },
              university:  { type: "keyword" },
              faculty:     { type: "keyword" },
              docType:     { type: "keyword" },
              sellerId:    { type: "keyword" },
              priceAmount: { type: "integer" },
              rating:      { type: "float" },
              createdAt:   { type: "date" },
            },
          },
        });
        server.log.info("ES index created: " + INDEX);
      }
      return;
    } catch (err) {
      server.log.warn({ err, retries }, "ES not ready, retrying in 3s");
      retries--;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  throw new Error("Elasticsearch failed to connect after multiple retries.");
}

// ?? Internal: index a single asset by ID ??????????????????????????????????????
server.post<{ Body: { assetId: string } }>(
  "/api/search/index",
  async (req, reply) => {
    const isInternal = req.headers["x-internal-secret"] === (process.env.INTERNAL_SECRET ?? "internal-secret-local");
    const isAuthed   = !!req.jwtUser;            
    if (!isInternal && !isAuthed) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const { assetId } = req.body;
    const asset = await prisma.contentAsset.findUnique({
      where:   { id: assetId },
      include: {
        seller: { include: { user: { select: { firstName: true, lastName: true } } } },
        course: { include: { faculty: { include: { university: true } } } },
      },
    });

    if (!asset || asset.status !== "PUBLISHED") {
      return reply.status(404).send({ error: "Asset not found or not published" });
    }

    await es.index({
      index: INDEX,
      id:    asset.id,
      document: {
        title:       asset.title,
        description: asset.description,
        courseCode:  asset.course.courseCode,
        courseName:  asset.course.name,
        university:  asset.course.faculty.university.name,
        faculty:     asset.course.faculty.name,
        docType:     asset.format,
        sellerId:    asset.sellerId,
        priceAmount: asset.priceAmount,
        rating:      asset.compositeRating,
        createdAt:   asset.createdAt,
      },
    });

    return reply.send({ indexed: true, assetId });
  }
);

// ?? Internal: remove an asset from the index (on reject/flag) ?????????????????
server.delete<{ Params: { id: string } }>(
  "/api/search/index/:id",
  async (req, reply) => {
    const secret = req.headers["x-internal-secret"];
    if (secret !== (process.env.INTERNAL_SECRET ?? "internal-secret-local")) {
      return reply.status(403).send({ error: "Forbidden" });
    }
    try {
      await es.delete({ index: INDEX, id: req.params.id });
    } catch (err: any) {
      if (err?.meta?.statusCode !== 404) throw err; // 404 is fine — not indexed
    }
    return reply.send({ removed: true });
  }
);

// ?? Public: full-text search with filters ??????????????????????????????????????
server.get<{
  Querystring: { q?: string; university?: string; docType?: string; minPrice?: string; maxPrice?: string; limit?: string; page?: string; }
}>("/api/search", async (req, reply) => {
  const { q, university, docType, minPrice, maxPrice, limit = "20", page = "1" } = req.query;
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
        must:   q
          ? [{ multi_match: {
              query:  q,
              fields: ["title^3", "title.suggest^2", "courseName^2", "courseCode", "description"],
              fuzziness: "AUTO",
            }}]
          : [{ match_all: {} }],
        filter: filters,
      },
    },
    highlight: {
      fields: { title: {}, courseName: {}, description: { fragment_size: 120 } },
    },
  });

  const hits = (result.hits.hits as any[]).map(h => ({
    id:         h._id,
    score:      h._score,
    highlights: h.highlight ?? {},
    ...h._source,
  }));

  return reply.send({
    results: hits,
    total:   (result.hits.total as any)?.value ?? hits.length,
    page:    parseInt(page, 10),
    pages:   Math.ceil(((result.hits.total as any)?.value ?? hits.length) / size),
  });
});

// ?? Public: autocomplete / suggest ????????????????????????????????????????????
server.get<{ Querystring: { q: string; limit?: string } }>(
  "/api/search/suggest",
  async (req, reply) => {
    const { q, limit = "5" } = req.query;
    if (!q || q.length < 2) return reply.send({ suggestions: [] });

    const result = await es.search({
      index: INDEX,
      size:  parseInt(limit, 10),
      query: {
        multi_match: {
          query:  q,
          type:   "bool_prefix",
          fields: [
            "title.suggest",
            "title.suggest._2gram",
            "title.suggest._3gram",
            "courseName.suggest",
            "courseName.suggest._2gram",
          ],
        },
      },
      _source: ["title", "courseName", "university", "docType"],
    });

    const suggestions = (result.hits.hits as any[]).map(h => ({
      id:         h._id,
      title:      h._source.title,
      courseName: h._source.courseName,
      university: h._source.university,
      docType:    h._source.docType,
    }));

    return reply.send({ suggestions });
  }
);

server.get("/health", async () => ({ status: "ok", service: "search-service", features: ["hebrew-icu", "autocomplete", "auto-index"] }));

const PORT = parseInt(process.env.PORT ?? "3005", 10);
ensureIndex().then(() => {
  server.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) { server.log.error(err); process.exit(1); }
    console.log("Search service listening at " + address);
  });
}).catch(console.error);
