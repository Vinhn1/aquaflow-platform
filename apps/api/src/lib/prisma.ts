import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton Instance
 * Dam bao chi co 1 connection pool duoc tao trong suot vong doi ung dung
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
