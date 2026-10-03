import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function getDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;
  if (!envUrl || envUrl.startsWith("postgresql://") || envUrl.startsWith("postgres://")) {
    return envUrl;
  }

  if (envUrl.startsWith("file:")) {
    const prismaDbPath = path.join(process.cwd(), "prisma", "dev.db");
    const rootDbPath = path.join(process.cwd(), "dev.db");

    if (fs.existsSync(prismaDbPath)) {
      return `file:${prismaDbPath}`;
    }
    if (fs.existsSync(rootDbPath)) {
      return `file:${rootDbPath}`;
    }
  }

  return envUrl;
}

const dbUrl = getDatabaseUrl();

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
