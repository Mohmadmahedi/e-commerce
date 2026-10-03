import prisma from "@/lib/prisma";
import { logger } from "../utils/logger";

export interface CreateAuditLogParams {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown> | string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditRepository {
  /**
   * Record a security or domain audit event
   */
  async createLog(params: CreateAuditLogParams) {
    try {
      const detailsStr =
        typeof params.details === "object"
          ? JSON.stringify(params.details)
          : params.details || null;

      const log = await prisma.auditLog.create({
        data: {
          userId: params.userId || null,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId || null,
          details: detailsStr,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
        },
      });

      logger.info(
        { action: params.action, entity: params.entity, entityId: params.entityId, userId: params.userId },
        "Security audit log recorded"
      );

      return log;
    } catch (err) {
      // Never let an audit log failure crash the primary flow, but log it as critical
      logger.error({ err, params }, "CRITICAL: Failed to write audit log");
      return null;
    }
  }

  /**
   * Query recent audit logs with pagination
   */
  async findRecent(limit = 50, page = 1) {
    const skip = (page - 1) * limit;
    const [total, logs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
    ]);

    return { total, logs, page, totalPages: Math.ceil(total / limit) };
  }
}

export const auditRepository = new AuditRepository();
