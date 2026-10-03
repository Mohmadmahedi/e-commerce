import { apiHandler, successResponse } from "@/server/utils/response";
import { requireRole } from "@/server/middleware/auth.middleware";
import { adminService } from "@/server/services/admin.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/dashboard
 * Protected: ADMIN & STAFF only
 */
export const GET = apiHandler(async () => {
  await requireRole(["ADMIN", "STAFF"]);
  const dashboard = await adminService.getDashboard();
  return successResponse(dashboard);
});
