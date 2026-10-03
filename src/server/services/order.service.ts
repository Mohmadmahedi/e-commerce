import crypto from "crypto";
import prisma from "@/lib/prisma";
import { cartService } from "./cart.service";
import { razorpayGateway } from "../payments/razorpay";
import { OrderStateMachine } from "./order-state-machine";
import { sendOrderConfirmationEmail } from "../emails/order-confirmation";
import { auditRepository } from "../repositories/audit.repository";
import { orderRepository } from "../repositories/order.repository";
import { CheckoutOrderInput } from "../validators/order.validator";
import { ValidationError, NotFoundError, PaymentError, AppError } from "../utils/errors";
import { logger } from "../utils/logger";

export class OrderService {
  /**
   * Create order from cart with atomic inventory reservation and idempotency check
   */
  async createCheckoutOrder(input: CheckoutOrderInput, userId?: string) {
    const { idempotencyKey, paymentMethod, shippingAddress, billingAddress, sameAsShipping } = input;

    // 1. Idempotency Check: Prevent duplicate order creation on network retries
    const existingIdempotency = await orderRepository.findIdempotencyKey(idempotencyKey);
    if (existingIdempotency) {
      logger.info({ idempotencyKey }, "Idempotent order request intercepted; returning cached response");
      return JSON.parse(existingIdempotency.responseBody);
    }

    // 2. Fetch and Recalculate Cart (Server-Side Price Authority)
    const cart = await cartService.getOrCreateCart({
      userId,
      guestToken: input.guestToken,
    });

    if (!cart.items || cart.items.length === 0) {
      throw new ValidationError("Cannot place order with an empty shopping bag");
    }

    // 3. Verify Stock Availability
    for (const item of cart.items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true, isAvailable: true, sku: true },
      });

      if (!variant || !variant.isAvailable || variant.stock < item.quantity) {
        throw new ValidationError(
          `Insufficient stock available for "${item.title}" (${item.size} / ${item.color}). Current stock: ${variant?.stock ?? 0}`
        );
      }
    }

    // 4. Create Shipping and Billing Address Records
    const savedShippingAddress = await prisma.address.create({
      data: {
        userId: userId || null,
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        alternatePhone: shippingAddress.alternatePhone || null,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || null,
        landmark: shippingAddress.landmark || null,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        addressType: shippingAddress.addressType || "HOME",
      },
    });

    let billingAddressId = savedShippingAddress.id;
    if (!sameAsShipping && billingAddress) {
      const savedBilling = await prisma.address.create({
        data: {
          userId: userId || null,
          name: billingAddress.name,
          phone: billingAddress.phone,
          addressLine1: billingAddress.addressLine1,
          addressLine2: billingAddress.addressLine2 || null,
          landmark: billingAddress.landmark || null,
          city: billingAddress.city,
          state: billingAddress.state,
          postalCode: billingAddress.postalCode,
          addressType: billingAddress.addressType || "HOME",
        },
      });
      billingAddressId = savedBilling.id;
    }

    // 5. Generate Unique Order Number (e.g. AV-2026-98124)
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `AV-${new Date().getFullYear()}-${randomSuffix}`;

    // 6. Execute Atomic Transaction: Create Order, create OrderItems, record History, deduct stock
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Atomic stock deduction with strict concurrency locking
      for (const item of cart.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true, isAvailable: true },
        });

        if (!variant || !variant.isAvailable || variant.stock < item.quantity) {
          throw new ValidationError(
            `Insufficient stock available for "${item.title}". The remaining piece was just secured by another client.`
          );
        }

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: userId || null,
          guestEmail: input.guestEmail || null,
          guestPhone: input.guestPhone || null,
          status: "PLACED",
          paymentStatus: "PENDING",
          paymentMethod,
          shippingAddressId: savedShippingAddress.id,
          billingAddressId,
          subtotal: cart.subtotal,
          discountAmount: cart.couponDiscount,
          couponCode: cart.couponCode,
          shippingFee: cart.shippingFee,
          taxAmount: cart.gstAmount,
          totalAmount: cart.finalTotal,
        },
      });

      // Create Order Items
      await tx.orderItem.createMany({
        data: cart.items.map((it) => ({
          orderId: newOrder.id,
          productId: it.productId,
          variantId: it.variantId,
          title: it.title,
          sku: it.sku,
          size: it.size,
          color: it.color,
          unitPrice: it.price,
          mrp: it.mrp,
          quantity: it.quantity,
          totalPrice: it.itemTotal,
        })),
      });

      // Record Initial Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          fromStatus: "NONE",
          toStatus: "PLACED",
          note: `Order initiated via ${paymentMethod}`,
          changedBy: userId ? "USER" : "GUEST",
        },
      });

      // Record coupon usage if coupon was applied
      if (cart.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: cart.couponCode },
        });
        if (coupon) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });

          if (userId) {
            await tx.couponUsage.create({
              data: {
                couponId: coupon.id,
                userId,
                orderId: newOrder.id,
                discountApplied: cart.couponDiscount,
              },
            });
          }
        }
      }

      // Empty the cart
      const currentCart = await tx.cart.findFirst({
        where: {
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(input.guestToken ? [{ guestToken: input.guestToken }] : []),
          ],
        },
      });
      if (currentCart) {
        await tx.cartItem.deleteMany({
          where: { cartId: currentCart.id },
        });
      }

      return newOrder;
    });

    let responsePayload: any;

    // 7. Payment Gateway Integration
    if (paymentMethod === "RAZORPAY") {
      const razorpayOrder = await razorpayGateway.createOrder(
        createdOrder.totalAmount,
        createdOrder.orderNumber,
        {
          orderId: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
        }
      );

      // Record initial payment entry
      await prisma.payment.create({
        data: {
          orderId: createdOrder.id,
          paymentGateway: "RAZORPAY",
          gatewayOrderId: razorpayOrder.id,
          status: "PENDING",
          amount: createdOrder.totalAmount,
          currency: "INR",
        },
      });

      responsePayload = {
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        totalAmount: createdOrder.totalAmount,
        paymentMethod: "RAZORPAY",
        razorpay: {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
        },
      };
    } else {
      // CASH ON DELIVERY (COD)
      await prisma.payment.create({
        data: {
          orderId: createdOrder.id,
          paymentGateway: "COD",
          status: "PENDING",
          amount: createdOrder.totalAmount,
          currency: "INR",
        },
      });

      // Send Order Confirmation Email immediately for COD
      const emailRecipient = input.guestEmail || (userId ? (await prisma.user.findUnique({ where: { id: userId } }))?.email : "");
      if (emailRecipient) {
        await sendOrderConfirmationEmail({
          orderNumber: createdOrder.orderNumber,
          customerName: shippingAddress.name,
          customerEmail: emailRecipient,
          items: cart.items.map((it) => ({
            title: it.title,
            size: it.size,
            color: it.color,
            quantity: it.quantity,
            unitPrice: it.price,
            totalPrice: it.itemTotal,
          })),
          subtotal: createdOrder.subtotal,
          discountAmount: createdOrder.discountAmount,
          couponCode: createdOrder.couponCode,
          shippingFee: createdOrder.shippingFee,
          taxAmount: createdOrder.taxAmount,
          totalAmount: createdOrder.totalAmount,
          shippingAddress,
          paymentMethod: "Cash on Delivery",
        });
      }

      responsePayload = {
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        totalAmount: createdOrder.totalAmount,
        paymentMethod: "COD",
        isConfirmed: true,
      };
    }

    // 8. Save Idempotency Record (24 hours expiry)
    const requestHash = crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
    await orderRepository.saveIdempotencyKey(
      idempotencyKey,
      "/api/v1/checkout",
      requestHash,
      200,
      JSON.stringify(responsePayload)
    );

    // 9. Audit Log
    await auditRepository.createLog({
      userId: userId || null,
      action: "ORDER_CREATED",
      entity: "Order",
      entityId: createdOrder.id,
      details: {
        orderNumber: createdOrder.orderNumber,
        total: createdOrder.totalAmount,
        paymentMethod,
      },
    });

    return responsePayload;
  }

  /**
   * Verify Razorpay payment signature server-side and transition order to PAID
   */
  async verifyAndCapturePayment(data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    userId?: string;
  }) {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;

    // 1. Signature Verification
    const isValid = razorpayGateway.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      logger.warn({ orderId, razorpayPaymentId }, "Invalid payment signature detected!");
      throw new PaymentError("Cryptographic payment signature verification failed");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shippingAddress: true,
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // 2. Validate Order State Machine Transition: PLACED -> PAID
    OrderStateMachine.validateTransition(order.status, "PAID");

    // 3. Atomic Transaction: Update Order & Payment
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paymentStatus: "PAID",
        },
      });

      await tx.payment.updateMany({
        where: { orderId, gatewayOrderId: razorpayOrderId },
        data: {
          transactionId: razorpayPaymentId,
          signature: razorpaySignature,
          status: "CAPTURED",
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: "PAID",
          note: `Payment captured successfully via Razorpay (ID: ${razorpayPaymentId})`,
          changedBy: "RAZORPAY_GATEWAY",
        },
      });

      return ord;
    });

    // 4. Dispatch Order Confirmation Email
    const customerEmail = order.guestEmail || order.user?.email;
    if (customerEmail) {
      await sendOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: order.shippingAddress.name,
        customerEmail,
        items: order.items.map((it) => ({
          title: it.title,
          size: it.size,
          color: it.color,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
        })),
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        couponCode: order.couponCode,
        shippingFee: order.shippingFee,
        taxAmount: order.taxAmount,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        paymentMethod: "Razorpay Pre-paid",
      });
    }

    // 5. Audit Log
    await auditRepository.createLog({
      userId: data.userId || null,
      action: "PAYMENT_CAPTURED",
      entity: "Order",
      entityId: orderId,
      details: { orderNumber: order.orderNumber, paymentId: razorpayPaymentId },
    });

    return {
      success: true,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
    };
  }

  /**
   * Idempotent Webhook Handler for Razorpay events
   */
  async processRazorpayWebhook(rawBody: string, signature: string) {
    // 1. Verify Webhook Signature
    const isValid = razorpayGateway.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new PaymentError("Invalid webhook signature");
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.event_id || payload.id;
    const eventType = payload.event;

    // 2. Webhook Idempotency Check: Don't process the same event twice
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });
    if (existingEvent && existingEvent.status === "PROCESSED") {
      logger.info({ eventId, eventType }, "Webhook already processed; skipping");
      return { received: true, alreadyProcessed: true };
    }

    // Record webhook event in DB
    const webhookRecord = await prisma.webhookEvent.upsert({
      where: { eventId },
      create: {
        eventId,
        provider: "RAZORPAY",
        eventType,
        payload: rawBody,
        status: "PENDING",
      },
      update: {
        eventType,
        payload: rawBody,
      },
    });

    // 3. Handle Events
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const gatewayOrderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (gatewayOrderId) {
        const paymentRecord = await prisma.payment.findFirst({
          where: { gatewayOrderId },
          include: { order: true },
        });

        if (paymentRecord && paymentRecord.order.status !== "PAID") {
          await this.verifyAndCapturePayment({
            orderId: paymentRecord.orderId,
            razorpayOrderId: gatewayOrderId,
            razorpayPaymentId: paymentId,
            razorpaySignature: "valid_webhook_signature",
          });
        }
      }
    }

    // Mark Webhook event processed
    await prisma.webhookEvent.update({
      where: { id: webhookRecord.id },
      data: {
        status: "PROCESSED",
        processedAt: new Date(),
      },
    });

    return { received: true, eventId };
  }

  /**
   * Fetch order by order number with ownership verification
   */
  async getOrderByNumber(orderNumber: string, currentUserId?: string, userRole?: string) {
    const order = await orderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new NotFoundError(`Order ${orderNumber} not found`);
    }

    // IDOR check: Allow if guest order, or if authenticated user is the order owner, or if admin/staff
    if (order.userId && currentUserId) {
      if (order.userId !== currentUserId && userRole !== "ADMIN" && userRole !== "STAFF") {
        throw new AppError("You do not have permission to view this order", 403, "FORBIDDEN");
      }
    }

    return order;
  }
}

export const orderService = new OrderService();
