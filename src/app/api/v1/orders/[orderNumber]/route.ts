import { apiHandler, successResponse, errorResponse } from "@/server/utils/response";
import { orderService } from "@/server/services/order.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/orders/[orderNumber]
 * Fetches a single order with IDOR ownership verification.
 * Accessible by: order owner, admin, staff, or guest orders (no userId).
 */
export const GET = apiHandler(async (req: Request, context: { params: Promise<{ orderNumber: string }> }) => {
  const { orderNumber } = await context.params;
  
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;
  const userRole = session?.user?.role;

  const order = await orderService.getOrderByNumber(orderNumber, currentUserId, userRole);

  return successResponse(order, 200);
});
