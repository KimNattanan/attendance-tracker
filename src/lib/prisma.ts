import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient as PrismaClientClass } from "@/generated/prisma/client";
import type { PrismaClient as PrismaClientType } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientType;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClientClass({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    }),
  });

if(process.env.NODE_ENV !== "production"){
  globalForPrisma.prisma = prisma;
}

