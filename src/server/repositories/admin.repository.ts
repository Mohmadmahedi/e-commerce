import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { CreateProductInput, UpdateProductInput, CreateCouponInput } from "../validators/admin.validator";

export class AdminRepository {
  /**
   * Real-time executive KPIs and charts for dashboard
   */
  async getDashboardMetrics() {
    const [
      totalOrders,
      paidOrders,
      totalCustomers,
      lowStockVariants,
      recentOrders,
      categories,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),
      // Paid / Revenue orders
      prisma.order.findMany({
        where: {
          status: { in: ["PAID", "PACKED", "SHIPPED", "DELIVERED"] },
        },
        select: { totalAmount: true, createdAt: true },
      }),
      // Total registered customers
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      // Low stock alerts (under 5 units)
      prisma.productVariant.findMany({
        where: { stock: { lt: 5 } },
        take: 10,
        include: {
          product: { select: { title: true, slug: true } },
        },
        orderBy: { stock: "asc" },
      }),
      // Recent orders
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          items: { take: 2 },
          shippingAddress: { select: { name: true, city: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      // Categories count
      prisma.category.count(),
    ]);

    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      kpis: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalCategories: categories,
        lowStockCount: lowStockVariants.length,
      },
      lowStockVariants,
      recentOrders,
    };
  }

  /**
   * Fetch products for admin management
   */
  async findProductsAdmin(params: {
    search?: string;
    categoryId?: string;
    isArchived?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { search, categoryId, isArchived, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (isArchived !== undefined) {
      where.isArchived = isArchived;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } },
        { variants: { some: { sku: { contains: search } } } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true, gender: true } },
          collection: { select: { id: true, title: true } },
          images: { orderBy: { isPrimary: "desc" } },
          variants: true,
          _count: { select: { orderItems: true, reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create product with multiple variants & images
   */
  async createProductAdmin(data: CreateProductInput) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          fabricCare: data.fabricCare || null,
          occasion: data.occasion || null,
          fit: data.fit || null,
          basePrice: data.basePrice,
          baseMrp: data.baseMrp,
          discountPercent: data.discountPercent,
          categoryId: data.categoryId,
          collectionId: data.collectionId || null,
          isFeatured: data.isFeatured,
          isNewArrival: data.isNewArrival,
          isBestSeller: data.isBestSeller,
        },
      });

      // Create Images
      if (data.images && data.images.length > 0) {
        await tx.image.createMany({
          data: data.images.map((img, idx) => ({
            productId: product.id,
            url: img.url,
            alt: img.alt || data.title,
            isPrimary: img.isPrimary ?? idx === 0,
            displayOrder: idx,
          })),
        });
      }

      // Create Variants
      if (data.variants && data.variants.length > 0) {
        await tx.productVariant.createMany({
          data: data.variants.map((v) => ({
            productId: product.id,
            sku: v.sku,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex || "#0B5D4B",
            price: v.price,
            mrp: v.mrp,
            stock: v.stock,
            isAvailable: v.stock > 0,
          })),
        });
      }

      return product;
    });
  }

  /**
   * Update product details
   */
  async updateProductAdmin(productId: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id: productId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.slug && { slug: data.slug }),
        ...(data.description && { description: data.description }),
        ...(data.fabricCare !== undefined && { fabricCare: data.fabricCare || null }),
        ...(data.occasion !== undefined && { occasion: data.occasion || null }),
        ...(data.fit !== undefined && { fit: data.fit || null }),
        ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
        ...(data.baseMrp !== undefined && { baseMrp: data.baseMrp }),
        ...(data.discountPercent !== undefined && { discountPercent: data.discountPercent }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.collectionId !== undefined && { collectionId: data.collectionId || null }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.isNewArrival !== undefined && { isNewArrival: data.isNewArrival }),
        ...(data.isBestSeller !== undefined && { isBestSeller: data.isBestSeller }),
        ...(data.isArchived !== undefined && { isArchived: data.isArchived }),
      },
    });
  }

  /**
   * Soft archive / unarchive product
   */
  async setProductArchived(productId: string, isArchived: boolean) {
    return prisma.product.update({
      where: { id: productId },
      data: { isArchived },
    });
  }

  /**
   * Fetch orders for admin management with search & filter
   */
  async findOrdersAdmin(params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, search, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { shippingAddress: { phone: { contains: search } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          shippingAddress: true,
          user: { select: { id: true, name: true, email: true, phone: true } },
          statusHistory: { orderBy: { createdAt: "desc" } },
          payments: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Atomic Order Status & Tracking update with status log
   */
  async updateOrderStatusAdmin(
    orderId: string,
    toStatus: string,
    note?: string,
    adminEmail?: string,
    tracking?: { courierName?: string; trackingNumber?: string; estimatedDelivery?: string }
  ) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) {
        throw new Error("Order not found");
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: toStatus,
          ...(tracking?.courierName && { courierName: tracking.courierName }),
          ...(tracking?.trackingNumber && { trackingNumber: tracking.trackingNumber }),
          ...(tracking?.estimatedDelivery && { estimatedDelivery: new Date(tracking.estimatedDelivery) }),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus,
          note: note || `Status updated to ${toStatus} by Atelier Admin (${adminEmail || "staff"})`,
          changedBy: adminEmail ? `ADMIN: ${adminEmail}` : "ADMIN",
        },
      });

      return updated;
    });
  }

  /**
   * Coupons Management
   */
  async findCouponsAdmin() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { usages: true } },
      },
    });
  }

  async createCouponAdmin(data: CreateCouponInput) {
    return prisma.coupon.create({
      data: {
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount || null,
        usageLimit: data.usageLimit || null,
        perUserLimit: data.perUserLimit,
        isActive: data.isActive,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  async toggleCouponActive(couponId: string, isActive: boolean) {
    return prisma.coupon.update({
      where: { id: couponId },
      data: { isActive },
    });
  }

  async deleteCouponAdmin(couponId: string) {
    return prisma.coupon.delete({
      where: { id: couponId },
    });
  }
}

export const adminRepository = new AdminRepository();
