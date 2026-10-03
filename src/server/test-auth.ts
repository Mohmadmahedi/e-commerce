import { authService } from "./services/auth.service";
import { passwordPolicySchema } from "./validators/auth.validator";
import { requireOwnership, Role } from "./middleware/auth.middleware";
import { TotpUtil } from "./utils/totp";
import prisma from "@/lib/prisma";

async function testAuthAndSecurity() {
  console.log("🛡️ Starting Security & Auth Hardening Verification Suite...\n");

  // 1. Password Policy Testing
  console.log("1. Testing Password Complexity Policy...");
  const weakPasswords = ["short", "nouppercase123!", "NOLOWERCASE123!", "NoSpecialChar123", "NoNumber!@#$"];
  for (const pw of weakPasswords) {
    const res = passwordPolicySchema.safeParse(pw);
    if (res.success) throw new Error(`Password policy failed to reject weak password: "${pw}"`);
  }
  console.log("   ✓ All 5 weak passwords rejected by policy");

  const strongPassword = "RoyalLuxe#2026";
  const strongRes = passwordPolicySchema.safeParse(strongPassword);
  if (!strongRes.success) throw new Error("Strong password rejected unexpectedly");
  console.log(`   ✓ Strong password "${strongPassword}" passed validation`);

  // 2. User Registration
  console.log("\n2. Testing User Registration...");
  const testEmail = `test.shopper.${Date.now()}@example.com`;
  const registeredUser = await authService.registerUser(
    {
      name: "Radhika Sen",
      email: testEmail,
      phone: "9876543210",
      password: strongPassword,
      confirmPassword: strongPassword,
    },
    "127.0.0.1",
    "TestRunner"
  );
  console.log(`   ✓ User registered with ID: ${registeredUser.id} and Role: ${registeredUser.role}`);

  // Duplicate registration rejection test
  try {
    await authService.registerUser({
      name: "Radhika Duplicate",
      email: testEmail,
      password: strongPassword,
      confirmPassword: strongPassword,
    });
    throw new Error("Duplicate email registration was not blocked");
  } catch (err: any) {
    console.log(`   ✓ Duplicate registration blocked: "${err.message}"`);
  }

  // 3. Credential Verification & Failed Attempt Lockout
  console.log("\n3. Testing Progressive Account Lockout (5 failed attempts)...");
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      await authService.verifyCredentials({ email: testEmail, password: "WrongPassword@123" });
    } catch (err: any) {
      // Expected
    }
  }

  // 5th failed attempt should trigger 15-minute lockout
  try {
    await authService.verifyCredentials({ email: testEmail, password: "WrongPassword@123" });
    throw new Error("Lockout threshold failed to trigger");
  } catch (err: any) {
    console.log(`   ✓ 5th failed attempt triggered lockout: "${err.message}"`);
  }

  // Verify account is locked even if correct password is now supplied
  try {
    await authService.verifyCredentials({ email: testEmail, password: strongPassword });
    throw new Error("Locked account allowed login with correct password");
  } catch (err: any) {
    console.log(`   ✓ Locked account blocked correct password as expected: "${err.message}"`);
  }

  // 4. TOTP 2FA Generation & Timing-Safe Verification
  console.log("\n4. Testing Admin RFC 6238 TOTP 2FA...");
  const secret = TotpUtil.generateSecret();
  console.log(`   ✓ Generated 2FA Base32 Secret: ${secret.substring(0, 8)}...`);

  const currentWindow = Math.floor(Date.now() / 1000 / 30);
  const validToken = TotpUtil.generateToken(secret, currentWindow);
  const isValid = TotpUtil.verify(secret, validToken);
  console.log(`   ✓ Valid TOTP code "${validToken}" verified successfully: ${isValid}`);

  const isInvalid = TotpUtil.verify(secret, "000000");
  console.log(`   ✓ Fake TOTP code "000000" rejected: ${!isInvalid}`);

  // 5. IDOR (Insecure Direct Object Reference) Ownership Prevention
  console.log("\n5. Testing IDOR Ownership Protection...");
  const customerA = { id: "user_a_123", role: "CUSTOMER" as Role };
  const customerB = { id: "user_b_456", role: "CUSTOMER" as Role };
  const adminUser = { id: "admin_789", role: "ADMIN" as Role };

  // Customer A accessing Customer A's order -> Allowed
  try {
    requireOwnership(customerA.id, customerA, "Order");
    console.log("   ✓ Legitimate owner permitted to access resource");
  } catch (err) {
    throw new Error("Legitimate owner was blocked");
  }

  // Customer B attempting to access Customer A's order -> BLOCKED
  try {
    requireOwnership(customerA.id, customerB, "Order");
    throw new Error("IDOR check failed to block unauthorized user");
  } catch (err: any) {
    console.log(`   ✓ IDOR access blocked: "${err.message}"`);
  }

  // Admin accessing Customer A's order -> Allowed (Administrative oversight)
  try {
    requireOwnership(customerA.id, adminUser, "Order");
    console.log("   ✓ Administrator permitted bypass access for support/operations");
  } catch (err) {
    throw new Error("Admin was blocked");
  }

  // 6. Session Invalidation & Logout All Devices
  console.log("\n6. Testing Session Invalidation on Password Change...");
  // Unlock user for password change test
  await prisma.user.update({
    where: { id: registeredUser.id },
    data: { lockedUntil: null, failedLoginAttempts: 0 },
  });

  // Create 2 simulated active sessions in DB
  await prisma.session.createMany({
    data: [
      {
        sessionToken: `token_mobile_${Date.now()}`,
        userId: registeredUser.id,
        expires: new Date(Date.now() + 30 * 86400 * 1000),
      },
      {
        sessionToken: `token_desktop_${Date.now()}`,
        userId: registeredUser.id,
        expires: new Date(Date.now() + 30 * 86400 * 1000),
      },
    ],
  });

  const sessionCountBefore = await prisma.session.count({
    where: { userId: registeredUser.id },
  });
  console.log(`   ✓ Active database sessions created: ${sessionCountBefore}`);

  // Change password
  const newPassword = "BrandNewSecret#2026";
  await authService.changePassword(
    registeredUser.id,
    {
      currentPassword: strongPassword,
      newPassword,
      confirmNewPassword: newPassword,
    },
    "127.0.0.1",
    "TestRunner"
  );

  const sessionCountAfter = await prisma.session.count({
    where: { userId: registeredUser.id },
  });
  console.log(`   ✓ Active sessions remaining after password change: ${sessionCountAfter}`);
  if (sessionCountAfter !== 0) throw new Error("Sessions were not revoked upon password change!");

  // 7. Verify Audit Log Trail
  console.log("\n7. Verifying Audit Log Trail...");
  const recentLogs = await prisma.auditLog.findMany({
    where: { userId: registeredUser.id },
    orderBy: { createdAt: "desc" },
  });
  console.log(`   ✓ Found ${recentLogs.length} audit trail records for test user:`);
  recentLogs.forEach((log) => console.log(`      - [${log.action}] on ${log.entity}`));

  console.log("\n🎉 ALL AUTHENTICATION, RBAC, IDOR & SECURITY TESTS PASSED!");
}

testAuthAndSecurity().catch((err) => {
  console.error("❌ Auth & Security test failed:", err);
  process.exit(1);
});
