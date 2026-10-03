import prisma from "@/lib/prisma";
import { cartRepository } from "../repositories/cart.repository";
import { productRepository } from "../repositories/product.repository";
import { ValidationError, NotFoundError } from "../utils/errors";

export interface CartCalculationResult {
  items: Array<{
    id: string;
    variantId: string;
    productId: string;
    title: string;
    sku: string;
    size: string;
    color: string;
    imageUrl: string;
    price: number;
    mrp: number;
    quantity: number;
    itemTotal: number;
    inStock: boolean;
  }>;
  subtotal: number;
  totalMrp: number;
  discountOnMrp: number;
  couponDiscount: number;
  couponCode: string | null;
  shippingFee: number;
  gstAmount: number; // 12% GST included or calculated for luxury garments
  finalTotal: number;
  freeShippingQualified: boolean;
  amountNeededForFreeShipping: number;
}

export class CartService {
  /**
   * Minimum cart threshold for complimentary shipping (India standard ₹999)
   */
  private readonly FREE_SHIPPING_THRESHOLD = 999;
  private readonly STANDARD_SHIPPING_FEE = 150;

  /**
   * Get or create a cart for an authenticated user or anonymous guest
   */
  async getOrCreateCart(params: { userId?: string; guestToken?: string }) {
    const cart = (await cartRepository.findCart(params)) ?? (await cartRepository.createCart(params));
    return this.recalculateCart(cart.id);
  }

  /**
   * Add item to cart with stock check
   */
  async addToCart(params: {
    productId: string;
    variantId: string;
    quantity: number;
    userId?: string;
    guestToken?: string;
  }) {
    // 1. Verify variant exists and has sufficient stock
    const variant = await productRepository.findVariantById(params.variantId);
    if (!variant || !variant.isAvailable) {
      throw new NotFoundError("Selected product variant is no longer available");
    }

    if (variant.stock < params.quantity) {
      throw new ValidationError(
        `Only ${variant.stock} item(s) currently available in stock for ${variant.size} / ${variant.color}`
      );
    }

    // 2. Fetch or create cart
    const cart =
      (await cartRepository.findCart({
        userId: params.userId,
        guestToken: params.guestToken,
      })) ??
      (await cartRepository.createCart({
        userId: params.userId,
        guestToken: params.guestToken,
      }));

    // 3. Upsert cart item
    await cartRepository.upsertCartItem(cart.id, params.productId, params.variantId, params.quantity);

    // 4. Return recalculation
    return this.recalculateCart(cart.id);
  }

  /**
   * Update item quantity in cart
   */
  async updateQuantity(itemId: string, quantity: number, cartParams: { userId?: string; guestToken?: string }) {
    const cart = await cartRepository.findCart(cartParams);
    if (!cart) throw new NotFoundError("Cart not found");

    const item = cart.items.find((it) => it.id === itemId);
    if (!item) throw new NotFoundError("Item not found in cart");

    if (quantity > 0 && item.variant.stock < quantity) {
      throw new ValidationError(`Only ${item.variant.stock} items available in stock`);
    }

    await cartRepository.updateItemQuantity(itemId, quantity);
    return this.recalculateCart(cart.id);
  }

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string, cartParams: { userId?: string; guestToken?: string }) {
    const cart = await cartRepository.findCart(cartParams);
    if (!cart) throw new NotFoundError("Cart not found");

    await cartRepository.removeItem(itemId);
    return this.recalculateCart(cart.id);
  }

  /**
   * Apply discount coupon with abuse & validation limits
   */
  async applyCoupon(code: string, cartParams: { userId?: string; guestToken?: string }) {
    const cart = await cartRepository.findCart(cartParams);
    if (!cart) throw new NotFoundError("Cart not found");

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new ValidationError("Invalid or inactive coupon code");
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new ValidationError("This coupon has expired");
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new ValidationError("This coupon has reached its maximum global usage limit");
    }

    // Check per-user limit if user is authenticated
    if (cartParams.userId) {
      const userUsageCount = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId: cartParams.userId },
      });

      if (userUsageCount >= coupon.perUserLimit) {
        throw new ValidationError("You have already used this coupon the maximum allowed times");
      }
    }

    // Calculate subtotal to verify minimum cart requirement
    let subtotal = 0;
    for (const item of cart.items) {
      subtotal += item.variant.price * item.quantity;
    }

    if (subtotal < coupon.minOrderAmount) {
      throw new ValidationError(
        `This coupon requires a minimum cart value of ₹${coupon.minOrderAmount.toLocaleString("en-IN")}`
      );
    }

    await cartRepository.setCoupon(cart.id, coupon.id);
    return this.recalculateCart(cart.id);
  }

  /**
   * Remove coupon from cart
   */
  async removeCoupon(cartParams: { userId?: string; guestToken?: string }) {
    const cart = await cartRepository.findCart(cartParams);
    if (!cart) throw new NotFoundError("Cart not found");

    await cartRepository.setCoupon(cart.id, null);
    return this.recalculateCart(cart.id);
  }

  /**
   * CRITICAL SERVER-SIDE RECALCULATION
   * Always recalculates prices directly from database variant records.
   * Completely immune to client-side price tampering.
   */
  async recalculateCart(cartId: string): Promise<CartCalculationResult> {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        coupon: true,
        items: {
          include: {
            variant: true,
            product: {
              include: { images: { where: { isPrimary: true } } },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundError("Cart does not exist");
    }

    let subtotal = 0;
    let totalMrp = 0;

    const formattedItems = cart.items.map((item) => {
      const unitPrice = item.variant.price;
      const unitMrp = item.variant.mrp;
      const itemTotal = unitPrice * item.quantity;
      const inStock = item.variant.stock >= item.quantity;

      subtotal += itemTotal;
      totalMrp += unitMrp * item.quantity;

      return {
        id: item.id,
        variantId: item.variantId,
        productId: item.productId,
        title: item.product.title,
        sku: item.variant.sku,
        size: item.variant.size,
        color: item.variant.color,
        imageUrl: item.product.images[0]?.url || "",
        price: unitPrice,
        mrp: unitMrp,
        quantity: item.quantity,
        itemTotal,
        inStock,
      };
    });

    const discountOnMrp = Math.max(0, totalMrp - subtotal);

    // Calculate coupon discount
    let couponDiscount = 0;
    if (cart.coupon && subtotal >= cart.coupon.minOrderAmount) {
      if (cart.coupon.discountType === "PERCENTAGE") {
        couponDiscount = (subtotal * cart.coupon.discountValue) / 100;
        if (cart.coupon.maxDiscountAmount && couponDiscount > cart.coupon.maxDiscountAmount) {
          couponDiscount = cart.coupon.maxDiscountAmount;
        }
      } else {
        // FLAT discount
        couponDiscount = Math.min(cart.coupon.discountValue, subtotal);
      }
    }

    const freeShippingQualified = subtotal >= this.FREE_SHIPPING_THRESHOLD || subtotal === 0;
    const shippingFee = freeShippingQualified ? 0 : this.STANDARD_SHIPPING_FEE;
    const amountNeededForFreeShipping = Math.max(0, this.FREE_SHIPPING_THRESHOLD - subtotal);

    const postDiscountAmount = Math.max(0, subtotal - couponDiscount);
    // 12% GST is included in consumer pricing in India for luxury apparel > ₹1000
    const gstAmount = Math.round((postDiscountAmount * 12) / 112);
    const finalTotal = postDiscountAmount + shippingFee;

    return {
      items: formattedItems,
      subtotal,
      totalMrp,
      discountOnMrp,
      couponDiscount,
      couponCode: cart.coupon?.code || null,
      shippingFee,
      gstAmount,
      finalTotal,
      freeShippingQualified,
      amountNeededForFreeShipping,
    };
  }
}

export const cartService = new CartService();
