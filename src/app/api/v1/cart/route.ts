import { apiHandler, successResponse } from "@/server/utils/response";
import { addToCartSchema, updateCartItemSchema } from "@/server/validators/cart.validator";
import { cartService } from "@/server/services/cart.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/cart
 * Fetch cart for guestToken or userId
 */
export const GET = apiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const guestToken = url.searchParams.get("guestToken") || undefined;
  const userId = url.searchParams.get("userId") || undefined;

  const cart = await cartService.getOrCreateCart({ userId, guestToken });
  return successResponse(cart);
});

/**
 * POST /api/v1/cart
 * Add item to cart with inventory verification
 */
export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();
  const input = addToCartSchema.parse(body);

  const cart = await cartService.addToCart({
    productId: input.productId,
    variantId: input.variantId,
    quantity: input.quantity,
    guestToken: input.guestToken,
  });

  return successResponse(cart, 201);
});

/**
 * PATCH /api/v1/cart
 * Update cart item quantity
 */
export const PATCH = apiHandler(async (req: Request) => {
  const body = await req.json();
  const input = updateCartItemSchema.parse(body);

  const cart = await cartService.updateQuantity(input.itemId, input.quantity, {
    guestToken: input.guestToken,
  });

  return successResponse(cart);
});

/**
 * DELETE /api/v1/cart
 * Remove item from cart
 */
export const DELETE = apiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const itemId = url.searchParams.get("itemId");
  const guestToken = url.searchParams.get("guestToken") || undefined;

  if (!itemId) {
    throw new Error("itemId parameter is required");
  }

  const cart = await cartService.removeItem(itemId, { guestToken });
  return successResponse(cart);
});
