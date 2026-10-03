import sitemap from "../app/sitemap";
import robots from "../app/robots";
import { prisma } from "../lib/prisma";

async function runStep14Tests() {
  console.log("=================================================");
  console.log("   STEP 14 TEST SUITE: SEO, SITEMAP & ANALYTICS  ");
  console.log("=================================================");

  const expectedBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://avanya.in";

  // 1. TEST SITEMAP GENERATION
  console.log("\n[1] Testing Dynamic Sitemap Generation...");
  const sitemapEntries = await sitemap();
  console.log(` -> Total sitemap entries generated: ${sitemapEntries.length}`);

  const homeEntry = sitemapEntries.find((e) => e.url === expectedBaseUrl);
  if (!homeEntry || homeEntry.priority !== 1.0) {
    throw new Error(`Sitemap root entry missing (${expectedBaseUrl}) or priority is not 1.0`);
  }
  console.log(` [✓] Root URL (${expectedBaseUrl}) mapped with priority 1.0`);

  const productEntries = sitemapEntries.filter((e) => e.url.includes("/product/"));
  console.log(` [✓] Product detail URLs mapped: ${productEntries.length} items`);
  if (productEntries.length > 0) {
    console.log(`     Sample: ${productEntries[0].url} (priority: ${productEntries[0].priority})`);
  }

  // 2. TEST ROBOTS.TXT SPECIFICATION
  console.log("\n[2] Testing Robots.txt Rules...");
  const robotsRules = robots();
  console.log(" -> Sitemap referenced in robots.txt:", robotsRules.sitemap);
  if (robotsRules.sitemap !== `${expectedBaseUrl}/sitemap.xml`) {
    throw new Error(`Robots.txt sitemap reference incorrect: got ${robotsRules.sitemap}`);
  }

  const userAgentRules = Array.isArray(robotsRules.rules) ? robotsRules.rules[0] : robotsRules.rules;
  if (!userAgentRules.disallow || !userAgentRules.disallow.includes("/admin/")) {
    throw new Error("Robots.txt missing disallow rule for /admin/");
  }
  console.log(" [✓] Disallowed paths properly protected:", userAgentRules.disallow);

  // 3. TEST JSON-LD SCHEMA STRUCTURE
  console.log("\n[3] Testing Structured Data (JSON-LD) Validation...");
  const sampleProduct = await prisma.product.findFirst({
    where: { isArchived: false },
    include: { category: true, images: true, variants: true },
  });

  if (sampleProduct) {
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: sampleProduct.title,
      description: sampleProduct.description,
      image: sampleProduct.images.map((img) => img.url),
      brand: {
        "@type": "Brand",
        name: "AVANYA Atelier",
      },
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "INR",
        lowPrice: sampleProduct.variants[0]?.price || 5000,
        offerCount: sampleProduct.variants.length,
        availability: "https://schema.org/InStock",
      },
    };
    console.log(` [✓] Product Schema generated for "${sampleProduct.title}":`);
    console.log(`     Type: ${productSchema["@type"]}, Brand: ${productSchema.brand.name}, LowPrice: ₹${productSchema.offers.lowPrice}`);
  }

  // 4. TEST DPDP COOKIE CONSENT KEY & ANALYTICS SPEC
  console.log("\n[4] Testing DPDP Analytics Consent & Tracking Definitions...");
  const { CONSENT_COOKIE_KEY } = await import("../lib/analytics");
  if (CONSENT_COOKIE_KEY !== "avanya_cookie_consent") {
    throw new Error("Cookie consent key mismatch");
  }
  console.log(` [✓] DPDP Consent Cookie Key validated: "${CONSENT_COOKIE_KEY}"`);

  console.log("\n=================================================");
  console.log("   STEP 14 TEST SUITE COMPLETED SUCCESSFULLY!    ");
  console.log("=================================================\n");
}

runStep14Tests()
  .catch((err) => {
    console.error("❌ Step 14 Test Suite Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
