import { PrismaClient } from '@prisma/client';

declare global {
  // Prevent multiple Prisma instances in Next.js dev hot-reload
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') global.__prisma = prisma;

export * from '@prisma/client';
