import { FastifyRequest, FastifyReply } from "fastify";

export async function logoutHandler(request: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie("refreshToken", { path: "/" });
  return reply.send({ success: true });
}
