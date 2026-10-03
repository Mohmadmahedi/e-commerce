import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";
import { logger } from "./logger";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: unknown;
}

/**
 * Standard success response builder
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Standard error response builder
 */
export function errorResponse(
  message: string,
  status = 500,
  code = "INTERNAL_SERVER_ERROR",
  details?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      details,
    },
    { status }
  );
}

/**
 * Higher-order API route wrapper that enforces standard error handling,
 * Zod validation parsing, and structured logging.
 */
export function apiHandler<T = unknown>(
  handler: (req: Request, context?: any) => Promise<NextResponse<ApiResponse<T>> | Response>
) {
  return async (req: Request, context?: any): Promise<Response> => {
    const startTime = Date.now();
    const url = new URL(req.url);
    const route = `${req.method} ${url.pathname}`;

    try {
      logger.info({ route, query: Object.fromEntries(url.searchParams) }, "Incoming API request");
      const response = await handler(req, context);
      const duration = Date.now() - startTime;
      logger.info({ route, status: response.status, durationMs: duration }, "API request completed");
      return response;
    } catch (err: unknown) {
      const duration = Date.now() - startTime;

      // Handle Zod Validation Errors
      if (err instanceof ZodError) {
        logger.warn({ route, errors: err.errors, durationMs: duration }, "Validation failure in request");
        return errorResponse(
          "Validation failed",
          400,
          "VALIDATION_ERROR",
          err.format()
        );
      }

      // Handle Known Domain Application Errors
      if (err instanceof AppError) {
        logger.warn(
          { route, code: err.code, statusCode: err.statusCode, message: err.message, durationMs: duration },
          "Handled domain error"
        );
        return errorResponse(err.message, err.statusCode, err.code, err.details);
      }

      // Handle Uncaught System Errors (Redacted in production)
      const errorObj = err instanceof Error ? err : new Error(String(err));
      logger.error(
        { route, error: errorObj.message, stack: errorObj.stack, durationMs: duration },
        "Unhandled critical error in API handler"
      );

      const isDev = process.env.NODE_ENV !== "production";
      return errorResponse(
        isDev ? errorObj.message : "An unexpected server error occurred. Please try again.",
        500,
        "INTERNAL_SERVER_ERROR",
        isDev ? { stack: errorObj.stack } : undefined
      );
    }
  };
}
