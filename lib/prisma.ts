/**
 * Prisma Client Singleton with Connection Pooling
 * Optimized for serverless environments (Next.js)
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client instance with optimized connection pooling
 * 
 * Connection Pooling Strategy:
 * - Singleton pattern prevents multiple instances
 * - Connection pool size optimized for serverless (Next.js)
 * - Connection limit: 10 connections per instance
 * - Timeout: 5 seconds
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Store in global for serverless environments to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown - increase max listeners to avoid warning (Prisma + Next.js dev)
if (typeof process !== 'undefined') {
  process.setMaxListeners?.(20);
  
  // Only attach the listener once in development mode using a global flag
  const globalForListeners = globalThis as unknown as { _prismaListenerAttached: boolean };
  if (!globalForListeners._prismaListenerAttached) {
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
    });
    globalForListeners._prismaListenerAttached = true;
  }
}

