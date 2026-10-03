import { apiHandler, successResponse } from "@/server/utils/response";
import { applyCouponSchema } from "@/server/validators/cart.validator";
import { cartService } from "@/server/services/cart.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/cart/coupon
 * Validates and applies coupon code to cart with minimum amount and expiry checks
 */
export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();
  const input = applyCouponSchema.parse(body);

  const cart = await cartService.applyCoupon(input.code, {
    guestToken: input.guestToken,
  });

  return successResponse(cart);
});

/**
 * DELETE /api/v1/cart/coupon
 * Removes applied coupon from cart
 */
export const DELETE = apiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const guestToken = url.searchParams.get("guestToken") || undefined;

  const cart = await cartService.removeCoupon({ guestToken });
  return successResponse(cart);
});
