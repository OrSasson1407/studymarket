import { PrismaClient } from "@prisma/client";

// connection_limit caps the PgBouncer/Postgres pool per service replica.
// Adjust based on your Postgres max_connections and replica count.
const DATABASE_URL = process.env.DATABASE_URL ?? "";
const pooledUrl    = DATABASE_URL.includes("connection_limit")
  ? DATABASE_URL
  : `${DATABASE_URL}${DATABASE_URL.includes("?") ? "&" : "?"}connection_limit=10&pool_timeout=20`;

export const prisma = new PrismaClient({
  datasources: { db: { url: pooledUrl } },
  log: process.env.NODE_ENV === "development"
    ? ["query", "warn", "error"]
    : ["warn", "error"],
});

/** Call on SIGTERM/SIGINT so the service drains cleanly. */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
