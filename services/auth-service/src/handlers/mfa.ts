import { FastifyRequest, FastifyReply } from 'fastify';

// @ts-ignore - otplib named exports clash with TypeScript Node16 module resolution
import { authenticator } from 'otplib';

export async function generateMfaHandler(request: FastifyRequest, reply: FastifyReply) {
  const secret = authenticator.generateSecret();
  const userEmail = 'student@technion.ac.il'; // Mock
  
  const otpauth = authenticator.keyuri(userEmail, 'StudyMarket', secret);

  return reply.send({ secret, otpauthUrl: otpauth });
}
