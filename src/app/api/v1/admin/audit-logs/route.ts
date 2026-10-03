import { apiHandler, successResponse } from "@/server/utils/response";
import { requireRole } from "@/server/middleware/auth.middleware";
import { adminService } from "@/server/services/admin.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/audit-logs
 * Protected: ADMIN & STAFF only
 */
export const GET = apiHandler(async (req: Request) => {
  await requireRole(["ADMIN", "STAFF"]);
  const url = new URL(req.url);

  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);

  const logs = await adminService.getAuditLogs(limit, page);
  return successResponse(logs);
});
