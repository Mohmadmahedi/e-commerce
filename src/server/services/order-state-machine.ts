import { AppError } from "../utils/errors";

export type OrderStatus =
  | "PLACED"
  | "PAID"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"
  | "REFUNDED";

/**
 * Strict state machine defining valid order status transitions
 */
export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ["PAID", "CANCELLED"],
  PAID: ["PACKED", "CANCELLED", "REFUNDED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED", "REFUNDED"],
  CANCELLED: [], // Terminal state
  RETURNED: ["REFUNDED"],
  REFUNDED: [], // Terminal state
};

export class OrderStateMachine {
  /**
   * Validates whether a requested transition is legal.
   * Throws an AppError if invalid.
   */
  static validateTransition(currentStatus: string, nextStatus: string): void {
    const validCurrent = currentStatus.toUpperCase() as OrderStatus;
    const validNext = nextStatus.toUpperCase() as OrderStatus;

    const allowed = ALLOWED_ORDER_TRANSITIONS[validCurrent];
    if (!allowed) {
      throw new AppError(`Unknown or invalid order status: ${currentStatus}`, 400, "INVALID_ORDER_STATUS");
    }

    if (!allowed.includes(validNext)) {
      throw new AppError(
        `Illegal status transition from "${currentStatus}" to "${nextStatus}". Allowed transitions: [${allowed.join(
          ", "
        )}]`,
        400,
        "INVALID_STATUS_TRANSITION"
      );
    }
  }

  /**
   * Helper to check if a status transition is permitted
   */
  static canTransition(currentStatus: string, nextStatus: string): boolean {
    const validCurrent = currentStatus.toUpperCase() as OrderStatus;
    const validNext = nextStatus.toUpperCase() as OrderStatus;
    const allowed = ALLOWED_ORDER_TRANSITIONS[validCurrent];
    return Boolean(allowed && allowed.includes(validNext));
  }

  /**
   * Helper to check if an order is editable or cancellable
   */
  static isCancellable(status: string): boolean {
    return ["PLACED", "PAID", "PACKED"].includes(status.toUpperCase());
  }

  /**
   * Helper to check if an order is returnable
   */
  static isReturnable(status: string): boolean {
    return status.toUpperCase() === "DELIVERED";
  }
}
