import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository";
import { auditRepository } from "../repositories/audit.repository";
import { UpdateProfileInput, AddressInput, DeleteAccountInput } from "../validators/user.validator";
import { NotFoundError, AuthError, ForbiddenError, ValidationError } from "../utils/errors";

export class UserService {
  /**
   * Get user profile details
   */
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  /**
   * Update profile details
   */
  async updateProfile(userId: string, input: UpdateProfileInput, ip?: string, userAgent?: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updated = await userRepository.updateProfile(userId, input);

    await auditRepository.createLog({
      userId,
      action: "USER_PROFILE_UPDATED",
      entity: "User",
      entityId: userId,
      details: { updatedFields: Object.keys(input) },
      ipAddress: ip,
      userAgent,
    });

    return updated;
  }

  /**
   * Get all user addresses
   */
  async getAddresses(userId: string) {
    return userRepository.findAddresses(userId);
  }

  /**
   * Add a new delivery address
   */
  async createAddress(userId: string, input: AddressInput, ip?: string, userAgent?: string) {
    const address = await userRepository.createAddress(userId, input);

    await auditRepository.createLog({
      userId,
      action: "USER_ADDRESS_CREATED",
      entity: "Address",
      entityId: address.id,
      details: { postalCode: address.postalCode, city: address.city, isDefault: address.isDefault },
      ipAddress: ip,
      userAgent,
    });

    return address;
  }

  /**
   * Update existing address with strict IDOR ownership check
   */
  async updateAddress(
    userId: string,
    addressId: string,
    input: Partial<AddressInput>,
    ip?: string,
    userAgent?: string
  ) {
    const existing = await userRepository.findAddressById(addressId);
    if (!existing) {
      throw new NotFoundError("Address not found");
    }

    // IDOR Protection: User must own the address
    if (existing.userId !== userId) {
      throw new ForbiddenError("IDOR Protection: You are not authorized to modify this address");
    }

    const updated = await userRepository.updateAddress(userId, addressId, input);

    await auditRepository.createLog({
      userId,
      action: "USER_ADDRESS_UPDATED",
      entity: "Address",
      entityId: addressId,
      details: { addressId },
      ipAddress: ip,
      userAgent,
    });

    return updated;
  }

  /**
   * Delete an address with strict IDOR ownership check
   */
  async deleteAddress(userId: string, addressId: string, ip?: string, userAgent?: string) {
    const existing = await userRepository.findAddressById(addressId);
    if (!existing) {
      throw new NotFoundError("Address not found");
    }

    // IDOR Protection: User must own the address
    if (existing.userId !== userId) {
      throw new ForbiddenError("IDOR Protection: You are not authorized to delete this address");
    }

    await userRepository.deleteAddress(addressId);

    await auditRepository.createLog({
      userId,
      action: "USER_ADDRESS_DELETED",
      entity: "Address",
      entityId: addressId,
      ipAddress: ip,
      userAgent,
    });

    return { success: true };
  }

  /**
   * Get user order history
   */
  async getUserOrders(userId: string, page = 1, limit = 10) {
    return userRepository.findOrders(userId, page, limit);
  }

  /**
   * DPDP Act Data Export
   * Returns complete personal data file in JSON format
   */
  async exportUserData(userId: string, ip?: string, userAgent?: string) {
    const exportData = await userRepository.exportFullUserData(userId);
    if (!exportData) {
      throw new NotFoundError("User record not found");
    }

    await auditRepository.createLog({
      userId,
      action: "DPDP_DATA_EXPORT_REQUESTED",
      entity: "User",
      entityId: userId,
      details: { note: "Personal data exported in compliance with DPDP Act" },
      ipAddress: ip,
      userAgent,
    });

    return exportData;
  }

  /**
   * Account Deletion & Anonymization under DPDP Act
   * Requires password confirmation to prevent unauthorized deletion
   */
  async deleteAccount(
    userId: string,
    input: DeleteAccountInput,
    ip?: string,
    userAgent?: string
  ) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // If user registered with password, verify password
    if (user.passwordHash) {
      const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
      if (!passwordMatch) {
        throw new AuthError("Incorrect password. Account deletion aborted.");
      }
    }

    // Safety Check: Check if there are active in-transit orders
    const ordersResult = await userRepository.findOrders(userId, 1, 50);
    const activeOrders = ordersResult.orders.filter(
      (o) => !["DELIVERED", "CANCELLED", "REFUNDED"].includes(o.status)
    );

    if (activeOrders.length > 0) {
      throw new ValidationError(
        `Cannot delete account while you have ${activeOrders.length} active order(s) in progress. Please await delivery or cancel them before deleting.`
      );
    }

    await userRepository.anonymizeAccount(userId);

    await auditRepository.createLog({
      userId,
      action: "USER_ACCOUNT_DELETED",
      entity: "User",
      entityId: userId,
      details: { reason: input.reason || "User requested self-deletion under DPDP Act" },
      ipAddress: ip,
      userAgent,
    });

    return { success: true, message: "Your account and personal data have been deleted/anonymized successfully." };
  }
}

export const userService = new UserService();
