import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createClient } from "redis";
import { createProxyMiddleware } from "http-proxy-middleware";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base:  { service: "api-gateway" },
  transport: process.env.NODE_ENV !== "production"
    ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } }
    : undefined,
});

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());

const AUTH_SERVICE_URL         = process.env.AUTH_SERVICE_URL         || "http://localhost:3001";
const CONTENT_SERVICE_URL      = process.env.CONTENT_SERVICE_URL      || "http://localhost:3002";
const USER_SERVICE_URL         = process.env.USER_SERVICE_URL         || "http://localhost:3003";
const PAYMENT_SERVICE_URL      = process.env.PAYMENT_SERVICE_URL      || "http://localhost:3004";
const SEARCH_SERVICE_URL       = process.env.SEARCH_SERVICE_URL       || "http://localhost:3005";
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3006";
const MODERATION_SERVICE_URL   = process.env.MODERATION_SERVICE_URL   || "http://localhost:3007";
const SUBSCRIPTION_SERVICE_URL = process.env.SUBSCRIPTION_SERVICE_URL || "http://localhost:3008";
const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL || 'http://localhost:3009';
const REDIS_URL                = process.env.REDIS_URL                || "redis://localhost:6379";
const JWT_SECRET               = process.env.JWT_SECRET               || "super-secret-local-key";

const IP_RATE_MAX    = 100;   // per IP, per minute
const USER_RATE_MAX  = 200;   // per authenticated user, per minute (higher — trusted)
const RATE_WINDOW    = 60;    // seconds

const redis = createClient({ url: REDIS_URL });
redis.on("error", (err) => logger.error({ err }, "Redis error"));
redis.connect().catch((err) => logger.error({ err }, "Redis connect failed"));

// ?? Request-ID injection ??????????????????????????????????????????????????????
app.use((req, res, next) => {
  const id = (req.headers["x-request-id"] as string) ?? randomUUID();
  req.headers["x-request-id"] = id;
  res.setHeader("x-request-id", id);
  next();
});

// ?? Structured access log ?????????????????????????????????????????????????????
app.use((req, _res, next) => {
  logger.info({ requestId: req.headers["x-request-id"], method: req.method, url: req.url });
  next();
});

// ?? Rate limiter: IP + per-user ???????????????????????????????????????????????
async function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const requestId = req.headers["x-request-id"] as string;
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? "unknown";

  // Try to extract userId from Bearer token for per-user limiting
  let userId: string | null = null;
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(auth.slice(7), JWT_SECRET) as any;
      userId = payload.userId ?? null;
    } catch { /* expired/invalid — fall back to IP limit */ }
  }

  const ipKey   = `rl:ip:${ip}`;
  const userKey = userId ? `rl:user:${userId}` : null;

  try {
    // Always enforce IP limit
    const ipMulti = redis.multi().incr(ipKey).expire(ipKey, RATE_WINDOW, "NX");
    const ipRes   = await ipMulti.exec();
    const ipCount = (ipRes?.[0] as number) ?? 1;

    res.setHeader("X-RateLimit-Limit",     IP_RATE_MAX);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, IP_RATE_MAX - ipCount));

    if (ipCount > IP_RATE_MAX) {
      logger.warn({ requestId, ip }, "IP rate limit exceeded");
      return res.status(429).json({ error: "Too many requests" });
    }

    // Additionally enforce per-user limit for authenticated requests
    if (userKey) {
      const userMulti = redis.multi().incr(userKey).expire(userKey, RATE_WINDOW, "NX");
      const userRes   = await userMulti.exec();
      const userCount = (userRes?.[0] as number) ?? 1;

      if (userCount > USER_RATE_MAX) {
        logger.warn({ requestId, userId }, "User rate limit exceeded");
        return res.status(429).json({ error: "Too many requests" });
      }
    }
  } catch (err) {
    logger.error({ err, requestId }, "Rate limiter Redis error — failing open");
  }

  next();
}

app.use(rateLimiter);

app.get("/health", (_req, res) => res.json({ status: "ok", service: "api-gateway" }));

const proxyOptions = { changeOrigin: true, xfwd: true };
app.use("/api/auth",          createProxyMiddleware({ target: AUTH_SERVICE_URL,         ...proxyOptions }));
app.use("/api/content",       createProxyMiddleware({ target: CONTENT_SERVICE_URL,      ...proxyOptions }));
app.use("/api/users",         createProxyMiddleware({ target: USER_SERVICE_URL,         ...proxyOptions }));
app.use("/api/payment",       createProxyMiddleware({ target: PAYMENT_SERVICE_URL,      ...proxyOptions }));
app.use("/api/search",        createProxyMiddleware({ target: SEARCH_SERVICE_URL,       ...proxyOptions }));
app.use("/api/moderation",    createProxyMiddleware({ target: MODERATION_SERVICE_URL,   ...proxyOptions }));
app.use("/api/subscriptions", createProxyMiddleware({ target: SUBSCRIPTION_SERVICE_URL, ...proxyOptions }));

// ?? Graceful shutdown ?????????????????????????????????????????????????????????
const server = app.listen(Number(process.env.GATEWAY_PORT) || 3100, () =>
  logger.info("API Gateway active on port " + (process.env.GATEWAY_PORT ?? 3100))
);

async function shutdown(signal: string) {
  logger.info(`${signal} — shutting down gateway`);
  server.close(async () => {
    await redis.quit();
    process.exit(0);
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

