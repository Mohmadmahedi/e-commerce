import { apiHandler, successResponse } from "@/server/utils/response";
import { requireRole } from "@/server/middleware/auth.middleware";
import { updateOrderStatusSchema } from "@/server/validators/admin.validator";
import { adminService } from "@/server/services/admin.service";

export const dynamic = "force-dynamic";

/**
 * PUT /api/v1/admin/orders/[id]
 * Updates order status with state machine enforcement and optional tracking info
 */
export const PUT = apiHandler(async (req: Request, context: { params: { id: string } }) => {
  const adminUser = await requireRole(["ADMIN", "STAFF"]);
  const orderId = context.params.id;
  const body = await req.json();
  const validated = updateOrderStatusSchema.parse(body);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

  const updated = await adminService.updateOrderStatus(orderId, validated, adminUser, ip, userAgent);
  return successResponse(updated);
});
