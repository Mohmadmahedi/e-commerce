import { apiHandler, successResponse } from "@/server/utils/response";
import { requireRole } from "@/server/middleware/auth.middleware";
import { adminService } from "@/server/services/admin.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const toggleCouponSchema = z.object({
  isActive: z.boolean(),
});

/**
 * PUT /api/v1/admin/coupons/[id] (Toggle Active)
 */
export const PUT = apiHandler(async (req: Request, context: { params: { id: string } }) => {
  const adminUser = await requireRole(["ADMIN", "STAFF"]);
  const couponId = context.params.id;
  const body = await req.json();
  const { isActive } = toggleCouponSchema.parse(body);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

  const updated = await adminService.toggleCoupon(couponId, isActive, adminUser, ip, userAgent);
  return successResponse(updated);
});

/**
 * DELETE /api/v1/admin/coupons/[id]
 */
export const DELETE = apiHandler(async (req: Request, context: { params: { id: string } }) => {
  const adminUser = await requireRole(["ADMIN", "STAFF"]);
  const couponId = context.params.id;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

  const result = await adminService.deleteCoupon(couponId, adminUser, ip, userAgent);
  return successResponse(result);
});
