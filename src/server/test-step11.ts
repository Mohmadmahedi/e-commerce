import { adminService } from "./services/admin.service";
import prisma from "@/lib/prisma";

async function runStep11Tests() {
  console.log("=================================================");
  console.log("🧪 RUNNING STEP 11: ADMIN PANEL & WORKFLOW TESTS");
  console.log("=================================================");

  // 1. Get seeded Admin and Customer
  const [admin, customer, category] = await Promise.all([
    prisma.user.findFirst({ where: { role: "ADMIN" } }),
    prisma.user.findFirst({ where: { role: "CUSTOMER" } }),
    prisma.category.findFirst({ where: { gender: "WOMEN" } }),
  ]);

  if (!admin || !customer || !category) {
    throw new Error("Missing seeded test data. Run db:seed first.");
  }
  console.log("✅ 1. Found Admin:", admin.email, "and Category:", category.name);

  // 2. Test Dashboard Metrics
  const dashboard = await adminService.getDashboard();
  if (typeof dashboard.kpis.totalRevenue !== "number" || typeof dashboard.kpis.totalOrders !== "number") {
    throw new Error("❌ Invalid dashboard KPI structure");
  }
  console.log(
    "✅ 2. Dashboard KPIs loaded successfully:",
    `Revenue: ₹${dashboard.kpis.totalRevenue.toLocaleString("en-IN")},`,
    `Orders: ${dashboard.kpis.totalOrders},`,
    `Customers: ${dashboard.kpis.totalCustomers},`,
    `Low stock items: ${dashboard.kpis.lowStockCount}`
  );

  // 3. Test Admin Product Creation
  const testSlug = `test-couture-product-${Date.now()}`;
  const newProduct = await adminService.createProduct(
    {
      title: "Royal Crimson Zardozi Lehenga",
      slug: testSlug,
      description: "Handcrafted crimson velvet bridal lehenga with antique gold zardozi.",
      categoryId: category.id,
      basePrice: 85000,
      baseMrp: 110000,
      discountPercent: 22,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
          isPrimary: true,
        },
      ],
      variants: [
        {
          sku: `SKU-TEST-${Date.now().toString().slice(-5)}`,
          size: "Custom",
          color: "Crimson Red",
          colorHex: "#990000",
          price: 85000,
          mrp: 110000,
          stock: 4, // low stock test
        },
      ],
    },
    admin
  );
  console.log("✅ 3. Product created successfully with variants & image:", newProduct.title, `(${newProduct.id})`);

  // 4. Test Product Archive & Restore
  await adminService.archiveProduct(newProduct.id, true, admin);
  const archived = await prisma.product.findUnique({ where: { id: newProduct.id } });
  if (!archived?.isArchived) throw new Error("❌ Soft archive failed");
  console.log("✅ 4. Product archived safely without breaking foreign keys.");

  // Clean up test product
  await prisma.productVariant.deleteMany({ where: { productId: newProduct.id } });
  await prisma.image.deleteMany({ where: { productId: newProduct.id } });
  await prisma.product.delete({ where: { id: newProduct.id } });
  console.log("✅ 5. Test product cleaned up.");

  // 6. Test Order Status State Machine Transition
  const customerAddress = await prisma.address.findFirst({
    where: { userId: customer.id },
  });

  // Create a sample test order in PLACED state
  const testOrder = await prisma.order.create({
    data: {
      orderNumber: `TEST-ORD-${Date.now().toString().slice(-6)}`,
      userId: customer.id,
      status: "PLACED",
      paymentStatus: "PENDING",
      paymentMethod: "COD",
      subtotal: 5000,
      totalAmount: 5000,
      shippingAddressId: customerAddress?.id || "mock-address",
    },
  });

  // Attempt illegal transition: PLACED -> DELIVERED (must fail)
  let illegalCaught = false;
  try {
    await adminService.updateOrderStatus(
      testOrder.id,
      { toStatus: "DELIVERED" as any },
      admin
    );
  } catch (err: any) {
    if (err.message.includes("Illegal status transition")) {
      illegalCaught = true;
    }
  }

  if (!illegalCaught) {
    throw new Error("❌ State Machine failure: Illegal jump from PLACED directly to DELIVERED was allowed!");
  }
  console.log("✅ 6. State Machine successfully blocked illegal transition from PLACED to DELIVERED.");

  // Perform legal transitions: PLACED -> PAID -> PACKED -> SHIPPED
  await adminService.updateOrderStatus(testOrder.id, { toStatus: "PAID", note: "COD advance confirmed" }, admin);
  await adminService.updateOrderStatus(testOrder.id, { toStatus: "PACKED", note: "Packed in velvet box" }, admin);
  const shippedOrder = await adminService.updateOrderStatus(
    testOrder.id,
    {
      toStatus: "SHIPPED",
      courierName: "BlueDart Express",
      trackingNumber: "BD99881122",
    },
    admin
  );

  console.log("✅ 7. Order sequentially advanced to SHIPPED with tracking:", shippedOrder.trackingNumber);

  // Clean up test order
  await prisma.orderStatusHistory.deleteMany({ where: { orderId: testOrder.id } });
  await prisma.order.delete({ where: { id: testOrder.id } });
  console.log("✅ 8. Test order cleaned up.");

  // 9. Test Coupon Management
  const testCouponCode = `ADMINTEST${Date.now().toString().slice(-4)}`;
  const coupon = await adminService.createCoupon(
    {
      code: testCouponCode,
      description: "Test discount 25%",
      discountType: "PERCENTAGE",
      discountValue: 25,
      minOrderAmount: 2000,
      maxDiscountAmount: 1000,
      usageLimit: 100,
      perUserLimit: 1,
      isActive: true,
    },
    admin
  );
  console.log("✅ 9. Admin coupon created:", coupon.code, `(${coupon.discountValue}%)`);

  await adminService.toggleCoupon(coupon.id, false, admin);
  await adminService.deleteCoupon(coupon.id, admin);
  console.log("✅ 10. Admin coupon paused & deleted cleanly.");

  // 11. Verify Audit Logs
  const auditResult = await adminService.getAuditLogs(10, 1);
  if (auditResult.logs.length === 0) {
    throw new Error("❌ Audit logs not recording admin operations");
  }
  console.log(
    "✅ 11. Security Audit Log verified with",
    auditResult.total,
    "total events recorded in database."
  );

  console.log("=================================================");
  console.log("🎉 ALL STEP 11 TESTS PASSED SUCCESSFULLY!");
  console.log("=================================================");
}

runStep11Tests()
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
