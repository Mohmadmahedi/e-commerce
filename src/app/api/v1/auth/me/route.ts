import { apiHandler, successResponse } from "@/server/utils/response";
import { requireAuth } from "@/server/middleware/auth.middleware";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/auth/me
 * Authenticated endpoint: returns profile, role, addresses, and order counts
 */
export const GET = apiHandler(async () => {
  const currentUser = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      twoFactorEnabled: true,
      createdAt: true,
      addresses: {
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      },
      _count: {
        select: {
          orders: true,
          wishlist: true,
          reviews: true,
        },
      },
    },
  });

  return successResponse(user);
});
