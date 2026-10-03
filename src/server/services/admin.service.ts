import { adminRepository } from "../repositories/admin.repository";
import { auditRepository } from "../repositories/audit.repository";
import { OrderStateMachine } from "./order-state-machine";
import {
  CreateProductInput,
  UpdateProductInput,
  UpdateOrderStatusInput,
  CreateCouponInput,
} from "../validators/admin.validator";
import { NotFoundError, ConflictError } from "../utils/errors";
import prisma from "@/lib/prisma";

export class AdminService {
  /**
   * Executive KPIs and overview analytics
   */
  async getDashboard() {
    return adminRepository.getDashboardMetrics();
  }

  /**
   * Product inventory catalog management
   */
  async getProducts(params: {
    search?: string;
    categoryId?: string;
    isArchived?: boolean;
    page?: number;
    limit?: number;
  }) {
    return adminRepository.findProductsAdmin(params);
  }

  async createProduct(
    input: CreateProductInput,
    adminUser: { id: string; email?: string | null },
    ip?: string,
    userAgent?: string
  ) {
    // Check slug uniqueness
    const existingSlug = await prisma.product.findUnique({
      where: { slug: input.slug },
    });
    if (existingSlug) {
      throw new ConflictError(`Product with slug "${input.slug}" already exists`);
    }

    const product = await adminRepository.createProductAdmin(input);

    await auditRepository.createLog({
      userId: adminUser.id,
      action: "ADMIN_PRODUCT_CREATED",
      entity: "Product",
      entityId: product.id,
      details: { title: product.title, slug: product.slug, basePrice: product.basePrice },
      ipAddress: ip,
      userAgent,
    });

    return product;
  }

  async updateProduct(
    productId: string,
    input: UpdateProductInput,
    adminUser: { id: string; email?: string | null },
    ip?: string,
    userAgent?: string
  ) {
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      throw new NotFoundError("Product not found");
    }

    const updated = await adminRepository.updateProductAdmin(productId, input);

    await auditRepository.createLog({
      userId: adminUser.id,
      action: "ADMIN_PRODUCT_UPDATED",
      entity: "Product",
      entityId: productId,
      details: { updatedFields: Object.keys(input) },
      ipAddress: ip,
      userAgent,
    });

    return updated;
  }

  async archiveProduct(
    productId: string,
    isArchived: boolean,
    adminUser: { id: string; email?: string | null },
    ip?: string,
    userAgent?: string
  ) {
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      throw new NotFoundError("Product not found");
    }

    const updated = await adminRepository.setProductArchived(productId, isArchived);

    await auditRepository.createLog({
      userId: adminUser.id,
      action: isArchived ? "ADMIN_PRODUCT_ARCHIVED" : "ADMIN_PRODUCT_RESTORED",
      entity: "Product",
      entityId: productId,
      ipAddress: ip,
      userAgent,
    });

    return updated;
  }

  /**
   * Order workflow & fulfillment state management
   */
  async getOrders(params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return adminRepository.findOrdersAdmin(params);
  }

  async updateOrderStatus(
    orderId: string,
    input: UpdateOrderStatusInput,
    adminUser: { id: string; email?: string | null },
    ip?: string,
    userAgent?: string
  ) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Enforce strict state machine transitions
    OrderStateMachine.validateTransition(order.status, input.toStatus);

    const updated = await adminRepository.updateOrderStatusAdmin(
      orderId,
      input.toStatus,
      input.note,
      adminUser.email || adminUser.id,
      {
        courierName: input.courierName,
        trackingNumber: input.trackingNumber,
        estimatedDelivery: input.estimatedDelivery,
      }
    );

    await auditRepository.createLog({
      userId: adminUser.id,
      action: "ADMIN_ORDER_STATUS_UPDATED",
      entity: "Order",
      entityId: orderId,
      details: {
        orderNumber: order.orderNumber,
        fromStatus: order.status,
        toStatus: input.toStatus,
        note: input.note,
      },
      ipAddress: ip,
      userAgent,
    });

    return updated;
  }

  /**
   * Coupons management
   */
  async getCoupons() {
    return adminRepository.findCouponsAdmin();
  }

  async createCoupon(
    input: CreateCouponInput,
    adminUser: { id: string; email?: string | null },
    ip?: string,
    userAgent?: string
  ) {
    const existing = await prisma.coupon.findUnique({ where: { code: input.code } });
    if (existing) {
      throw new ConflictError(`Coupon with code "${input.code}" already exists`);
    }

    const coupon = await adminRepository.createCouponAdmin(input);

    await auditRepository.createLog({
      userId: adminUser.id,
      action: "ADMIN_COUPON_CREATED",
      entity: "Coupon",
      entityId: coupon.id,
      details: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
      ipAddress: ip,
      userAgent,
    });

    return coupon;
  }

  async toggleCoupon(
    couponId: string,
    isActive: boolean,
    adminUser: { id: string; email?: string | null },
    ip?: string,
    userAgent?: string
  ) {
    const coupon = await adminRepository.toggleCouponActive(couponId, isActive);

    await auditRepository.createLog({
      userId: adminUser.id,
      action: isActive ? "ADMIN_COUPON_ACTIVATED" : "ADMIN_COUPON_DEACTIVATED",
      entity: "Coupon",
      entityId: couponId,
      ipAddress: ip,
      userAgent,
    });

    return coupon;
  }

  async deleteCoupon(
    couponId: string,
    adminUser: { id: string; email?: string | null },
    ip?: string,
    userAgent?: string
  ) {
    await adminRepository.deleteCouponAdmin(couponId);

    await auditRepository.createLog({
      userId: adminUser.id,
      action: "ADMIN_COUPON_DELETED",
      entity: "Coupon",
      entityId: couponId,
      ipAddress: ip,
      userAgent,
    });

    return { success: true };
  }

  /**
   * Security Audit Log records
   */
  async getAuditLogs(limit = 50, page = 1) {
    return auditRepository.findRecent(limit, page);
  }
}

export const adminService = new AdminService();
