import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/auth.middleware";
import { userService } from "@/server/services/user.service";
import { errorResponse } from "@/server/utils/response";
import { logger } from "@/server/utils/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/user/export-data
 * Downloads complete JSON data export under DPDP Act principles
 */
export async function GET(req: Request) {
  try {
    const currentUser = await requireAuth();

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    const exportData = await userService.exportUserData(currentUser.id, ip, userAgent);

    const filename = `avanya_user_data_${currentUser.id.slice(0, 8)}_${new Date().toISOString().split("T")[0]}.json`;

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: any) {
    logger.error({ err }, "DPDP data export failed");
    return errorResponse(err.message || "Failed to export data", err.statusCode || 500, err.code);
  }
}
