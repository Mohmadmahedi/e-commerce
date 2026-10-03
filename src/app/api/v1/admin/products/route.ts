import { apiHandler, successResponse } from "@/server/utils/response";
import { requireRole } from "@/server/middleware/auth.middleware";
import { createProductSchema } from "@/server/validators/admin.validator";
import { adminService } from "@/server/services/admin.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/products
 */
export const GET = apiHandler(async (req: Request) => {
  await requireRole(["ADMIN", "STAFF"]);
  const url = new URL(req.url);

  const search = url.searchParams.get("search") || undefined;
  const categoryId = url.searchParams.get("categoryId") || undefined;
  const isArchived = url.searchParams.has("isArchived")
    ? url.searchParams.get("isArchived") === "true"
    : undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 100);

  const result = await adminService.getProducts({
    search,
    categoryId,
    isArchived,
    page,
    limit,
  });

  return successResponse(result);
});

/**
 * POST /api/v1/admin/products
 */
export const POST = apiHandler(async (req: Request) => {
  const adminUser = await requireRole(["ADMIN", "STAFF"]);
  const body = await req.json();
  const validated = createProductSchema.parse(body);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

  const product = await adminService.createProduct(validated, adminUser, ip, userAgent);
  return successResponse(product, 201);
});
