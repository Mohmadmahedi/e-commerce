import { NextResponse } from "next/server";
import { orderService } from "@/server/services/order.service";
import { logger } from "@/server/utils/logger";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/webhooks/razorpay
 * 
 * Receives Razorpay server-to-server webhook events.
 * 
 * Security:
 * - Reads raw body to preserve signature integrity (no JSON middleware corruption).
 * - HMAC-SHA256 signature verified against RAZORPAY_WEBHOOK_SECRET.
 * - Idempotent: duplicate event_id deliveries are safely ignored.
 * - No auth middleware — webhook endpoints are unauthenticated by design;
 *   cryptographic signature is the sole trust boundary.
 */
export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    // 1. Read raw body bytes for signature verification (must NOT parse JSON first)
    const rawBody = await req.text();

    // 2. Extract Razorpay signature header
    const signature = req.headers.get("x-razorpay-signature") || "";

    if (!signature) {
      logger.warn("Razorpay webhook received without signature header");
      return NextResponse.json(
        { received: false, error: "Missing signature" },
        { status: 401 }
      );
    }

    // 3. Process through idempotent webhook handler (verifies signature internally)
    const result = await orderService.processRazorpayWebhook(rawBody, signature);

    const duration = Date.now() - startTime;
    logger.info(
      { eventId: result.eventId, alreadyProcessed: result.alreadyProcessed, durationMs: duration },
      "Razorpay webhook processed"
    );

    // Always return 200 to Razorpay to prevent retries on successfully processed events
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: unknown) {
    const duration = Date.now() - startTime;
    const message = err instanceof Error ? err.message : String(err);

    // Log the error with full context but return 400 to signal invalid payload
    logger.error(
      { error: message, durationMs: duration },
      "Razorpay webhook processing failed"
    );

    // Return 400 for signature failures so Razorpay retries with backoff
    const isSignatureError = message.includes("signature");
    return NextResponse.json(
      { received: false, error: "Webhook processing failed" },
      { status: isSignatureError ? 401 : 500 }
    );
  }
}
