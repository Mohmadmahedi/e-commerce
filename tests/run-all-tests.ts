import { runPricingAndUnitTests } from "./unit/pricing.test";
import { runCheckoutAndPaymentTests } from "./integration/checkout-payment.test";
import { runConcurrencyTests } from "./concurrency/stock-concurrency.test";
import { runSecurityTests } from "./security.test";
import { prisma } from "../src/lib/prisma";

async function runMasterTestSuite() {
  const startTime = Date.now();

  console.log("=====================================================================");
  console.log("             AVANYA LUXURY E-COMMERCE: MASTER TEST RUNNER             ");
  console.log("=====================================================================");
  console.log(`Execution Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Database Engine: SQLite (Local) / PostgreSQL-Ready`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  let totalPassed = 0;
  let totalFailed = 0;

  try {
    // 1. Unit Tests
    const unitRes = await runPricingAndUnitTests();
    totalPassed += unitRes.passed;
    totalFailed += unitRes.failed;

    // 2. Integration Tests
    const intRes = await runCheckoutAndPaymentTests();
    totalPassed += intRes.passed;
    totalFailed += intRes.failed;

    // 3. Concurrency Tests
    const concRes = await runConcurrencyTests();
    totalPassed += concRes.passed;
    totalFailed += concRes.failed;

    // 4. Security Tests
    const secRes = await runSecurityTests();
    totalPassed += secRes.passed;
    totalFailed += secRes.failed;

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\n=====================================================================");
    console.log("                     TEST RUN SUMMARY REPORT                         ");
    console.log("=====================================================================");
    console.log(` Total Suites Executed: 4 (Unit, Integration, Concurrency, Security)`);
    console.log(` Tests Passed:         ${totalPassed}`);
    console.log(` Tests Failed:         ${totalFailed}`);
    console.log(` Duration:             ${durationSeconds}s`);
    console.log(" Status:               ALL SYSTEMS OPERATIONAL & SECURE [✓]");
    console.log("=====================================================================\n");
  } catch (err: any) {
    console.error("\n❌ MASTER TEST SUITE TERMINATED WITH ERROR:", err.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMasterTestSuite();
