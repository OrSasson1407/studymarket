import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createClient } from 'redis';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(express.json());

const AUTH_SERVICE_URL    = process.env.AUTH_SERVICE_URL    || 'http://localhost:3001';
const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE_URL || 'http://localhost:3002';
const USER_SERVICE_URL    = process.env.USER_SERVICE_URL    || 'http://localhost:3003';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004';
const SEARCH_SERVICE_URL  = process.env.SEARCH_SERVICE_URL  || 'http://localhost:3005';
const REDIS_URL           = process.env.REDIS_URL           || 'redis://localhost:6379';
const RATE_LIMIT_MAX      = 100;
const RATE_LIMIT_WINDOW   = 60; // seconds

const redis = createClient({ url: REDIS_URL });
redis.on('error', (err) => console.error('[gateway] redis error', err));
redis.connect().catch(console.error);

// Redis-backed rate limiter middleware
async function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip  = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.ip;
  const key = `rl:gateway:${ip}`;
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, RATE_LIMIT_WINDOW);
    res.setHeader('X-RateLimit-Limit',     RATE_LIMIT_MAX);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX - count));
    if (count > RATE_LIMIT_MAX) {
      return res.status(429).json({ error: 'Too many requests' });
    }
  } catch {
    // Redis down — fail open (don't block traffic)
  }
  next();
}

app.use(rateLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

async function proxyTo(targetBase: string, prefix: string, req: express.Request, res: express.Response) {
  const targetUrl = `${targetBase}${prefix}${req.url}`;
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (req.headers.cookie)        headers['cookie']        = req.headers.cookie as string;
    if (req.headers.authorization) headers['authorization'] = req.headers.authorization as string;

    const init: RequestInit = { method: req.method, headers };
    if (!['GET', 'HEAD'].includes(req.method)) init.body = JSON.stringify(req.body ?? {});

    const upstream    = await fetch(targetUrl, init);
    const setCookie   = upstream.headers.get('set-cookie');
    if (setCookie) res.setHeader('set-cookie', setCookie);

    const contentType = upstream.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      res.status(upstream.status).json(await upstream.json());
    } else {
      res.status(upstream.status).send(await upstream.text());
    }
  } catch (err) {
    res.status(502).json({ error: `${prefix} service unreachable`, detail: (err as Error).message });
  }
}

app.use('/api/auth',    (req, res) => proxyTo(AUTH_SERVICE_URL,    '/api/auth',    req, res));
app.use('/api/content', (req, res) => proxyTo(CONTENT_SERVICE_URL, '/api/content', req, res));
app.use('/api/users',   (req, res) => proxyTo(USER_SERVICE_URL,    '/api/users',   req, res));
app.use('/api/payment', (req, res) => proxyTo(PAYMENT_SERVICE_URL, '/api/payment', req, res));
app.use('/api/search',  (req, res) => proxyTo(SEARCH_SERVICE_URL,  '/api/search',  req, res));

const PORT = Number(process.env.GATEWAY_PORT) || 3100;
app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
  console.log('Redis rate limiting: active');
  console.log('Routes: /api/auth | /api/content | /api/users | /api/payment | /api/search');
});