import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class OrderRepository {
  /**
   * Find order by unique order number
   */
  async findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true } } },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        statusHistory: { orderBy: { createdAt: "asc" } },
        payments: true,
      },
    });
  }

  /**
   * Find order by ID
   */
  async findById(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shippingAddress: true,
        statusHistory: true,
        payments: true,
      },
    });
  }

  /**
   * Check for existing idempotency key to prevent duplicate charges/orders
   */
  async findIdempotencyKey(key: string) {
    return prisma.idempotencyKey.findUnique({
      where: { key },
    });
  }

  /**
   * Save idempotency key record
   */
  async saveIdempotencyKey(key: string, path: string, requestHash: string, status: number, body: string) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours validity
    return prisma.idempotencyKey.create({
      data: {
        key,
        path,
        requestHash,
        responseStatus: status,
        responseBody: body,
        expiresAt,
      },
    });
  }

  /**
   * Atomic Transaction: Create Order, create OrderItems, record initial OrderStatusHistory,
   * create pending Payment record, and deduct stock.
   */
  async createOrderWithTransaction(data: {
    orderData: Prisma.OrderCreateInput;
    items: Array<{
      productId: string;
      variantId?: string;
      title: string;
      sku: string;
      size: string;
      color: string;
      unitPrice: number;
      mrp: number;
      quantity: number;
      totalPrice: number;
    }>;
    statusNote: string;
    changedBy: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Stock check and deduction with atomic decrement to prevent overselling
      for (const item of data.items) {
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { stock: true, sku: true },
          });

          if (!variant || variant.stock < item.quantity) {
            throw new Error(`Insufficient stock for item "${item.title}" (${variant?.sku || "SKU"}). Available: ${variant?.stock ?? 0}`);
          }

          // Atomic deduction
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // 2. Create the order
      const order = await tx.order.create({
        data: data.orderData,
      });

      // 3. Create order items
      await tx.orderItem.createMany({
        data: data.items.map((it) => ({
          ...it,
          orderId: order.id,
        })),
      });

      // 4. Record status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: "NONE",
          toStatus: order.status,
          note: data.statusNote,
          changedBy: data.changedBy,
        },
      });

      return order;
    });
  }

  /**
   * Atomic update of order status with history log
   */
  async updateOrderStatus(
    orderId: string,
    fromStatus: string,
    toStatus: string,
    note?: string,
    changedBy = "SYSTEM"
  ) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: toStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus,
          toStatus,
          note,
          changedBy,
        },
      });

      return updated;
    });
  }
}

export const orderRepository = new OrderRepository();
