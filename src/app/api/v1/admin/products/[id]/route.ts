import { apiHandler, successResponse } from "@/server/utils/response";
import { requireRole } from "@/server/middleware/auth.middleware";
import { updateProductSchema } from "@/server/validators/admin.validator";
import { adminService } from "@/server/services/admin.service";

export const dynamic = "force-dynamic";

/**
 * PUT /api/v1/admin/products/[id]
 */
export const PUT = apiHandler(async (req: Request, context: { params: { id: string } }) => {
  const adminUser = await requireRole(["ADMIN", "STAFF"]);
  const productId = context.params.id;
  const body = await req.json();
  const validated = updateProductSchema.parse(body);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

  const updated = await adminService.updateProduct(productId, validated, adminUser, ip, userAgent);
  return successResponse(updated);
});

/**
 * DELETE /api/v1/admin/products/[id] (Soft Archive)
 */
export const DELETE = apiHandler(async (req: Request, context: { params: { id: string } }) => {
  const adminUser = await requireRole(["ADMIN", "STAFF"]);
  const productId = context.params.id;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

  const result = await adminService.archiveProduct(productId, true, adminUser, ip, userAgent);
  return successResponse(result);
});
