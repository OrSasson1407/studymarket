import { FastifyRequest, FastifyReply } from "fastify";
import { randomUUID } from "crypto";

/** Attach X-Request-ID to every request and response for log correlation. */
export async function attachRequestId(req: FastifyRequest, reply: FastifyReply) {
  const id = (req.headers["x-request-id"] as string) ?? randomUUID();
  req.headers["x-request-id"] = id;
  reply.header("x-request-id", id);
}
