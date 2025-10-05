import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

export function isDatabaseEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getPrismaClient(): PrismaClient {
  if (!isDatabaseEnabled()) {
    throw new Error("DATABASE_URL is not configured; falling back to JSON store");
  }
  if (!prisma) {
    prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
    });
  }
  return prisma;
}

export function disconnectPrisma(): Promise<void> {
  if (prisma) {
    const client = prisma;
    prisma = null;
    return client.$disconnect();
  }
  return Promise.resolve();
}
