import { apiHandler, successResponse } from "@/server/utils/response";
import { requireAuth } from "@/server/middleware/auth.middleware";
import { updateProfileSchema } from "@/server/validators/user.validator";
import { userService } from "@/server/services/user.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/user/profile
 */
export const GET = apiHandler(async () => {
  const currentUser = await requireAuth();
  const profile = await userService.getProfile(currentUser.id);
  return successResponse(profile);
});

/**
 * PUT /api/v1/user/profile
 */
export const PUT = apiHandler(async (req: Request) => {
  const currentUser = await requireAuth();
  const body = await req.json();
  const validated = updateProfileSchema.parse(body);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

  const updated = await userService.updateProfile(currentUser.id, validated, ip, userAgent);
  return successResponse(updated);
});
