import { apiHandler, successResponse } from "@/server/utils/response";
import { requireAuth } from "@/server/middleware/auth.middleware";
import { addressSchema } from "@/server/validators/user.validator";
import { userService } from "@/server/services/user.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/user/addresses
 */
export const GET = apiHandler(async () => {
  const currentUser = await requireAuth();
  const addresses = await userService.getAddresses(currentUser.id);
  return successResponse(addresses);
});

/**
 * POST /api/v1/user/addresses
 */
export const POST = apiHandler(async (req: Request) => {
  const currentUser = await requireAuth();
  const body = await req.json();
  const validated = addressSchema.parse(body);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

  const address = await userService.createAddress(currentUser.id, validated, ip, userAgent);
  return successResponse(address, 201);
});
