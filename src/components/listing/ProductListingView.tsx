"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterSidebar } from "./FilterSidebar";
import { MobileFilterDrawer } from "./MobileFilterDrawer";
import { SortDropdown } from "./SortDropdown";
import { ActiveFiltersBar } from "./ActiveFiltersBar";

interface ProductListingViewProps {
  title: string;
  description?: string | null;
  products: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function ProductListingView({
  title,
  description,
  products,
  pagination,
}: ProductListingViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  // Count how many filters are active
  const activeFiltersCount = [
    searchParams.get("sizes"),
    searchParams.get("colors"),
    searchParams.get("occasions"),
    searchParams.get("inStockOnly"),
    searchParams.get("minPrice"),
  ].filter(Boolean).length;

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* 1. Header Banner */}
      <div className="border-b border-[#E5E0D8] pb-6 mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-ink tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-xs sm:text-sm text-ink-muted max-w-3xl font-light leading-relaxed">
            {description}
          </p>
        )}

        {/* Top Control Bar: Total Count + Mobile Filter Trigger + Sort Dropdown */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#F0EBE1]">
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 bg-surface-card border border-[#E5E0D8] px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-ink shadow-subtle hover:bg-surface-warm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <span className="text-xs text-ink-muted">
              Showing <span className="font-semibold text-ink">{pagination.total}</span> pieces
            </span>
          </div>

          <SortDropdown />
        </div>
      </div>

      {/* 2. Main Two-Column Layout (Sidebar + Product Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar (1 Column) */}
        <div className="hidden lg:block lg:col-span-1">
          <FilterSidebar />
        </div>

        {/* Products Grid (3 Columns) */}
        <div className="lg:col-span-3">
          {/* Active Filter Tags */}
          <ActiveFiltersBar />

          {products.length === 0 ? (
            /* Empty State */
            <div className="bg-surface-card rounded-2xl border border-[#E5E0D8] p-12 text-center my-6">
              <PackageSearch className="w-12 h-12 text-ink-faint mx-auto stroke-1 mb-4" />
              <h3 className="font-serif text-xl font-normal text-ink">No matching masterpieces found</h3>
              <p className="text-xs text-ink-muted mt-2 max-w-sm mx-auto font-light">
                Try loosening your filters or exploring our other curated ateliers.
              </p>
              <button
                onClick={() => router.push(pathname)}
                className="mt-6 bg-ink text-surface text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-full hover:bg-emerald-600 transition-colors shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
              {products.map((product) => (
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
          )}

          {/* 3. Pagination Bar */}
          {pagination.totalPages > 1 && (
            <div className="mt-14 pt-8 border-t border-[#E5E0D8] flex items-center justify-between text-xs">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E5E0D8] bg-surface-card text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-warm font-medium shadow-subtle transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1.5 font-medium">
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pNum = i + 1;
                  const isCurrent = pNum === pagination.page;
                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                        isCurrent
                          ? "bg-ink text-surface shadow-sm"
                          : "text-ink-muted hover:bg-surface-warm hover:text-ink"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E5E0D8] bg-surface-card text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-warm font-medium shadow-subtle transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        totalResults={pagination.total}
      />
    </div>
  );
}

export default ProductListingView;
