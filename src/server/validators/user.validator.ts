import { z } from "zod";

/**
 * Validator for updating user profile information
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters").optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Validator for shipping and billing addresses
 */
export const addressSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
  alternatePhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number")
    .optional()
    .or(z.literal("")),
  addressLine1: z.string().min(5, "Flat/House No. and Building must be at least 5 characters").max(200),
  addressLine2: z.string().max(200).optional().or(z.literal("")),
  landmark: z.string().max(100).optional().or(z.literal("")),
  city: z.string().min(2, "City must be at least 2 characters").max(100),
  state: z.string().min(2, "State must be at least 2 characters").max(100),
  postalCode: z.string().regex(/^[1-9]\d{5}$/, "Please enter a valid 6-digit PIN code"),
  addressType: z.enum(["HOME", "WORK", "OTHER"]).default("HOME"),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

/**
 * Validator for account deletion under DPDP Act principles
 */
export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password confirmation is required to delete your account"),
  confirmationText: z
    .literal("DELETE MY ACCOUNT", {
      errorMap: () => ({ message: 'Please type "DELETE MY ACCOUNT" exactly to confirm' }),
    }),
  reason: z.string().max(500).optional(),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
