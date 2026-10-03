import { apiHandler, successResponse } from "@/server/utils/response";
import { productService } from "@/server/services/product.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/products/[slug]
 * Retrieves product detail by slug with variants, images, category, and approved reviews
 */
export const GET = apiHandler(async (_req: Request, context: { params: { slug: string } }) => {
  const { slug } = context.params;
  const product = await productService.getProductBySlug(slug);
  return successResponse(product);
});
