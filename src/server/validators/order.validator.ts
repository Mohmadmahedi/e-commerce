import { z } from "zod";

export const addressSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(100),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  alternatePhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number")
    .optional()
    .or(z.literal("")),
  addressLine1: z.string().min(5, "Flat / House No. / Building is required").max(200),
  addressLine2: z.string().max(200).optional(),
  landmark: z.string().max(100).optional(),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  postalCode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit Indian PIN code"),
  addressType: z.enum(["HOME", "WORK", "OTHER"]).default("HOME"),
  isDefault: z.boolean().default(false),
});

export const checkoutOrderSchema = z.object({
  cartId: z.string().cuid().optional(),
  guestToken: z.string().optional(),
  guestEmail: z.string().email("Valid email required for guest checkout").optional(),
  guestPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Valid 10-digit phone required")
    .optional(),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  sameAsShipping: z.boolean().default(true),
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  idempotencyKey: z.string().min(16, "Idempotency key required to prevent double-charging"),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutOrderInput = z.infer<typeof checkoutOrderSchema>;
