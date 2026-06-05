import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient | null {
  if (typeof window !== 'undefined') return null; // Server only
  if (!process.env.DATABASE_URL) {
    console.log('[PRISMA] No DATABASE_URL found. Gracefully falling back to JSON local file store.');
    return null;
  }

  if (!prisma) {
    try {
      prisma = new PrismaClient();
      console.log('[PRISMA] Client initialized successfully.');
    } catch (e) {
      console.error('[PRISMA] Initialization error:', e);
      prisma = null;
    }
  }
  return prisma;
}
