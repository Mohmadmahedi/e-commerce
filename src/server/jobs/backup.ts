import fs from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";
import { logger } from "../utils/logger";

export interface BackupMetadata {
  timestamp: string;
  databaseProvider: string;
  tableCounts: Record<string, number>;
  backupFile: string;
}

export class BackupEngine {
  private backupDir = path.join(process.cwd(), "backups");

  /**
   * Generates a point-in-time database snapshot for disaster recovery
   */
  async createBackup(): Promise<BackupMetadata> {
    await fs.mkdir(this.backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `avanya_backup_${timestamp}.json`;
    const filepath = path.join(this.backupDir, filename);

    logger.info("Initiating automated database backup snapshot...");

    // 1. Fetch complete database tables
    const [
      users,
      categories,
      collections,
      products,
      variants,
      images,
      addresses,
      orders,
      orderItems,
      coupons,
      reviews,
      auditLogs,
    ] = await Promise.all([
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true } }),
      prisma.category.findMany(),
      prisma.collection.findMany(),
      prisma.product.findMany(),
      prisma.productVariant.findMany(),
      prisma.image.findMany(),
      prisma.address.findMany(),
      prisma.order.findMany(),
      prisma.orderItem.findMany(),
      prisma.coupon.findMany(),
      prisma.review.findMany(),
      prisma.auditLog.findMany({ take: 500, orderBy: { createdAt: "desc" } }),
    ]);

    const tableCounts = {
      users: users.length,
      categories: categories.length,
      collections: collections.length,
      products: products.length,
      variants: variants.length,
      images: images.length,
      addresses: addresses.length,
      orders: orders.length,
      orderItems: orderItems.length,
      coupons: coupons.length,
      reviews: reviews.length,
      auditLogs: auditLogs.length,
    };

    const snapshot = {
      meta: {
        createdAt: new Date().toISOString(),
        version: "1.0",
        tableCounts,
      },
      data: {
        users,
        categories,
        collections,
        products,
        variants,
        images,
        addresses,
        orders,
        orderItems,
        coupons,
        reviews,
        auditLogs,
      },
    };

    // 2. Write snapshot JSON
    await fs.writeFile(filepath, JSON.stringify(snapshot, null, 2), "utf8");

    // 3. For SQLite local dev: Also create a raw binary copy of dev.db if exists
    const sqlitePath = path.join(process.cwd(), "prisma", "dev.db");
    try {
      await fs.access(sqlitePath);
      const dbCopyPath = path.join(this.backupDir, `avanya_sqlite_${timestamp}.db`);
      await fs.copyFile(sqlitePath, dbCopyPath);
    } catch {}

    logger.info({ filepath, tableCounts }, "Automated database backup completed successfully");

    return {
      timestamp,
      databaseProvider: process.env.DATABASE_URL?.includes("file:") ? "sqlite" : "postgresql",
      tableCounts,
      backupFile: filename,
    };
  }

  /**
   * List all existing backup files in storage
   */
  async listBackups(): Promise<Array<{ filename: string; sizeBytes: number; createdAt: Date }>> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      const files = await fs.readdir(this.backupDir);
      const list = [];

      for (const file of files) {
        const fullPath = path.join(this.backupDir, file);
        const stats = await fs.stat(fullPath);
        list.push({
          filename: file,
          sizeBytes: stats.size,
          createdAt: stats.birthtime,
        });
      }

      return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch {
      return [];
    }
  }

  /**
   * Verify disaster recovery snapshot restoration
   */
  async verifyBackupIntegrity(filename: string): Promise<boolean> {
    const fullPath = path.join(this.backupDir, filename);
    const content = await fs.readFile(fullPath, "utf8");
    const parsed = JSON.parse(content);

    return Boolean(
      parsed.meta &&
      parsed.meta.tableCounts &&
      parsed.data &&
      Array.isArray(parsed.data.products) &&
      Array.isArray(parsed.data.orders)
    );
  }
}

export const backupEngine = new BackupEngine();
