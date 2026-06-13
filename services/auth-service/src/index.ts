import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";

import { registerHandler }    from "./handlers/register";
import { loginHandler }       from "./handlers/login";
import { refreshHandler }     from "./handlers/refresh";
import { logoutHandler }      from "./handlers/logout";
import { generateMfaHandler } from "./handlers/mfa";
import { checkDomainHandler } from "./handlers/checkDomain";

const server = Fastify({ logger: { level: process.env.LOG_LEVEL ?? "info" } });

// ?? Validation schemas ????????????????????????????????????????????????????????
const registerSchema = {
  body: {
    type: "object",
    required: ["email", "password", "firstName", "lastName"],
    properties: {
      email:        { type: "string", format: "email", maxLength: 254 },
      password:     { type: "string", minLength: 8, maxLength: 128 },
      firstName:    { type: "string", minLength: 1, maxLength: 80 },
      lastName:     { type: "string", minLength: 1, maxLength: 80 },
      universityId: { type: "string" },
    },
    additionalProperties: false,
  },
};

const loginSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email:    { type: "string", format: "email" },
      password: { type: "string", minLength: 1 },
    },
    additionalProperties: false,
  },
};

async function buildServer() {
  await server.register(cors, { origin: true, credentials: true });
  await server.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  await server.register(jwt, { secret: process.env.JWT_SECRET || "super-secret-local-key" });
  await server.register(cookie, { secret: process.env.COOKIE_SECRET || "cookie-signature-secret" });

  server.register(async (pub) => {
    pub.post("/api/auth/register", {
      schema: registerSchema,
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
    }, registerHandler);

    pub.post("/api/auth/login", {
      schema: loginSchema,
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    }, loginHandler);

    pub.post("/api/auth/refresh", {
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
    }, refreshHandler);

    pub.post("/api/auth/logout", logoutHandler);

    pub.get("/api/auth/check-domain", {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
    }, checkDomainHandler);
  });

  server.register(async (prot) => {
    prot.post("/api/auth/mfa/generate", generateMfaHandler);
  });

  server.get("/health", async () => ({
    status: "ok", service: "auth-service", validation: "enabled", refresh: "enabled",
  }));
}

buildServer().then(() => {
  const PORT = parseInt(process.env.PORT ?? "3001", 10);

  async function shutdown(signal: string) {
    server.log.info(`${signal} received — shutting down auth-service`);
    await server.close();
    process.exit(0);
  }
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));

  server.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) { server.log.error(err); process.exit(1); }
    server.log.info("Auth service listening at " + address);
  });
});
