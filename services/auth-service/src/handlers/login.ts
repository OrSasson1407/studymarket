import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../database';
import { getRedis } from '../../../shared/src/redis';

export async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = request.body as { email: string; password: string };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return reply.status(401).send({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return reply.status(401).send({ error: 'Invalid credentials' });

  // Cache minimal user profile in Redis (TTL 15m to match access token)
  try {
    const redis = await getRedis();
    await redis.setEx(
      `user:${user.id}`,
      900,
      JSON.stringify({ id: user.id, email: user.email, verificationStatus: user.verificationStatus })
    );
  } catch (err) {
    console.warn('[auth] redis cache failed (non-fatal):', err);
  }

  // Update last login IP
  const ip = (request.headers['x-forwarded-for'] as string)?.split(',')[0] ?? request.ip;
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginIp: ip } }).catch(() => {});

  const payload = { userId: user.id, email: user.email, role: 'student' };
  const accessToken  = await reply.jwtSign(payload, { expiresIn: '15m' });
  const refreshToken = await reply.jwtSign({ userId: user.id }, { expiresIn: '30d' });

  reply.setCookie('refreshToken', refreshToken, {
    domain:   'localhost',
    path:     '/',
    secure:   process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge:   30 * 24 * 60 * 60,
  });

  return reply.send({ accessToken });
}