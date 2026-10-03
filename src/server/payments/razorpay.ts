import crypto from "crypto";
import { logger } from "../utils/logger";
import { PaymentError } from "../utils/errors";

export interface CreateRazorpayOrderResult {
  id: string; // razorpay_order_id
  amount: number; // In paise (amount * 100)
  currency: string;
  receipt: string;
}

export class RazorpayGateway {
  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;
  private readonly isMockMode: boolean;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    // If placeholder keys are configured, mock gateway runs safely for zero-friction testing
    this.isMockMode =
      !this.keyId ||
      !this.keySecret ||
      this.keyId.includes("placeholder") ||
      this.keySecret.includes("placeholder");

    if (this.isMockMode) {
      logger.warn("Razorpay running in verified local test/mock mode with realistic signatures.");
    }
  }

  /**
   * Create an official order on Razorpay server-side
   */
  async createOrder(
    amountInRupees: number,
    receipt: string,
    notes: Record<string, string> = {}
  ): Promise<CreateRazorpayOrderResult> {
    const amountInPaise = Math.round(amountInRupees * 100);

    if (this.isMockMode) {
      const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      logger.info({ mockOrderId, amountInPaise, receipt }, "Mock Razorpay order initialized");
      return {
        id: mockOrderId,
        amount: amountInPaise,
        currency: "INR",
        receipt,
      };
    }

    try {
      const authHeader = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        logger.error({ data }, "Razorpay API order creation failed");
        throw new PaymentError(data.error?.description || "Failed to create payment order");
      }

      return {
        id: data.id,
        amount: data.amount,
        currency: data.currency,
        receipt: data.receipt,
      };
    } catch (err: any) {
      if (err instanceof PaymentError) throw err;
      logger.error({ err }, "Razorpay connection error");
      throw new PaymentError("Payment gateway connection error");
    }
  }

  /**
   * Cryptographically verify payment signature returned by Razorpay Checkout
   * Formula: hmac_sha256(order_id + "|" + payment_id, secret) == signature
   */
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!orderId || !paymentId || !signature) return false;

    if (this.isMockMode) {
      // In mock mode, signatures ending with "valid" or matches generated token are accepted
      if (signature.startsWith("sig_test_") || signature === "valid_test_signature") {
        return true;
      }
    }

    try {
      const text = `${orderId}|${paymentId}`;
      const secret = this.keySecret || "mock_secret";
      const expectedSignature = crypto.createHmac("sha256", secret).update(text).digest("hex");

      const expectedBuffer = Buffer.from(expectedSignature);
      const signatureBuffer = Buffer.from(signature);

      if (expectedBuffer.length !== signatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    } catch (err) {
      logger.error({ err }, "Signature verification error");
      return false;
    }
  }

  /**
   * Cryptographically verify Webhook signature
   * Formula: hmac_sha256(rawBody, webhookSecret) == signature
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!rawBody || !signature) return false;

    if (this.isMockMode) {
      if (signature.startsWith("sig_wh_") || signature === "valid_webhook_signature") {
        return true;
      }
    }

    try {
      const secret = this.webhookSecret || "mock_webhook_secret";
      const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
      const expectedBuf = Buffer.from(expected);
      const actualBuf = Buffer.from(signature);

      if (expectedBuf.length !== actualBuf.length) return false;
      return crypto.timingSafeEqual(expectedBuf, actualBuf);
    } catch (err) {
      return false;
    }
  }
}

export const razorpayGateway = new RazorpayGateway();
