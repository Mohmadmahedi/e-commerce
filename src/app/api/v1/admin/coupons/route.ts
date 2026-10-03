import { apiHandler, successResponse } from "@/server/utils/response";
import { requireRole } from "@/server/middleware/auth.middleware";
import { createCouponSchema } from "@/server/validators/admin.validator";
import { adminService } from "@/server/services/admin.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/coupons
 */
export const GET = apiHandler(async () => {
  await requireRole(["ADMIN", "STAFF"]);
  const coupons = await adminService.getCoupons();
  return successResponse(coupons);
});

/**
 * POST /api/v1/admin/coupons
 */
export const POST = apiHandler(async (req: Request) => {
  const adminUser = await requireRole(["ADMIN", "STAFF"]);
  const body = await req.json();
  const validated = createCouponSchema.parse(body);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

  const coupon = await adminService.createCoupon(validated, adminUser, ip, userAgent);
  return successResponse(coupon, 201);
});
