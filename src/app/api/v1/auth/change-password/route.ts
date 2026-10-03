import { apiHandler, successResponse } from "@/server/utils/response";
import { changePasswordSchema } from "@/server/validators/auth.validator";
import { authService } from "@/server/services/auth.service";
import { requireAuth } from "@/server/middleware/auth.middleware";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/auth/change-password
 * Authenticated endpoint: changes password and immediately revokes all active sessions across devices
 */
export const POST = apiHandler(async (req: Request) => {
  const currentUser = await requireAuth();

  const body = await req.json();
  const input = changePasswordSchema.parse(body);

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

  await authService.changePassword(currentUser.id, input, ip, userAgent);

  return successResponse({
    message: "Password changed successfully. All other active sessions have been revoked for your security.",
  });
});
