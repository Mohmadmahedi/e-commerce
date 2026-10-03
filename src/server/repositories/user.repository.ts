import prisma from "@/lib/prisma";
import { AddressInput, UpdateProfileInput } from "../validators/user.validator";

export class UserRepository {
  /**
   * Find user by ID (excluding password hash)
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Find user with password hash (internal auth check only)
   */
  async findByIdWithPassword(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
      },
    });
  }

  /**
   * Update profile information
   */
  async updateProfile(id: string, data: UpdateProfileInput) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Fetch all saved addresses for a user
   */
  async findAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  /**
   * Fetch single address by ID
   */
  async findAddressById(addressId: string) {
    return prisma.address.findUnique({
      where: { id: addressId },
    });
  }

  /**
   * Create new address (atomically managing default flag)
   */
  async createAddress(userId: string, data: AddressInput) {
    return prisma.$transaction(async (tx) => {
      // If setting this address as default, unset existing default
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      } else {
        // If this is the user's very first address, automatically make it default
        const count = await tx.address.count({ where: { userId } });
        if (count === 0) {
          data.isDefault = true;
        }
      }

      return tx.address.create({
        data: {
          userId,
          name: data.name,
          phone: data.phone,
          alternatePhone: data.alternatePhone || null,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          landmark: data.landmark || null,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          addressType: data.addressType,
          isDefault: data.isDefault,
        },
      });
    });
  }

  /**
   * Update an address with transaction for default flag
   */
  async updateAddress(userId: string, addressId: string, data: Partial<AddressInput>) {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.phone && { phone: data.phone }),
          ...(data.alternatePhone !== undefined && { alternatePhone: data.alternatePhone || null }),
          ...(data.addressLine1 && { addressLine1: data.addressLine1 }),
          ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2 || null }),
          ...(data.landmark !== undefined && { landmark: data.landmark || null }),
          ...(data.city && { city: data.city }),
          ...(data.state && { state: data.state }),
          ...(data.postalCode && { postalCode: data.postalCode }),
          ...(data.addressType && { addressType: data.addressType }),
          ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        },
      });
    });
  }

  /**
   * Delete an address
   */
  async deleteAddress(addressId: string) {
    return prisma.address.delete({
      where: { id: addressId },
    });
  }

  /**
   * Fetch paginated orders for a user
   */
  async findOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: {
                select: {
                  title: true,
                  slug: true,
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
          shippingAddress: true,
          statusHistory: {
            orderBy: { createdAt: "asc" },
          },
          payments: {
            select: {
              id: true,
              paymentGateway: true,
              status: true,
              amount: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.order.count({ where: { userId } }),
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
   * Comprehensive DPDP data export (clean of credentials)
   */
  async exportFullUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        orders: {
          include: {
            items: true,
            statusHistory: true,
            payments: true,
          },
        },
        reviews: true,
        wishlist: {
          include: {
            product: {
              select: { id: true, title: true, slug: true, basePrice: true },
            },
          },
        },
      },
    });

    return user;
  }

  /**
   * Anonymize and delete account in compliance with DPDP Act and financial retention laws
   */
  async anonymizeAccount(userId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Delete active sessions and oauth accounts
      await tx.session.deleteMany({ where: { userId } });
      await tx.account.deleteMany({ where: { userId } });

      // 2. Clear user cart and wishlist
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        await tx.cart.delete({ where: { id: cart.id } });
      }
      await tx.wishlistItem.deleteMany({ where: { userId } });

      // 3. Clear saved addresses
      await tx.address.deleteMany({ where: { userId } });

      // 4. Anonymize user personal data while preserving order foreign keys for GST audit
      const anonymizedEmail = `anonymized_${userId.slice(0, 8)}@deleted.avanya.in`;
      await tx.user.update({
        where: { id: userId },
        data: {
          name: "Deactivated Account",
          email: anonymizedEmail,
          phone: null,
          passwordHash: null,
          image: null,
          twoFactorEnabled: false,
          twoFactorSecret: null,
          lockedUntil: null,
        },
      });

      return { success: true };
    });
  }
}

export const userRepository = new UserRepository();
