import { apiHandler, successResponse } from "@/server/utils/response";
import { checkoutOrderSchema } from "@/server/validators/order.validator";
import { orderService } from "@/server/services/order.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/checkout
 * Creates order with atomic stock deduction and idempotency verification
 */
export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();
  const input = checkoutOrderSchema.parse(body);

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const result = await orderService.createCheckoutOrder(input, userId);
  return successResponse(result, 201);
});
