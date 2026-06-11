import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';

import { registerHandler } from './handlers/register';
import { loginHandler } from './handlers/login';
import { generateMfaHandler } from './handlers/mfa';

const server = Fastify({ logger: true });

async function buildServer() {
  // 1. Security Plugins
  await server.register(cors, { origin: true, credentials: true });
  await server.register(rateLimit, {
    max: 100, // Limit each IP to 100 requests per `timeWindow`
    timeWindow: '1 minute'
  });

  // 2. Auth Plugins
  await server.register(jwt, { secret: process.env.JWT_SECRET || 'super-secret-local-key' });
  await server.register(cookie, { secret: process.env.COOKIE_SECRET || 'cookie-signature-secret' });

  // 3. Public Routes (Strict Rate Limiting)
  server.register(async (publicRoutes) => {
    publicRoutes.post('/api/auth/register', {
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } }
    }, registerHandler);
    
    publicRoutes.post('/api/auth/login', {
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } }
    }, loginHandler);
  });

  // 4. Protected Routes (Requires Auth - Mocked for now)
  server.register(async (protectedRoutes) => {
    protectedRoutes.post('/api/auth/mfa/generate', generateMfaHandler);
  });

  server.get('/health', async () => ({ status: 'ok', service: 'auth-service', mfa: 'ready', limits: 'active' }));
}

buildServer().then(() => {
  server.listen({ port: 3001, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    // Using standard string concatenation to prevent PowerShell backtick mangling
    console.log('Auth service listening at ' + address);
  });
});
