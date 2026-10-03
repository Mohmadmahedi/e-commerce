import { apiHandler, successResponse, errorResponse } from "@/server/utils/response";
import { requireAuth } from "@/server/middleware/auth.middleware";
import { saveUploadedFile } from "@/server/utils/file-upload";
import { rateLimiter, RATE_LIMIT_PRESETS } from "@/server/utils/rate-limiter";
import { auditRepository } from "@/server/repositories/audit.repository";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/uploads
 * Accepts multipart/form-data with a "file" field
 */
export const POST = apiHandler(async (req: Request) => {
  const currentUser = await requireAuth();

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

  // Rate Limiting: 20 uploads per 15 minutes per user/IP
  const rateLimitKey = `upload:${currentUser.id || ip}`;
  const rateResult = await rateLimiter.consume(rateLimitKey, RATE_LIMIT_PRESETS.UPLOADS);

  if (!rateResult.allowed) {
    return errorResponse(
      `Upload rate limit exceeded. Try again in ${rateResult.retryAfterSeconds} seconds.`,
      429,
      "RATE_LIMIT_EXCEEDED"
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return errorResponse("No file provided in form field 'file'", 400, "MISSING_FILE");
  }

  const result = await saveUploadedFile(file);

  await auditRepository.createLog({
    userId: currentUser.id,
    action: "FILE_UPLOADED",
    entity: "File",
    details: { filename: result.filename, mimeType: result.mimeType, sizeBytes: result.sizeBytes },
    ipAddress: ip,
    userAgent,
  });

  return successResponse(result, 201);
});
