import { prisma } from "../src/lib/prisma";
import { userService } from "../src/server/services/user.service";
import { ForbiddenError, ValidationError } from "../src/server/utils/errors";
import { rateLimiter, RATE_LIMIT_PRESETS } from "../src/server/utils/rate-limiter";
import { validateRedirectUrl, isSafeOutboundUrl } from "../src/server/utils/url-validator";
import { validateMagicBytes } from "../src/server/utils/file-upload";

export async function runSecurityTests() {
  console.log("\n--- [SECURITY TESTS] IDOR, RBAC, Rate Limiting, SSRF & Upload Hardening ---");
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

  // 1. IDOR (INSECURE DIRECT OBJECT REFERENCE) PROTECTION
  const customerA = await prisma.user.findUnique({ where: { email: "ananya@example.com" } });
  if (!customerA) throw new Error("Demo customer missing");

  // Create temporary Customer B
  const customerBEmail = `attacker_${Date.now()}@example.com`;
  const customerB = await prisma.user.create({
    data: {
      name: "Malicious Actor",
      email: customerBEmail,
      role: "CUSTOMER",
    },
  });

  // Create an address for Customer A
  const addressA = await userService.createAddress(customerA.id, {
    name: "Ananya Private Villa",
    phone: "9876543210",
    addressLine1: "Confidential Address Line",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560001",
    addressType: "HOME",
  });

  // Customer B attempts to update Customer A's address
  let idorUpdateBlocked = false;
  try {
    await userService.updateAddress(customerB.id, addressA.id, { city: "Compromised City" });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      idorUpdateBlocked = true;
    }
  }
  assert(idorUpdateBlocked, "IDOR: Customer B prevented from updating Customer A's address (ForbiddenError)");

  // Customer B attempts to delete Customer A's address
  let idorDeleteBlocked = false;
  try {
    await userService.deleteAddress(customerB.id, addressA.id);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      idorDeleteBlocked = true;
    }
  }
  assert(idorDeleteBlocked, "IDOR: Customer B prevented from deleting Customer A's address (ForbiddenError)");

  // Cleanup address & Customer B
  await userService.deleteAddress(customerA.id, addressA.id);
  await prisma.user.delete({ where: { id: customerB.id } });

  // 2. RATE LIMITING ENGINE (Sliding Window)
  const testIp = `test-ip-${Date.now()}`;
  let wasRateLimited = false;

  // Rapidly fire requests beyond auth limit (5 reqs / 15 min)
  for (let i = 0; i < 10; i++) {
    const res = await rateLimiter.consume(testIp, RATE_LIMIT_PRESETS.AUTH_LOGIN);
    if (!res.allowed) {
      wasRateLimited = true;
      break;
    }
  }
  assert(wasRateLimited, "Rate Limiting: High-frequency burst requests throttled with 429 Too Many Requests");

  // 3. SSRF & OPEN REDIRECT DEFENSE
  assert(validateRedirectUrl("javascript:alert(document.cookie)", "/fallback") === "/fallback", "Open Redirect: Blocked javascript: protocol");
  assert(validateRedirectUrl("//attacker.com/malicious-phish", "/fallback") === "/fallback", "Open Redirect: Blocked protocol-relative // url");
  assert(validateRedirectUrl("/checkout") === "/checkout", "Redirect Validator: Allowed safe internal path /checkout");
  assert(validateRedirectUrl("/account/orders") === "/account/orders", "Redirect Validator: Allowed safe internal path /account/orders");

  assert(!isSafeOutboundUrl("http://169.254.169.254/latest/meta-data/"), "SSRF: Blocked AWS metadata endpoint");
  assert(!isSafeOutboundUrl("http://127.0.0.1:6379/"), "SSRF: Blocked localhost internal port access");
  assert(!isSafeOutboundUrl("http://10.0.0.1/admin"), "SSRF: Blocked RFC1918 private network access");
  assert(isSafeOutboundUrl("https://images.unsplash.com/photo-luxury"), "SSRF: Allowed public HTTPS asset URL");

  // 4. MALICIOUS FILE UPLOAD & MAGIC-BYTE VERIFICATION
  // Test Case A: Spoofed file (Non-image payload declared as JPEG)
  const fakeJpgBuffer = Buffer.from("DISGUISED_SCRIPT_PAYLOAD_WITHOUT_IMAGE_HEADERS", "utf-8");
  const isFakeValid = validateMagicBytes(fakeJpgBuffer, "image/jpeg");
  assert(!isFakeValid, "File Upload Hardening: Executable disguised as .jpg rejected via magic-byte inspection");

  // Test Case B: Authentic JPEG header (FF D8 FF E0 ...)
  const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00]);
  const isValidValid = validateMagicBytes(validJpegBuffer, "image/jpeg");
  assert(isValidValid, "File Upload Hardening: Genuine JPEG image magic signature accepted");

  // 5. DPDP ACT DATA EXPORT INTEGRITY
  const exportedData = await userService.exportUserData(customerA.id);
  assert(Boolean(exportedData?.email), "DPDP Export: Personal profile data compiled");
  assert(Array.isArray(exportedData?.addresses), "DPDP Export: Saved addresses array provided");
  assert(!("passwordHash" in exportedData!), "DPDP Export: Sensitive passwordHash excluded from export bundle");

  if (failed > 0) {
    throw new Error(`${failed} security tests failed`);
  }
  return { passed, failed };
}

if (require.main === module) {
  runSecurityTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
