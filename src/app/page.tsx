import Link from "next/link";
import prisma from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { ShopByGender } from "@/components/home/ShopByGender";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { DealCountdown } from "@/components/home/DealCountdown";
import { BrandStory } from "@/components/home/BrandStory";
import { CustomerReviews } from "@/components/home/CustomerReviews";
import { InstagramGallery } from "@/components/home/InstagramGallery";
import { ArrowRight, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Query live catalog products for New Arrivals and Best Sellers in parallel
  const [newArrivals, bestSellers] = await Promise.all([
    prisma.product.findMany({
      where: { isNewArrival: true, isArchived: false },
      take: 8,
      include: {
        category: true,
        images: { orderBy: { displayOrder: "asc" } },
        variants: { where: { isAvailable: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isBestSeller: true, isArchived: false },
      take: 8,
      include: {
        category: true,
        images: { orderBy: { displayOrder: "asc" } },
        variants: { where: { isAvailable: true } },
      },
      orderBy: { rating: "desc" },
    }),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink">
      {/* 1. Hero Carousel */}
      <HeroCarousel />

      {/* 2. Shop By Department (Women, Men, Festive) */}
      <ShopByGender />

      {/* 3. Visual Circular Category Grid */}
      <CategoryGrid />

      {/* 4. New Arrivals Showcase */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#E5E0D8]">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-semibold text-emerald-600 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Fresh Off The Loom</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink font-light">
              New Arrivals This Week
            </h2>
          </div>

          <Link
            href="/women?isNewArrival=true"
            className="text-xs font-semibold uppercase tracking-wider text-emerald-700 hover:text-ink transition-colors flex items-center gap-1.5"
          >
            <span>View All New</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              slug={product.slug}
              categoryName={product.category.name}
              fit={product.fit}
              basePrice={product.basePrice}
              baseMrp={product.baseMrp}
              discountPercent={product.discountPercent}
              rating={product.rating}
              reviewCount={product.reviewCount}
              images={product.images}
              variants={product.variants}
              isNewArrival={product.isNewArrival}
              isBestSeller={product.isBestSeller}
            />
          ))}
        </div>
      </section>

      {/* 5. Festive Banner with Live Deal Countdown */}
      <DealCountdown />

      {/* 6. Best Sellers Showcase */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#E5E0D8]">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-semibold text-emerald-600 mb-1">
              <span>Couture Classics</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink font-light">
              Most Coveted Best Sellers
            </h2>
          </div>

          <Link
            href="/women?isBestSeller=true"
            className="text-xs font-semibold uppercase tracking-wider text-emerald-700 hover:text-ink transition-colors flex items-center gap-1.5"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              slug={product.slug}
              categoryName={product.category.name}
              fit={product.fit}
              basePrice={product.basePrice}
              baseMrp={product.baseMrp}
              discountPercent={product.discountPercent}
              rating={product.rating}
              reviewCount={product.reviewCount}
              images={product.images}
              variants={product.variants}
              isNewArrival={product.isNewArrival}
              isBestSeller={product.isBestSeller}
            />
          ))}
        </div>
      </section>

      {/* 7. Brand Story & Atelier Heritage */}
      <BrandStory />

      {/* 8. Patron Testimonials & Reviews */}
      <CustomerReviews />

      {/* 9. Social & Editorial Instagram Gallery */}
      <InstagramGallery />
    </div>
  );
}
