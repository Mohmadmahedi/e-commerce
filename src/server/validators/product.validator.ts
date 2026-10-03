import { z } from "zod";
import { paginationQuerySchema } from "./pagination.validator";

export const productFilterQuerySchema = paginationQuerySchema.extend({
  category: z.string().optional(),
  gender: z.enum(["MEN", "WOMEN", "KIDS", "UNISEX"]).optional(),
  collection: z.string().optional(),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(0, parseFloat(val) || 0) : undefined)),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(0, parseFloat(val) || 0) : undefined)),
  sizes: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",").map((s) => s.trim()) : undefined)),
  colors: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",").map((c) => c.trim()) : undefined)),
  occasions: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",").map((o) => o.trim()) : undefined)),
  search: z.string().trim().optional(),
  inStockOnly: z
    .string()
    .optional()
    .transform((val) => (val ? val === "true" : undefined)),
  isFeatured: z
    .string()
    .optional()
    .transform((val) => (val ? val === "true" : undefined)),
  isNewArrival: z
    .string()
    .optional()
    .transform((val) => (val ? val === "true" : undefined)),
  isBestSeller: z
    .string()
    .optional()
    .transform((val) => (val ? val === "true" : undefined)),
});

export type ProductFilterQuery = z.infer<typeof productFilterQuerySchema>;

export const createProductVariantSchema = z.object({
  sku: z.string().min(3).max(50),
  size: z.string().min(1).max(20),
  color: z.string().min(1).max(50),
  colorHex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid Hex color"),
  price: z.number().positive("Price must be greater than 0"),
  mrp: z.number().positive("MRP must be greater than 0"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
  isAvailable: z.boolean().default(true),
});

export const createProductSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().min(10),
  fabricCare: z.string().optional(),
  occasion: z.string().optional(),
  fit: z.string().optional(),
  basePrice: z.number().positive(),
  baseMrp: z.number().positive(),
  discountPercent: z.number().int().min(0).max(99).default(0),
  categoryId: z.string().cuid(),
  collectionId: z.string().cuid().optional(),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().optional(),
        isPrimary: z.boolean().default(false),
      })
    )
    .min(1, "At least one product image is required"),
  variants: z.array(createProductVariantSchema).min(1, "At least one product variant is required"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
