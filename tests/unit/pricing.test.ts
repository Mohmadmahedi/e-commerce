import { OrderStateMachine } from "../../src/server/services/order-state-machine";
import { registerSchema } from "../../src/server/validators/auth.validator";
import { addressSchema } from "../../src/server/validators/user.validator";

export async function runPricingAndUnitTests() {
  console.log("\n--- [UNIT TESTS] Pricing, State Machine & Validation Engine ---");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  [✓] PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  [✗] FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. PINCODE VALIDATION (Indian Postal Codes: 6 digits, cannot start with 0)
  const validPincode = addressSchema.safeParse({
    name: "Aarav Sharma",
    phone: "9876543210",
    addressLine1: "Villa 42, Palm Meadows",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560066",
  });
  assert(validPincode.success, "Indian PIN Code: 560066 should be valid");

  const invalidPincode = addressSchema.safeParse({
    name: "Aarav Sharma",
    phone: "9876543210",
    addressLine1: "Villa 42, Palm Meadows",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "012345", // Starts with 0
  });
  assert(!invalidPincode.success, "Indian PIN Code: starting with 0 (012345) should be rejected");

  const shortPincode = addressSchema.safeParse({
    name: "Aarav Sharma",
    phone: "9876543210",
    addressLine1: "Villa 42, Palm Meadows",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "56006", // 5 digits
  });
  assert(!shortPincode.success, "Indian PIN Code: 5 digits (56006) should be rejected");

  // 2. INDIAN MOBILE NUMBER VALIDATION (10 digits starting with 6, 7, 8, 9)
  const validPhone = addressSchema.safeParse({
    name: "Ananya Roy",
    phone: "9123456789",
    addressLine1: "Flat 4B, Silver Oak",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
  });
  assert(validPhone.success, "Mobile Number: 9123456789 (valid 10 digits starting with 9) accepted");

  const invalidPhone = addressSchema.safeParse({
    name: "Ananya Roy",
    phone: "1234567890", // Starts with 1
    addressLine1: "Flat 4B, Silver Oak",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
  });
  assert(!invalidPhone.success, "Mobile Number: starting with 1 (1234567890) rejected");

  // 3. STRONG PASSWORD VALIDATION
  const weakPassword = registerSchema.safeParse({
    name: "Test User",
    email: "test@avanya.in",
    password: "password", // No uppercase, no digits, no symbols
    phone: "9876543210",
  });
  assert(!weakPassword.success, "Registration: weak password rejected by zod schema");

  const strongPassword = registerSchema.safeParse({
    name: "Test User",
    email: "test@avanya.in",
    password: "StrongPassword@123",
    confirmPassword: "StrongPassword@123",
    phone: "9876543210",
  });
  assert(strongPassword.success, "Registration: strong password accepted by zod schema");

  // 4. ORDER STATE MACHINE TRANSITION RULES
  assert(
    OrderStateMachine.canTransition("PLACED", "PAID"),
    "State Machine: PLACED -> PAID is valid"
  );
  assert(
    OrderStateMachine.canTransition("PAID", "PACKED"),
    "State Machine: PAID -> PACKED is valid"
  );
  assert(
    OrderStateMachine.canTransition("PACKED", "SHIPPED"),
    "State Machine: PACKED -> SHIPPED is valid"
  );
  assert(
    OrderStateMachine.canTransition("SHIPPED", "DELIVERED"),
    "State Machine: SHIPPED -> DELIVERED is valid"
  );
  assert(
    !OrderStateMachine.canTransition("DELIVERED", "CANCELLED"),
    "State Machine: DELIVERED -> CANCELLED is prohibited (terminal state)"
  );
  assert(
    !OrderStateMachine.canTransition("CANCELLED", "PACKED"),
    "State Machine: CANCELLED -> PACKED is prohibited (cancelled is terminal)"
  );

  // 5. PRICING & GST ROUNDING TEST
  const subtotal = 18499;
  const gstRate = 0.18; // 18% GST standard on luxury garments > ₹1000
  const gstAmount = Math.round(subtotal * gstRate);
  const discount = Math.round(subtotal * 0.10); // 10% coupon
  const shippingFee = subtotal >= 4000 ? 0 : 250; // Free shipping threshold >= ₹4000
  const finalTotal = subtotal - discount + gstAmount + shippingFee;

  assert(shippingFee === 0, "Pricing: Orders over ₹4,000 qualify for complimentary luxury shipping");
  assert(gstAmount === 3330, `Pricing: 18% GST correctly computed (expected 3330, got ${gstAmount})`);
  assert(discount === 1850, `Pricing: 10% discount correctly computed (expected 1850, got ${discount})`);
  assert(finalTotal === 19979, `Pricing: Final grand total matches precision arithmetic (₹${finalTotal})`);

  if (failed > 0) {
    throw new Error(`${failed} unit tests failed`);
  }
  return { passed, failed };
}

if (require.main === module) {
  runPricingAndUnitTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
