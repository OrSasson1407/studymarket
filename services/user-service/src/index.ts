import Fastify from 'fastify';
import { prisma } from '../../../database';
import { requireAuth } from '../../shared/src/jwtMiddleware';

const server = Fastify({ logger: true });

// Public: get user profile
server.get<{ Params: { id: string } }>('/api/users/:id', async (req, reply) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { sellerProfile: true, university: true },
  });
  if (!user) return reply.status(404).send({ error: 'User not found' });
  const { passwordHash, ...safeUser } = user as any;
  return reply.send(safeUser);
});

// Protected: update profile (only self)
server.patch<{ Params: { id: string }; Body: { firstName?: string; lastName?: string } }>(
  '/api/users/:id',
  { preHandler: requireAuth },
  async (req, reply) => {
    if (req.jwtUser?.userId !== req.params.id) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const updated = await prisma.user.update({ where: { id: req.params.id }, data: req.body });
    return reply.send(updated);
  }
);

// Public: get seller profile
server.get<{ Params: { id: string } }>('/api/users/:id/seller-profile', async (req, reply) => {
  const profile = await prisma.sellerProfile.findUnique({ where: { userId: req.params.id } });
  if (!profile) return reply.status(404).send({ error: 'Seller profile not found' });
  return reply.send(profile);
});

// Protected: create seller profile
server.post<{ Params: { id: string } }>(
  '/api/users/:id/seller-profile',
  { preHandler: requireAuth },
  async (req, reply) => {
    if (req.jwtUser?.userId !== req.params.id) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const existing = await prisma.sellerProfile.findUnique({ where: { userId: req.params.id } });
    if (existing) return reply.status(409).send({ error: 'Seller profile already exists' });
    const profile = await prisma.sellerProfile.create({ data: { userId: req.params.id } });
    return reply.status(201).send(profile);
  }
);

server.get('/health', async () => ({ status: 'ok', service: 'user-service' }));

const PORT = parseInt(process.env.PORT ?? '3003', 10);
server.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) { server.log.error(err); process.exit(1); }
  console.log('User service listening at ' + address);
});
