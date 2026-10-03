"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Zap, Heart, Check, Ruler, AlertCircle } from "lucide-react";
import { SizeChartModal } from "./SizeChartModal";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

interface ProductDetailClientActionsProps {
  product: {
    id: string;
    title: string;
    category: { name: string };
    variants: Array<{
      id: string;
      size: string;
      color: string;
      colorHex: string;
      price: number;
      mrp: number;
      stock: number;
      sku: string;
    }>;
  };
}

export function ProductDetailClientActions({ product }: ProductDetailClientActionsProps) {
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  const openCart = useCartStore((state) => state.openCart);
  const incrementCount = useCartStore((state) => state.incrementCount);
  const guestToken = useCartStore((state) => state.guestToken);

  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));

  const activeVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  // Group variants by unique colors and sizes
  const uniqueColors = Array.from(
    new Set(product.variants.map((v) => JSON.stringify({ color: v.color, hex: v.colorHex })))
  ).map((str) => JSON.parse(str));

  const availableSizes = product.variants.filter((v) => v.color === activeVariant.color);

  const handleAddToCart = async () => {
    if (!activeVariant || activeVariant.stock <= 0) return;

    try {
      setAddingToCart(true);
      const res = await fetch("/api/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          variantId: activeVariant.id,
          quantity,
          guestToken,
        }),
      });

      const json = await res.json();
      if (json.success) {
        incrementCount(quantity);
        setAddedSuccess(true);
        setTimeout(() => {
          setAddedSuccess(false);
          openCart();
        }, 600);
      }
    } catch (err) {
      console.error("Failed to add product to cart", err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!activeVariant || activeVariant.stock <= 0) return;

    try {
      setBuyingNow(true);
      await fetch("/api/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          variantId: activeVariant.id,
          quantity,
          guestToken,
        }),
      });
      incrementCount(quantity);
      router.push("/checkout");
    } catch (err) {
      console.error("Failed during buy now redirect", err);
    } finally {
      setBuyingNow(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Color Selector */}
      {uniqueColors.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-ink">
              Color: <strong className="text-emerald-700">{activeVariant.color}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {uniqueColors.map((c) => {
              const isSelected = activeVariant.color === c.color;
              return (
                <button
                  key={c.color}
                  onClick={() => {
                    const firstMatchingVariant = product.variants.find((v) => v.color === c.color);
                    if (firstMatchingVariant) setSelectedVariantId(firstMatchingVariant.id);
                  }}
                  className={`w-7 h-7 rounded-full border-2 transition-all relative ${
                    isSelected ? "border-emerald-600 ring-2 ring-emerald-600/30 scale-110" : "border-[#E5E0D8]"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.color}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Size Selector with Size Chart Trigger */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-ink">Select Size</span>
          <button
            onClick={() => setSizeChartOpen(true)}
            className="text-emerald-700 hover:text-ink font-medium inline-flex items-center gap-1 transition-colors underline underline-offset-4"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Size Guide</span>
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {availableSizes.map((variant) => {
            const isSelected = variant.id === activeVariant.id;
            const isOutOfStock = variant.stock <= 0;

            return (
              <button
                key={variant.id}
                onClick={() => setSelectedVariantId(variant.id)}
                disabled={isOutOfStock}
                className={`py-3 text-xs font-semibold rounded-xl border transition-all relative ${
                  isSelected
                    ? "bg-ink text-surface border-ink shadow-md"
                    : isOutOfStock
                    ? "bg-surface-warm/50 text-ink-faint border-[#E5E0D8] line-through cursor-not-allowed opacity-50"
                    : "bg-surface-card text-ink border-[#E5E0D8] hover:border-ink"
                }`}
              >
                <span>{variant.size}</span>
                {variant.stock > 0 && variant.stock <= 4 && (
                  <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Low Stock Warning */}
        {activeVariant.stock > 0 && activeVariant.stock <= 5 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 pt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Only {activeVariant.stock} pieces remaining in size {activeVariant.size}.</span>
          </div>
        )}
      </div>

      {/* 3. Primary CTAs: Add To Bag & Buy Now */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || activeVariant.stock <= 0}
            className="w-full bg-ink hover:bg-emerald-600 text-surface py-3.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-subtle flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {addedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Added To Bag</span>
              </>
            ) : activeVariant.stock > 0 ? (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>{addingToCart ? "Adding..." : "Add To Bag"}</span>
              </>
            ) : (
              <span>Currently Sold Out</span>
            )}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={buyingNow || activeVariant.stock <= 0}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-luxury flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>{buyingNow ? "Processing..." : "Buy Now"}</span>
          </button>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`w-full py-3 px-6 rounded-full border text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
            isInWishlist
              ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm"
              : "bg-surface-card border-[#E5E0D8] text-ink hover:bg-surface-warm"
          }`}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
          <span>{isInWishlist ? "Saved In Wishlist" : "Save To Wishlist"}</span>
        </button>
      </div>

      {/* Sizing Modal */}
      <SizeChartModal
        isOpen={sizeChartOpen}
        onClose={() => setSizeChartOpen(false)}
        categoryName={product.category.name}
      />
    </div>
  );
}

export default ProductDetailClientActions;
