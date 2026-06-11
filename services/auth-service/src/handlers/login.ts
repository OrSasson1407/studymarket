import { FastifyRequest, FastifyReply } from 'fastify';

export async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = request.body as any;
  // TODO: Validate against DB, verify password hash

  const user = { id: 'user_123', email, role: 'student' }; // Mock DB result

  // Generate short-lived access token
  const accessToken = await reply.jwtSign(user, { expiresIn: '15m' });
  
  // Generate long-lived refresh token
  const refreshToken = await reply.jwtSign({ id: user.id }, { expiresIn: '30d' });

  // Set HttpOnly cookie for the refresh token
  reply.setCookie('refreshToken', refreshToken, {
    domain: 'localhost',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  });

  return reply.send({ accessToken });
}
