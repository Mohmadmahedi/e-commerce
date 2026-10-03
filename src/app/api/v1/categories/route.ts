import { apiHandler, successResponse } from "@/server/utils/response";
import { categoryService } from "@/server/services/category.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/categories
 * Retrieves category hierarchy with product counts
 */
export const GET = apiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const gender = url.searchParams.get("gender") || undefined;

  const categories = await categoryService.getAllCategories(gender);
  return successResponse(categories);
});
