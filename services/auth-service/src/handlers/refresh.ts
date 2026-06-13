import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-local-key";

export async function refreshHandler(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies?.refreshToken;
  if (!token) return reply.status(401).send({ error: "No refresh token" });

  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return reply.status(401).send({ error: "Invalid or expired refresh token" });
  }

  const newAccessToken = await reply.jwtSign(
    { userId: payload.userId, email: payload.email, role: payload.role ?? "student" },
    { expiresIn: "15m" }
  );

  // Rotate the refresh token on every use
  const newRefreshToken = await reply.jwtSign(
    { userId: payload.userId },
    { expiresIn: "30d" }
  );

  reply.setCookie("refreshToken", newRefreshToken, {
    domain:   process.env.NODE_ENV === "production" ? undefined : "localhost",
    path:     "/",
    secure:   process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    maxAge:   30 * 24 * 60 * 60,
  });

  return reply.send({ accessToken: newAccessToken });
}
