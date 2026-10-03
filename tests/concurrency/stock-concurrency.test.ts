import { prisma } from "../../src/lib/prisma";
import { orderService } from "../../src/server/services/order.service";
import { cartService } from "../../src/server/services/cart.service";

export async function runConcurrencyTests() {
  console.log("\n--- [CONCURRENCY TESTS] Race Condition & Atomic Inventory Deduction ---");
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

  // 1. Create a temporary product & variant with EXACTLY 1 unit in stock
  const category = await prisma.category.findFirst();
  if (!category) {
    throw new Error("No category found to create test product");
  }

  const testProduct = await prisma.product.create({
    data: {
      title: "Test Haute Couture Limited Piece",
      slug: `test-couture-${Date.now()}`,
      description: "Exclusive single piece test garment",
      basePrice: 25000,
      baseMrp: 28000,
      categoryId: category.id,
      variants: {
        create: {
          sku: `SKU-RACE-${Date.now()}`,
          size: "Free Size",
          color: "Royal Ivory",
          colorHex: "#FFFFF0",
          price: 25000,
          mrp: 28000,
          stock: 1, // Only 1 unit in the world!
          isAvailable: true,
        },
      },
    },
    include: { variants: true },
  });

  const testVariant = testProduct.variants[0];
  console.log(`  -> Initialized test variant with stock = ${testVariant.stock} (ID: ${testVariant.id})`);

  // 2. Setup two concurrent shoppers with guest tokens
  const shopper1Token = `guest_race_1_${Date.now()}`;
  const shopper2Token = `guest_race_2_${Date.now()}`;

  // Shopper 1 adds item to bag
  await cartService.addToCart({
    productId: testProduct.id,
    variantId: testVariant.id,
    quantity: 1,
    guestToken: shopper1Token,
  });

  // Shopper 2 adds item to bag
  await cartService.addToCart({
    productId: testProduct.id,
    variantId: testVariant.id,
    quantity: 1,
    guestToken: shopper2Token,
  });

  // 3. Dispatch simultaneous checkout requests
  const checkoutPayload1 = {
    guestToken: shopper1Token,
    guestEmail: "shopper1@example.com",
    idempotencyKey: `idem_race_1_${Date.now()}`,
    paymentMethod: "COD" as const,
    shippingAddress: {
      name: "Shopper One",
      phone: "9876543210",
      addressLine1: "12 Marine Drive",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400020",
    },
    sameAsShipping: true,
  };

  const checkoutPayload2 = {
    guestToken: shopper2Token,
    guestEmail: "shopper2@example.com",
    idempotencyKey: `idem_race_2_${Date.now()}`,
    paymentMethod: "COD" as const,
    shippingAddress: {
      name: "Shopper Two",
      phone: "9123456780",
      addressLine1: "45 MG Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
    },
    sameAsShipping: true,
  };

  console.log("  -> Firing 2 simultaneous checkout requests for the last remaining unit...");
  const results = await Promise.allSettled([
    orderService.createCheckoutOrder(checkoutPayload1),
    orderService.createCheckoutOrder(checkoutPayload2),
  ]);

  const fulfilledCount = results.filter((r) => r.status === "fulfilled").length;
  const rejectedCount = results.filter((r) => r.status === "rejected").length;

  console.log(`  -> Results: ${fulfilledCount} succeeded, ${rejectedCount} rejected`);

  assert(fulfilledCount === 1, "Concurrency: Exactly 1 customer successfully purchased the last unit");
  assert(rejectedCount === 1, "Concurrency: The conflicting concurrent request was rejected with insufficient stock");

  // Verify stock in database is exactly 0 and NEVER negative
  const finalVariant = await prisma.productVariant.findUnique({
    where: { id: testVariant.id },
  });

  assert(finalVariant?.stock === 0, `Inventory: Final stock is exactly 0 (No overselling / negative stock: ${finalVariant?.stock})`);

  // Cleanup test product and order data
  for (const res of results) {
    if (res.status === "fulfilled") {
      const orderId = (res.value as any).orderId;
      await prisma.orderStatusHistory.deleteMany({ where: { orderId } });
      await prisma.payment.deleteMany({ where: { orderId } });
      await prisma.orderItem.deleteMany({ where: { orderId } });
      await prisma.order.delete({ where: { id: orderId } });
    }
  }

  await prisma.productVariant.delete({ where: { id: testVariant.id } });
  await prisma.product.delete({ where: { id: testProduct.id } });

  if (failed > 0) {
    throw new Error(`${failed} concurrency tests failed`);
  }
  return { passed, failed };
}

if (require.main === module) {
  runConcurrencyTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
