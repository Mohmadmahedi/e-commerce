import { apiHandler, successResponse } from "@/server/utils/response";
import { requireRole } from "@/server/middleware/auth.middleware";
import { adminService } from "@/server/services/admin.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/orders
 */
export const GET = apiHandler(async (req: Request) => {
  await requireRole(["ADMIN", "STAFF"]);
  const url = new URL(req.url);

  const status = url.searchParams.get("status") || undefined;
  const search = url.searchParams.get("search") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 100);

  const result = await adminService.getOrders({
    status,
    search,
    page,
    limit,
  });

  return successResponse(result);
});
