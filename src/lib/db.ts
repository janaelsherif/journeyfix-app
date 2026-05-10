import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

function createPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  try {
    return (
      globalForPrisma.prisma ||
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      })
    );
  } catch {
    return null;
  }
}

export const prisma = createPrisma();
if (prisma && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function isDbConfigured(): boolean {
  return !!process.env.DATABASE_URL && !!prisma;
}
