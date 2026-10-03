import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimiter, RATE_LIMIT_PRESETS } from "./server/utils/rate-limiter";

/**
 * Global Edge Security & Rate Limiting Middleware
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  // 1. Handle CORS Preflight for API Routes
  if (pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With, Idempotency-Key",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 2. Route-Specific Rate Limiting
    let limitRule = RATE_LIMIT_PRESETS.GENERAL_API;
    let limitAction = "api_general";

    if (pathname.includes("/auth/login")) {
      limitRule = RATE_LIMIT_PRESETS.AUTH_LOGIN;
      limitAction = "login";
    } else if (pathname.includes("/auth/register")) {
      limitRule = RATE_LIMIT_PRESETS.AUTH_REGISTER;
      limitAction = "register";
    } else if (pathname.includes("/checkout")) {
      limitRule = RATE_LIMIT_PRESETS.CHECKOUT;
      limitAction = "checkout";
    } else if (pathname.includes("/cart/coupon")) {
      limitRule = RATE_LIMIT_PRESETS.COUPON_APPLY;
      limitAction = "coupon";
    } else if (pathname.includes("/uploads")) {
      limitRule = RATE_LIMIT_PRESETS.UPLOADS;
      limitAction = "upload";
    }

    const rateKey = `${limitAction}:${ip}`;
    const rateCheck = await rateLimiter.consume(rateKey, limitRule);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many requests for action "${limitAction}". Please retry in ${rateCheck.retryAfterSeconds} seconds.`,
          code: "RATE_LIMIT_EXCEEDED",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfterSeconds || 60),
            "X-RateLimit-Limit": String(rateCheck.limit),
            "X-RateLimit-Remaining": String(rateCheck.remaining),
            "X-RateLimit-Reset": String(rateCheck.resetTime),
          },
        }
      );
    }

    // Proceed with request and inject RateLimit headers
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(rateCheck.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateCheck.remaining));
    response.headers.set("X-RateLimit-Reset", String(rateCheck.resetTime));
    response.headers.set("Access-Control-Allow-Origin", "*");

    return response;
  }

  return NextResponse.next();
}

/**
 * Configure matching paths: runs on all API routes and account/admin pages
 */
export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/account/:path*",
    "/auth/:path*",
  ],
};
