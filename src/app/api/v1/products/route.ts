import { apiHandler, successResponse } from "@/server/utils/response";
import { productFilterQuerySchema } from "@/server/validators/product.validator";
import { productService } from "@/server/services/product.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/products
 * Query params validated by Zod: page, limit, sortBy, category, gender, minPrice, maxPrice, search, inStockOnly, etc.
 */
export const GET = apiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const rawQuery = Object.fromEntries(url.searchParams.entries());

  // 1. Zod Validation on input query
  const validatedQuery = productFilterQuerySchema.parse(rawQuery);

  // 2. Service Layer (Business Logic)
  const result = await productService.getProducts(validatedQuery);

  // 3. Standardized Response Format
  return successResponse(result);
});
