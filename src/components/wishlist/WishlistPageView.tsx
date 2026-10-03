"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { ProductCard } from "@/components/product/ProductCard";

export function WishlistPageView() {
  const wishlistIds = useWishlistStore((state) => state.items);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch products matching wishlist IDs
        const res = await fetch(`/api/v1/products?limit=50`);
        const json = await res.json();
        if (json.success && json.data) {
          const matching = json.data.items.filter((item: any) =>
            wishlistIds.includes(item.id)
          );
          setProducts(matching);
        }
      } catch (err) {
        console.error("Failed to load wishlist items", err);
      } finally {
        setLoading(false);
      }
    }

    loadWishlistProducts();
  }, [wishlistIds]);

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full min-h-[70vh]">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-[#E5E0D8] pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-semibold text-emerald-600 mb-1">
            <Heart className="w-3.5 h-3.5 fill-emerald-600" />
            <span>Saved Favorites</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">
            My Wishlist ({wishlistIds.length} items)
          </h1>
        </div>

        {wishlistIds.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs text-ink-muted hover:text-rose-600 font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Wishlist</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs uppercase tracking-wider text-ink-muted">Loading your favorites...</p>
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-surface-warm flex items-center justify-center mx-auto mb-6 border border-[#E5E0D8]">
            <Heart className="w-9 h-9 text-ink-muted stroke-1" />
          </div>
          <h3 className="font-serif text-2xl font-light text-ink">Your Wishlist is Empty</h3>
          <p className="text-xs sm:text-sm text-ink-muted mt-2 font-light leading-relaxed">
            Curate your bespoke wardrobe. Tap the heart icon on any saree, bandhgala, or couture piece
            to save it here for future consideration.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/women/sarees"
              className="bg-ink hover:bg-emerald-600 text-surface text-xs font-semibold uppercase tracking-wider px-7 py-3 rounded-full transition-colors shadow-subtle flex items-center gap-2"
            >
              <span>Explore Women</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/men/kurtas"
              className="bg-surface-card border border-[#E5E0D8] text-ink hover:bg-surface-warm text-xs font-semibold uppercase tracking-wider px-7 py-3 rounded-full transition-colors"
            >
              Explore Men
            </Link>
          </div>
        </div>
      ) : (
        /* Wishlist Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
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
    </div>
  );
}

export default WishlistPageView;
