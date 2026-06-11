import { FastifyRequest, FastifyReply } from 'fastify';
import { getUniversityByEmail } from '@studymarket/utils';

export async function registerHandler(request: FastifyRequest, reply: FastifyReply) {
  const { email, name, password } = request.body as any;

  const university = getUniversityByEmail(email);
  if (!university) {
    return reply.status(403).send({ error: 'Invalid institutional email.' });
  }

  // TODO: Hash password, save user to DB, generate verification token
  
  return reply.status(201).send({
    message: 'User registered. Please check your email to verify your account.',
    requiresVerification: true
  });
}
