import { apiHandler, successResponse } from "@/server/utils/response";
import { registerSchema } from "@/server/validators/auth.validator";
import { authService } from "@/server/services/auth.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/auth/register
 * Public registration endpoint with strict password policy and audit logging
 */
export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();
  const input = registerSchema.parse(body);

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

  const user = await authService.registerUser(input, ip, userAgent);

  return successResponse(
    {
      message: "Account created successfully. You may now sign in.",
      user,
    },
    201
  );
});
