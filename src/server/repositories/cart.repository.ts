import prisma from "@/lib/prisma";

export class CartRepository {
  /**
   * Find cart by User ID or Guest Token with all item details
   */
  async findCart(params: { userId?: string; guestToken?: string }) {
    const { userId, guestToken } = params;
    if (!userId && !guestToken) return null;

    // If both guestToken and userId are present, look for guest cart with items first
    if (guestToken && userId) {
      const guestCart = await prisma.cart.findFirst({
        where: { guestToken },
        include: {
          coupon: true,
          items: {
            include: {
              variant: true,
              product: {
                include: { images: { where: { isPrimary: true } } },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (guestCart && guestCart.items.length > 0) {
        if (!guestCart.userId) {
          await prisma.cart.update({
            where: { id: guestCart.id },
            data: { userId },
          });
          guestCart.userId = userId;
        }
        return guestCart;
      }
    }

    return prisma.cart.findFirst({
      where: {
        OR: [
          ...(guestToken ? [{ guestToken }] : []),
          ...(userId ? [{ userId }] : []),
        ],
      },
      include: {
        coupon: true,
        items: {
          include: {
            variant: true,
            product: {
              include: {
                images: { where: { isPrimary: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [
        { items: { _count: "desc" } },
        { updatedAt: "desc" },
      ],
    });
  }

  /**
   * Create a new cart for a user or guest
   */
  async createCart(params: { userId?: string; guestToken?: string }) {
    return prisma.cart.create({
      data: {
        userId: params.userId,
        guestToken: params.guestToken,
      },
      include: {
        coupon: true,
        items: {
          include: {
            variant: true,
            product: {
              include: {
                images: { where: { isPrimary: true } },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Upsert cart item (increase quantity if variant already in cart)
   */
  async upsertCartItem(cartId: string, productId: string, variantId: string, quantity: number) {
    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId,
          variantId,
        },
      },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    }

    return prisma.cartItem.create({
      data: {
        cartId,
        productId,
        variantId,
        quantity,
      },
    });
  }

  /**
   * Update quantity of a cart item
   */
  async updateItemQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      return prisma.cartItem.delete({
        where: { id: itemId },
      });
    }

    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string) {
    return prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  /**
   * Apply coupon to cart
   */
  async setCoupon(cartId: string, couponId: string | null) {
    return prisma.cart.update({
      where: { id: cartId },
      data: { couponId },
    });
  }
}

export const cartRepository = new CartRepository();
