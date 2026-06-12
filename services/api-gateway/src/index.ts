import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(express.json());

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Proxy everything under /api/auth to the auth-service
app.use('/api/auth', async (req, res) => {
  const targetUrl = `${AUTH_SERVICE_URL}/api/auth${req.url}`;

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (req.headers.cookie) headers['cookie'] = req.headers.cookie as string;

    const init: RequestInit = { method: req.method, headers };
    if (!['GET', 'HEAD'].includes(req.method)) {
      init.body = JSON.stringify(req.body ?? {});
    }

    const upstream = await fetch(targetUrl, init);

    const setCookie = upstream.headers.get('set-cookie');
    if (setCookie) res.setHeader('set-cookie', setCookie);

    const contentType = upstream.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await upstream.json();
      res.status(upstream.status).json(data);
    } else {
      const text = await upstream.text();
      res.status(upstream.status).send(text);
    }
  } catch (err) {
    res.status(502).json({ error: 'auth-service unreachable', detail: (err as Error).message });
  }
});

const PORT = Number(process.env.GATEWAY_PORT) || 3100;

app.listen(PORT, () => {
  console.log('API Gateway listening on port ' + PORT);
});
