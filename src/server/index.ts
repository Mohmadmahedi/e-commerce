/**
 * Server Layer Architecture:
 * - Route Handler/Server Action -> Zod validator -> Service (business logic) -> Repository (Prisma) -> Database
 * - Zero direct database operations or business logic in API route handlers
 */

export const SERVER_LAYERS = {
  SERVICES: "src/server/services",
  REPOSITORIES: "src/server/repositories",
  VALIDATORS: "src/server/validators",
  MIDDLEWARE: "src/server/middleware",
  JOBS: "src/server/jobs",
  EMAILS: "src/server/emails",
  PAYMENTS: "src/server/payments",
  UTILS: "src/server/utils",
} as const;
