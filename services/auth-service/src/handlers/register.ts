import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../database';

export async function registerHandler(request: FastifyRequest, reply: FastifyReply) {
  const { email, password, firstName, lastName, universityId } = request.body as {
    email: string; password: string; firstName: string; lastName: string; universityId?: string;
  };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return reply.status(409).send({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, universityId },
  });

  return reply.status(201).send({
    id:        user.id,
    email:     user.email,
    firstName: user.firstName,
    lastName:  user.lastName,
  });
}