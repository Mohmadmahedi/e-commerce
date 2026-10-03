import { cache } from "./utils/cache";
import { jobQueue } from "./jobs/queue";
import { monitoring } from "./utils/monitoring";
import { backupEngine } from "./jobs/backup";
import prisma from "@/lib/prisma";

async function runStep13Tests() {
  console.log("=================================================");
  console.log("🧪 RUNNING STEP 13: QUEUE, CACHE, MONITORING & BACKUPS");
  console.log("=================================================");

  // 1. Test Universal Cache Engine
  const cacheKey = `test_product_${Date.now()}`;
  const testPayload = { id: "p1", title: "Kanjivaram Silk Saree", price: 45000 };

  await cache.set(cacheKey, testPayload, 60);
  const cachedVal = await cache.get<typeof testPayload>(cacheKey);

  if (!cachedVal || cachedVal.title !== testPayload.title) {
    throw new Error("❌ Cache read/write failed");
  }
  console.log("✅ 1. Cache set & get verified:", cachedVal.title);

  // Pattern invalidation
  await cache.set("products:category:women", { count: 12 });
  await cache.set("products:category:men", { count: 8 });
  await cache.delPattern("products:category:*");

  const patternTest = await cache.get("products:category:women");
  if (patternTest !== null) {
    throw new Error("❌ Pattern cache invalidation failed");
  }
  console.log("✅ 2. Cache pattern wildcard invalidation verified.");

  const cacheStatus = await cache.status();
  console.log("✅ 3. Cache status active:", cacheStatus.engine, `(${cacheStatus.cachedKeysCount} keys)`);

  // 4. Test Background Job Queue
  const jobId = await jobQueue.add("INVOICE_GENERATION", {
    orderId: "mock_order_123",
  });
  console.log("✅ 4. Background Job enqueued with ID:", jobId);

  const queueStatus = jobQueue.getStatus();
  if (queueStatus.status !== "active") {
    throw new Error("❌ Job queue worker not active");
  }
  console.log("✅ 5. Job queue worker status active:", queueStatus.status);

  // 6. Test Monitoring & Performance Profiling
  const monitoredResult = await monitoring.measureAsync("Database Latency Probe", async () => {
    return prisma.$queryRaw`SELECT 1`;
  });
  if (!monitoredResult) {
    throw new Error("❌ Monitoring wrapper failed");
  }
  monitoring.captureMessage("Test diagnostic message from Step 13", "info");
  console.log("✅ 6. Monitoring service execution profiling verified.");

  // 7. Test Database Backup Engine
  const backupMeta = await backupEngine.createBackup();
  if (!backupMeta.backupFile || backupMeta.tableCounts.products === 0) {
    throw new Error("❌ Backup creation failed or captured 0 products");
  }
  console.log(
    "✅ 7. Automated database backup created:",
    backupMeta.backupFile,
    `(${backupMeta.tableCounts.products} products, ${backupMeta.tableCounts.orders} orders)`
  );

  const integrityValid = await backupEngine.verifyBackupIntegrity(backupMeta.backupFile);
  if (!integrityValid) {
    throw new Error("❌ Backup integrity verification failed");
  }
  console.log("✅ 8. Backup snapshot integrity verified against schema.");

  const allBackups = await backupEngine.listBackups();
  console.log("✅ 9. Backup directory lists", allBackups.length, "point-in-time snapshots.");

  console.log("=================================================");
  console.log("🎉 ALL STEP 13 TESTS PASSED SUCCESSFULLY!");
  console.log("=================================================");
}

runStep13Tests()
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
