import { apiHandler, successResponse } from "@/server/utils/response";
import { requireAuth } from "@/server/middleware/auth.middleware";
import { addressSchema } from "@/server/validators/user.validator";
import { userService } from "@/server/services/user.service";

export const dynamic = "force-dynamic";

/**
 * PUT /api/v1/user/addresses/[id]
 */
export const PUT = apiHandler(async (req: Request, context: { params: { id: string } }) => {
  const currentUser = await requireAuth();
  const addressId = context.params.id;
  const body = await req.json();
  const validated = addressSchema.partial().parse(body);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

  const updated = await userService.updateAddress(currentUser.id, addressId, validated, ip, userAgent);
  return successResponse(updated);
});

/**
 * DELETE /api/v1/user/addresses/[id]
 */
export const DELETE = apiHandler(async (req: Request, context: { params: { id: string } }) => {
  const currentUser = await requireAuth();
  const addressId = context.params.id;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

  const result = await userService.deleteAddress(currentUser.id, addressId, ip, userAgent);
  return successResponse(result);
});
