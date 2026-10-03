import { prisma } from "../../src/lib/prisma";
import { orderService } from "../../src/server/services/order.service";
import { cartService } from "../../src/server/services/cart.service";
import { PaymentError } from "../../src/server/utils/errors";

export async function runCheckoutAndPaymentTests() {
  console.log("\n--- [INTEGRATION TESTS] End-to-End Checkout & Razorpay Flow ---");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  [✓] PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  [✗] FAIL: ${testName}`);
      failed++;
    }
  }

  // Find demo customer
  const customer = await prisma.user.findUnique({
    where: { email: "ananya@example.com" },
  });

  if (!customer) {
    throw new Error("Demo customer ananya@example.com missing from database. Run seed first.");
  }

  // Find an active product variant with ample stock
  const variant = await prisma.productVariant.findFirst({
    where: {
      isAvailable: true,
      stock: { gte: 5 },
      product: { isArchived: false },
    },
    include: { product: true },
  });

  if (!variant) {
    throw new Error("No active product variant with sufficient stock found for testing.");
  }

  const testGuestToken = `guest_test_${Date.now()}`;

  // 1. ADD ITEM TO CART & VERIFY CART CALCULATION
  const cart = await cartService.addToCart({
    productId: variant.productId,
    variantId: variant.id,
    quantity: 1,
    userId: customer.id,
  });

  assert(cart.items.length >= 1, "Cart: Successfully added luxury garment to bag");
  assert(cart.subtotal > 0, `Cart: Subtotal calculated dynamically (₹${cart.subtotal})`);

  // 2. CHECKOUT ORDER CREATION WITH RAZORPAY
  const checkoutPayload = {
    idempotencyKey: `idem_test_${Date.now()}_${Math.random()}`,
    paymentMethod: "RAZORPAY" as const,
    shippingAddress: {
      name: "Ananya Roy",
      phone: "9876543210",
      addressLine1: "Villa 101, Golf Links",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
      addressType: "HOME" as const,
    },
    sameAsShipping: true,
  };

  const initialStock = variant.stock;
  const orderResult = await orderService.createCheckoutOrder(checkoutPayload, customer.id);

  assert(Boolean(orderResult.orderId), `Order: Checkout order created (${orderResult.orderNumber})`);
  assert(orderResult.paymentMethod === "RAZORPAY", "Order: Payment gateway assigned to RAZORPAY");
  assert(Boolean(orderResult.razorpay?.orderId), `Razorpay: Gateway Order ID generated (${orderResult.razorpay?.orderId})`);

  // Verify stock was decremented atomically
  const updatedVariant = await prisma.productVariant.findUnique({
    where: { id: variant.id },
  });
  assert(
    updatedVariant?.stock === initialStock - 1,
    `Inventory: Atomic decrement confirmed (From ${initialStock} to ${updatedVariant?.stock})`
  );

  // 3. TAMPERED PAYMENT SIGNATURE VERIFICATION (SECURITY NEGATIVE TEST)
  let tamperCaught = false;
  try {
    await orderService.verifyAndCapturePayment({
      orderId: orderResult.orderId,
      razorpayOrderId: orderResult.razorpay.orderId,
      razorpayPaymentId: "pay_tampered_fake_123",
      razorpaySignature: "invalid_hacked_signature_string",
      userId: customer.id,
    });
  } catch (err) {
    if (err instanceof PaymentError) {
      tamperCaught = true;
    }
  }
  assert(tamperCaught, "Security: Tampered payment signature strictly rejected with PaymentError");

  // 4. VALID PAYMENT SIGNATURE CAPTURE & ORDER TRANSITION TO PAID
  const validCaptureResult = await orderService.verifyAndCapturePayment({
    orderId: orderResult.orderId,
    razorpayOrderId: orderResult.razorpay.orderId,
    razorpayPaymentId: "pay_verified_test_123",
    razorpaySignature: "sig_test_authentic_payment_signature",
    userId: customer.id,
  });

  assert(validCaptureResult.success, "Payment: Valid cryptographic signature accepted");
  assert(validCaptureResult.status === "PAID", "Order State Machine: Order status transitioned to PAID");

  // Verify in database that paymentStatus is PAID
  const capturedOrder = await prisma.order.findUnique({
    where: { id: orderResult.orderId },
  });
  assert(capturedOrder?.paymentStatus === "PAID", "Payment Record: PaymentStatus confirmed as PAID in database");

  // Clean up test order to preserve test database state
  await prisma.orderStatusHistory.deleteMany({ where: { orderId: orderResult.orderId } });
  await prisma.payment.deleteMany({ where: { orderId: orderResult.orderId } });
  await prisma.orderItem.deleteMany({ where: { orderId: orderResult.orderId } });
  await prisma.order.delete({ where: { id: orderResult.orderId } });
  // Restore variant stock
  await prisma.productVariant.update({
    where: { id: variant.id },
    data: { stock: initialStock },
  });

  if (failed > 0) {
    throw new Error(`${failed} integration tests failed`);
  }
  return { passed, failed };
}

if (require.main === module) {
  runCheckoutAndPaymentTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
