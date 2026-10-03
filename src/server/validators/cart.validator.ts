import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().cuid("Invalid product identifier"),
  variantId: z.string().cuid("Invalid variant identifier"),
  quantity: z.number().int().min(1, "Minimum quantity is 1").max(10, "Maximum 10 items per order"),
  guestToken: z.string().optional(),
});

export const updateCartItemSchema = z.object({
  itemId: z.string().cuid("Invalid cart item identifier"),
  quantity: z.number().int().min(0, "Quantity cannot be negative").max(10, "Maximum 10 items per order"),
  guestToken: z.string().optional(),
});

export const applyCouponSchema = z.object({
  code: z.string().min(3).max(30).trim().toUpperCase(),
  guestToken: z.string().optional(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
