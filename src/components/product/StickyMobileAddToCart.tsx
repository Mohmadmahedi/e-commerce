"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";

interface StickyMobileAddToCartProps {
  productId: string;
  title: string;
  imageUrl: string;
  variants: Array<{
    id: string;
    size: string;
    color: string;
    price: number;
    stock: number;
  }>;
}

export function StickyMobileAddToCart({
  productId,
  title,
  imageUrl,
  variants,
}: StickyMobileAddToCartProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || "");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const openCart = useCartStore((state) => state.openCart);
  const incrementCount = useCartStore((state) => state.incrementCount);
  const guestToken = useCartStore((state) => state.guestToken);

  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];

  const handleAddToCart = async () => {
    if (!activeVariant || activeVariant.stock <= 0) return;

    try {
      setAdding(true);
      const res = await fetch("/api/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          variantId: activeVariant.id,
          quantity: 1,
          guestToken,
        }),
      });

      const json = await res.json();
      if (json.success) {
        incrementCount(1);
        setAdded(true);
        setTimeout(() => {
          setAdded(false);
          openCart();
        }, 600);
      }
    } catch (err) {
      console.error("Failed to add to cart from mobile bar", err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed bottom-16 inset-x-0 bg-surface-card/95 backdrop-blur-md border-t border-[#E5E0D8] p-3 z-30 lg:hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-3">
        {/* Thumbnail */}
        <div className="w-12 h-14 rounded-lg overflow-hidden bg-surface-warm shrink-0 border border-[#E5E0D8]">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>

        {/* Info & Size Picker */}
        <div className="flex-1 min-w-0">
          <h4 className="font-serif text-xs font-medium text-ink truncate">{title}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-semibold text-xs text-ink">
              {formatINR(activeVariant?.price || 0)}
            </span>

            {variants.length > 1 && (
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="bg-surface-warm border border-[#E5E0D8] rounded text-[11px] px-2 py-0.5 text-ink focus:outline-none"
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                    {v.size} {v.stock <= 0 ? "(Sold Out)" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleAddToCart}
          disabled={adding || !activeVariant || activeVariant.stock <= 0}
          className="bg-ink hover:bg-emerald-600 text-surface text-xs font-semibold uppercase tracking-wider px-5 py-3 rounded-full shrink-0 shadow-md transition-colors flex items-center gap-1.5"
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Added</span>
            </>
          ) : activeVariant?.stock > 0 ? (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add To Bag</span>
            </>
          ) : (
            <span>Sold Out</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default StickyMobileAddToCart;
