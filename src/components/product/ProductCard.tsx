"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Star, ShoppingBag, Check } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  categoryName: string;
  fit?: string | null;
  basePrice: number;
  baseMrp: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  images: Array<{ url: string; alt?: string | null }>;
  variants: Array<{
    id: string;
    size: string;
    color: string;
    colorHex: string;
    stock: number;
    price: number;
  }>;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

export function ProductCard({
  id,
  title,
  slug,
  categoryName,
  fit,
  basePrice,
  baseMrp,
  discountPercent,
  rating,
  reviewCount,
  images,
  variants,
  isNewArrival,
  isBestSeller,
}: ProductCardProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [quickAdded, setQuickAdded] = useState(false);

  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(id));
  const openCart = useCartStore((state) => state.openCart);
  const incrementCount = useCartStore((state) => state.incrementCount);
  const guestToken = useCartStore((state) => state.guestToken);

  const currentVariant = variants[selectedVariantIndex] || variants[0];
  const primaryImg = images[0]?.url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800";
  const hoverImg = images[1]?.url || primaryImg;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentVariant || currentVariant.stock <= 0) return;

    try {
      await fetch("/api/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          variantId: currentVariant.id,
          quantity: 1,
          guestToken,
        }),
      });

      incrementCount(1);
      setQuickAdded(true);
      setTimeout(() => {
        setQuickAdded(false);
        openCart();
      }, 700);
    } catch (err) {
      console.error("Failed to quick add to cart", err);
    }
  };

  const isLowStock = currentVariant && currentVariant.stock > 0 && currentVariant.stock <= 5;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-surface-card rounded-xl border border-[#E5E0D8] overflow-hidden shadow-subtle hover:shadow-luxury-hover transition-luxury flex flex-col"
    >
      {/* 1. Image Container with Dual Image Hover Flip */}
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-warm">
        <Link href={`/product/${slug}`} className="block w-full h-full">
          <img
            src={isHovered ? hoverImg : primaryImg}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Wishlist Heart Toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
            isInWishlist
              ? "bg-white text-rose-500 shadow-md"
              : "bg-surface/80 text-ink hover:text-rose-500 hover:bg-white shadow-subtle"
          }`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? "fill-rose-500" : ""}`} />
        </button>

        {/* Badges Stack */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
          {isBestSeller && (
            <span className="bg-ink text-surface text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-sm">
              Best Seller
            </span>
          )}
          {isNewArrival && !isBestSeller && (
            <span className="bg-emerald-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-sm">
              New
            </span>
          )}
          {isLowStock && (
            <span className="bg-amber-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-sm">
              Only {currentVariant.stock} left
            </span>
          )}
        </div>

        {/* Quick Add Overlay on Hover */}
        <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
          <button
            onClick={handleQuickAdd}
            disabled={!currentVariant || currentVariant.stock <= 0}
            className="w-full bg-surface/95 backdrop-blur-md hover:bg-ink hover:text-white text-ink py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {quickAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Added To Bag</span>
              </>
            ) : currentVariant?.stock > 0 ? (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add • {currentVariant.size}</span>
              </>
            ) : (
              <span>Out Of Stock</span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Product Information */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-ink-muted mb-1">
            <span className="uppercase tracking-wider font-medium truncate max-w-[90px] sm:max-w-none">{categoryName}</span>
            {rating > 0 && (
              <div className="flex items-center gap-1 bg-surface-warm px-1.5 py-0.5 rounded border border-[#E5E0D8]">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-ink text-[9px] sm:text-[10px]">{rating}</span>
                <span className="text-ink-faint text-[8px] sm:text-[9px]">({reviewCount})</span>
              </div>
            )}
          </div>

          {/* Product Title */}
          <Link href={`/product/${slug}`} className="group-hover:text-emerald-700 transition-colors">
            <h3 className="font-serif text-xs sm:text-base font-normal text-ink line-clamp-1">
              {title}
            </h3>
          </Link>

          {/* Fit / Occasion */}
          <p className="text-[10px] sm:text-xs text-ink-muted mt-0.5 line-clamp-1">{fit || "Bespoke Cut"}</p>
        </div>

        {/* 3. Color Swatches & Price */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#F0EBE1] flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5">
          {/* Price Stack */}
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="font-semibold text-ink text-xs sm:text-base">
              {formatINR(basePrice)}
            </span>
            {baseMrp > basePrice && (
              <span className="text-[10px] sm:text-xs text-ink-faint line-through">
                {formatINR(baseMrp)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[9px] sm:text-xs text-emerald-600 font-medium">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Variant Color Swatches */}
          {variants.length > 1 && (
            <div className="flex items-center gap-1">
              {variants.slice(0, 3).map((v, idx) => (
                <button
                  key={v.id}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedVariantIndex(idx);
                  }}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    selectedVariantIndex === idx
                      ? "ring-1 ring-offset-1 ring-ink scale-110"
                      : "border-stone-300 opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: v.colorHex }}
                  title={`${v.color} - Size: ${v.size}`}
                  aria-label={`Select color ${v.color}`}
                />
              ))}
              {variants.length > 3 && (
                <span className="text-[10px] text-ink-faint">+{variants.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
