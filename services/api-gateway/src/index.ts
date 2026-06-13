import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createClient } from 'redis';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
// Removed express.json() globally so multipart/form-data for file uploads flows through naturally

const AUTH_SERVICE_URL    = process.env.AUTH_SERVICE_URL    || 'http://localhost:3001';
const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE_URL || 'http://localhost:3002';
const USER_SERVICE_URL    = process.env.USER_SERVICE_URL    || 'http://localhost:3003';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004';
const SEARCH_SERVICE_URL  = process.env.SEARCH_SERVICE_URL  || 'http://localhost:3005';
const REDIS_URL           = process.env.REDIS_URL           || 'redis://localhost:6379';
const RATE_LIMIT_MAX      = 100;
const RATE_LIMIT_WINDOW   = 60;

const redis = createClient({ url: REDIS_URL });
redis.on('error', (err) => console.error('[gateway] redis error', err));
redis.connect().catch(console.error);

async function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip  = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.ip;
  const key = l:gateway: + ip;
  try {
    // FIXED: Atomic multi-transaction to prevent permanent lockouts
    const multi = redis.multi();
    multi.incr(key);
    multi.expire(key, RATE_LIMIT_WINDOW, 'NX');
    const results = await multi.exec();
    const count = results?.[0] as number || 1;
    
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX - count));
    if (count > RATE_LIMIT_MAX) {
      return res.status(429).json({ error: 'Too many requests' });
    }
  } catch {
    // Fail open
  }
  next();
}

app.use(rateLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

// FIXED: Using stream-aware proxy middleware for file uploads instead of manual fetch stringification
const proxyOptions = { changeOrigin: true, xfwd: true };
app.use('/api/auth',    createProxyMiddleware({ target: AUTH_SERVICE_URL,    ...proxyOptions }));
app.use('/api/content', createProxyMiddleware({ target: CONTENT_SERVICE_URL, ...proxyOptions }));
app.use('/api/users',   createProxyMiddleware({ target: USER_SERVICE_URL,    ...proxyOptions }));
app.use('/api/payment', createProxyMiddleware({ target: PAYMENT_SERVICE_URL, ...proxyOptions }));
app.use('/api/search',  createProxyMiddleware({ target: SEARCH_SERVICE_URL,  ...proxyOptions }));

const PORT = Number(process.env.GATEWAY_PORT) || 3100;
app.listen(PORT, () => console.log(API Gateway active on port  + PORT));
