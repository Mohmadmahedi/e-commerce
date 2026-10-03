import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { productService } from "@/server/services/product.service";
import { formatINR } from "@/lib/utils";
import { ProductGallery } from "@/components/product/ProductGallery";
import { SizeChartModal } from "@/components/product/SizeChartModal";
import { PinCodeDeliveryCheck } from "@/components/product/PinCodeDeliveryCheck";
import { StickyMobileAddToCart } from "@/components/product/StickyMobileAddToCart";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductStructuredData } from "@/components/product/ProductStructuredData";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductDetailClientActions } from "@/components/product/ProductDetailClientActions";
import { ShieldCheck, RefreshCw, Truck, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { images: { take: 1 } },
  });

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.title} | AVANYA Luxury`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.title,
      description: product.description.substring(0, 160),
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await productService.getProductBySlug(params.slug).catch(() => null);

  if (!product) {
    notFound();
  }

  // Fetch "You May Also Like" from the same category or collection
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isArchived: false,
    },
    take: 4,
    include: {
      category: true,
      images: { orderBy: { displayOrder: "asc" } },
      variants: { where: { isAvailable: true } },
    },
  });

  return (
    <div className="min-h-screen bg-surface text-ink pb-36 lg:pb-24">
      {/* Schema.org Product JSON-LD */}
      <ProductStructuredData product={product} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-ink-muted mb-8 overflow-x-auto scrollbar-none whitespace-nowrap">
          <Link href="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-ink-faint shrink-0" />
          <Link href={`/${product.category.gender.toLowerCase()}`} className="hover:text-ink uppercase">
            {product.category.gender}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-ink-faint shrink-0" />
          <Link
            href={`/${product.category.gender.toLowerCase()}/${product.category.slug}`}
            className="hover:text-ink"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-ink-faint shrink-0" />
          <span className="text-ink font-medium truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Product Stage: 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Photo Gallery (7 Cols) */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.images}
              title={product.title}
              discountPercent={product.discountPercent}
              isBestSeller={product.isBestSeller}
            />
          </div>

          {/* Right Column: Pricing, Variant Selection & Actions (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-600 font-semibold block mb-1">
                {product.category.name}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-ink leading-tight">
                {product.title}
              </h1>
              <p className="text-xs text-ink-muted mt-1">{product.fit || "Artisanal Silhouette"}</p>
            </div>

            {/* Price Stack */}
            <div className="p-4 rounded-xl bg-surface-card border border-[#E5E0D8] space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-2xl sm:text-3xl font-semibold text-ink">
                  {formatINR(product.basePrice)}
                </span>
                {product.baseMrp > product.basePrice && (
                  <span className="text-sm text-ink-faint line-through">
                    {formatINR(product.baseMrp)}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Save {product.discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-ink-muted">
                Price is inclusive of all Indian taxes & GST. Free express air shipping.
              </p>
            </div>

            {/* Interactive Client Actions (Size, Color, Add To Bag, Buy Now) */}
            <ProductDetailClientActions product={product} />

            {/* Indian PIN Code Delivery Checker */}
            <PinCodeDeliveryCheck />

            {/* Trust Assurance Pillars */}
            <div className="grid grid-cols-3 gap-2 pt-4 text-center text-[10px] uppercase tracking-wider text-ink-soft">
              <div className="p-3 rounded-xl bg-surface-warm border border-[#E5E0D8] flex flex-col items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Authentic Handloom</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-warm border border-[#E5E0D8] flex flex-col items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-emerald-600" />
                <span>7-Day Easy Returns</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-warm border border-[#E5E0D8] flex flex-col items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Express Pan-India Air</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Detailed Information */}
        <ProductTabs
          description={product.description}
          fabricCare={product.fabricCare}
          occasion={product.occasion}
          fit={product.fit}
          rating={product.rating}
          reviewCount={product.reviewCount}
          reviews={product.reviews}
        />

        {/* "You May Also Like" Curated Recommendations */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[#E5E0D8]">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">
                  Complementary Curation
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl text-ink font-light mt-1">
                  You May Also Admire
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  id={rel.id}
                  title={rel.title}
                  slug={rel.slug}
                  categoryName={rel.category.name}
                  fit={rel.fit}
                  basePrice={rel.basePrice}
                  baseMrp={rel.baseMrp}
                  discountPercent={rel.discountPercent}
                  rating={rel.rating}
                  reviewCount={rel.reviewCount}
                  images={rel.images}
                  variants={rel.variants}
                  isNewArrival={rel.isNewArrival}
                  isBestSeller={rel.isBestSeller}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Bottom Bar on Mobile */}
      <StickyMobileAddToCart
        productId={product.id}
        title={product.title}
        imageUrl={product.images[0]?.url || ""}
        variants={product.variants}
      />
    </div>
  );
}
