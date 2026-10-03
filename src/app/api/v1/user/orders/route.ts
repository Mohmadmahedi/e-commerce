import { apiHandler, successResponse } from "@/server/utils/response";
import { requireAuth } from "@/server/middleware/auth.middleware";
import { userService } from "@/server/services/user.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/user/orders?page=1&limit=10
 */
export const GET = apiHandler(async (req: Request) => {
  const currentUser = await requireAuth();
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "10", 10), 50);

  const result = await userService.getUserOrders(currentUser.id, page, limit);
  return successResponse(result);
});
