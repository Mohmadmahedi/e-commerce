import { apiHandler, successResponse } from "@/server/utils/response";
import { requireAuth } from "@/server/middleware/auth.middleware";
import { deleteAccountSchema } from "@/server/validators/user.validator";
import { userService } from "@/server/services/user.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/user/delete-account
 * Anonymizes user details and purges private sessions under DPDP principles
 */
export const POST = apiHandler(async (req: Request) => {
  const currentUser = await requireAuth();
  const body = await req.json();
  const validated = deleteAccountSchema.parse(body);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

  const result = await userService.deleteAccount(currentUser.id, validated, ip, userAgent);
  return successResponse(result);
});
