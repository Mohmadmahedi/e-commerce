import { apiHandler, successResponse } from "@/server/utils/response";
import { authService } from "@/server/services/auth.service";
import { requireAuth } from "@/server/middleware/auth.middleware";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/auth/logout-all
 * Authenticated endpoint: revokes all active database sessions for the current user
 */
export const POST = apiHandler(async (req: Request) => {
  const currentUser = await requireAuth();

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

  const result = await authService.logoutAllDevices(currentUser.id, ip, userAgent);

  return successResponse({
    message: "Successfully logged out from all devices.",
    sessionsRevoked: result.count,
  });
});
