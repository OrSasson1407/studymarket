import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-local-key";

export interface JwtPayload {
  userId: string;
  email:  string;
  role?:  string;
}

declare module "fastify" {
  interface FastifyRequest {
    jwtUser?: JwtPayload;
  }
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Missing or invalid Authorization header" });
  }
  const token = authHeader.slice(7);
  try {
    req.jwtUser = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
}

/** Call inside a protected route to get the verified caller's userId. Throws 401 if not set. */
export function getCallerId(req: FastifyRequest, reply: FastifyReply): string | null {
  if (!req.jwtUser?.userId) {
    reply.status(401).send({ error: "Unauthorized" });
    return null;
  }
  return req.jwtUser.userId;
}
