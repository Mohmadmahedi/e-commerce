import { userService } from "./services/user.service";
import { userRepository } from "./repositories/user.repository";
import prisma from "@/lib/prisma";

async function runStep10Tests() {
  console.log("=================================================");
  console.log("🧪 RUNNING STEP 10: USER ACCOUNT & DPDP TESTS");
  console.log("=================================================");

  // 1. Get seeded customer
  const customer = await prisma.user.findFirst({
    where: { email: "ananya@example.com" },
  });

  if (!customer) {
    throw new Error("Seeded customer 'ananya@example.com' not found. Run db:seed first.");
  }
  console.log("✅ 1. Found seeded customer:", customer.name, `(${customer.id})`);

  // 2. Test Get Profile
  const profile = await userService.getProfile(customer.id);
  console.log("✅ 2. Profile retrieved:", profile.email, profile.role);

  // 3. Test Update Profile
  const updatedProfile = await userService.updateProfile(customer.id, {
    name: "Ananya Iyer Sharma",
    phone: "9811223344",
  });
  console.log("✅ 3. Profile updated:", updatedProfile.name, updatedProfile.phone);

  // 4. Test Address Creation
  const newAddress = await userService.createAddress(customer.id, {
    name: "Ananya Sharma",
    phone: "9811223344",
    addressLine1: "Penthouse B-22, Oberoi Sky City",
    addressLine2: "Western Express Highway, Borivali East",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400066",
    addressType: "WORK",
    isDefault: false,
  });
  console.log("✅ 4. Address created with Indian PIN code:", newAddress.postalCode, newAddress.city);

  // 5. Test IDOR Protection
  // Create a temporary second user to test that customer 1 cannot mutate customer 2's address
  const otherUser = await prisma.user.create({
    data: {
      name: "Other User",
      email: `test_other_${Date.now()}@example.com`,
      role: "CUSTOMER",
    },
  });

  let idorCaught = false;
  try {
    await userService.updateAddress(otherUser.id, newAddress.id, { city: "Hacked City" });
  } catch (err: any) {
    if (err.message.includes("IDOR Protection")) {
      idorCaught = true;
    }
  }

  if (!idorCaught) {
    throw new Error("❌ IDOR vulnerability: Other user was able to modify address!");
  }
  console.log("✅ 5. IDOR Guard successfully blocked cross-user address modification.");

  // Cleanup test user and test address
  await userService.deleteAddress(customer.id, newAddress.id);
  await prisma.user.delete({ where: { id: otherUser.id } });
  console.log("✅ 6. Address deleted & test user cleaned up.");

  // 7. Test DPDP Data Export
  const exportData = await userService.exportUserData(customer.id);
  if (!exportData || !exportData.orders || !exportData.addresses) {
    throw new Error("❌ DPDP Export missing core data structures");
  }
  console.log(
    "✅ 7. DPDP Data Export generated cleanly with:",
    `${exportData.addresses.length} addresses,`,
    `${exportData.orders.length} orders.`
  );

  console.log("=================================================");
  console.log("🎉 ALL STEP 10 TESTS PASSED SUCCESSFULLY!");
  console.log("=================================================");
}

runStep10Tests()
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
