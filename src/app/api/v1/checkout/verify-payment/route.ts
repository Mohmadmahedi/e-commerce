import { apiHandler, successResponse, errorResponse } from "@/server/utils/response";
import { orderService } from "@/server/services/order.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  razorpayOrderId: z.string().min(1, "Razorpay Order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay Payment ID is required"),
  razorpaySignature: z.string().min(1, "Payment signature is required"),
});

/**
 * POST /api/v1/checkout/verify-payment
 * Verifies Razorpay payment signature and captures the order.
 * Called from the frontend after Razorpay Checkout SDK returns success.
 */
export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();
  const input = verifyPaymentSchema.parse(body);

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const result = await orderService.verifyAndCapturePayment({
    orderId: input.orderId,
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    razorpaySignature: input.razorpaySignature,
    userId,
  });

  return successResponse(result, 200);
});
