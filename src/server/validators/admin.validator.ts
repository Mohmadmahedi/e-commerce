import { z } from "zod";

/**
 * Product creation / editing validator for Admin Atelier
 */
export const createProductSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  slug: z
    .string()
    .min(3)
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  fabricCare: z.string().optional().or(z.literal("")),
  occasion: z.string().optional().or(z.literal("")),
  fit: z.string().optional().or(z.literal("")),
  basePrice: z.number().positive("Base price must be positive"),
  baseMrp: z.number().positive("MRP must be positive"),
  discountPercent: z.number().int().min(0).max(100).default(0),
  categoryId: z.string().min(1, "Category is required"),
  collectionId: z.string().optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  images: z
    .array(
      z.object({
        url: z.string().url("Valid image URL required"),
        alt: z.string().optional().or(z.literal("")),
        isPrimary: z.boolean().default(false),
      })
    )
    .min(1, "At least one product image is required"),
  variants: z
    .array(
      z.object({
        sku: z.string().min(3, "SKU required"),
        size: z.string().min(1, "Size is required"),
        color: z.string().min(1, "Color is required"),
        colorHex: z.string().default("#0B5D4B"),
        price: z.number().positive(),
        mrp: z.number().positive(),
        stock: z.number().int().min(0, "Stock cannot be negative"),
      })
    )
    .min(1, "At least one product variant (size/color) is required"),
});

export const updateProductSchema = createProductSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

export const updateOrderStatusSchema = z.object({
  toStatus: z.enum([
    "PLACED",
    "PAID",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
    "REFUNDED",
  ]),
  note: z.string().max(300).optional(),
  courierName: z.string().max(100).optional(),
  trackingNumber: z.string().max(100).optional(),
  estimatedDelivery: z.string().optional(),
});

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(30)
    .toUpperCase()
    .regex(/^[A-Z0-9_-]+$/, "Code must be uppercase alphanumeric with dashes/underscores"),
  description: z.string().min(5).max(200),
  discountType: z.enum(["PERCENTAGE", "FLAT"]),
  discountValue: z.number().positive("Discount value must be greater than zero"),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscountAmount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().default(1),
  isActive: z.boolean().default(true),
  expiresAt: z.string().datetime().optional().nullable(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
