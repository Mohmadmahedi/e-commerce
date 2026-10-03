import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthError, ForbiddenError } from "../utils/errors";
import { auditRepository } from "../repositories/audit.repository";

export type Role = "CUSTOMER" | "STAFF" | "ADMIN";

export interface AuthenticatedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  phone?: string | null;
}

/**
 * Enforces that a request has a valid authenticated session.
 * Throws AuthError if not logged in.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    throw new AuthError("Authentication required to access this resource");
  }

  return session.user as AuthenticatedUser;
}

/**
 * Enforces Role-Based Access Control (RBAC) on the server.
 * Throws ForbiddenError if user does not hold an authorized role.
 */
export async function requireRole(allowedRoles: Role[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    // Record unauthorized access attempt in security audit log
    await auditRepository.createLog({
      userId: user.id,
      action: "UNAUTHORIZED_ROLE_ACCESS_ATTEMPT",
      entity: "RBAC_Guard",
      details: { userRole: user.role, requiredRoles: allowedRoles },
    });

    throw new ForbiddenError(
      `Access denied. Requires one of roles: [${allowedRoles.join(", ")}]. Current role: ${user.role}`
    );
  }

  return user;
}

/**
 * Prevents Insecure Direct Object Reference (IDOR).
 * Ensures that customers can only view/mutate resources they own.
 * Administrators and authorized staff are permitted bypass access.
 */
export function requireOwnership(
  resourceOwnerId: string | null | undefined,
  currentUser: AuthenticatedUser,
  resourceName = "Resource"
): void {
  if (currentUser.role === "ADMIN" || currentUser.role === "STAFF") {
    return; // Staff & Admins possess organizational read/modify rights
  }

  if (!resourceOwnerId || resourceOwnerId !== currentUser.id) {
    throw new ForbiddenError(
      `IDOR Protection: You are not authorized to access or modify this ${resourceName}`
    );
  }
}
