"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Heart,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  Tag,
  Check,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { formatINR } from "@/lib/utils";
import type { CartCalculationResult } from "@/server/services/cart.service";

const PROMO_COUPONS = [
  { code: "WELCOME10", desc: "10% off on your first order above ₹1,999", min: 1999 },
  { code: "FESTIVE25", desc: "25% off festive luxury attire above ₹4,999", min: 4999 },
  { code: "LUXE500", desc: "Flat ₹500 off on orders above ₹2,999", min: 2999 },
];

export function CartPageView() {
  const guestToken = useCartStore((state) => state.guestToken);
  const setItemCount = useCartStore((state) => state.setItemCount);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  const [cartData, setCartData] = useState<CartCalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/cart?guestToken=${guestToken}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCartData(json.data);
        const totalItems = json.data.items.reduce(
          (sum: number, it: any) => sum + it.quantity,
          0
        );
        setItemCount(totalItems);
      }
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [guestToken]);

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    try {
      const res = await fetch("/api/v1/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQty, guestToken }),
      });
      const json = await res.json();
      if (json.success) {
        setCartData(json.data);
        const totalItems = json.data.items.reduce(
          (sum: number, it: any) => sum + it.quantity,
          0
        );
        setItemCount(totalItems);
      }
    } catch (err) {
      console.error("Failed to update item quantity", err);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      const res = await fetch(`/api/v1/cart?itemId=${itemId}&guestToken=${guestToken}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setCartData(json.data);
        const totalItems = json.data.items.reduce(
          (sum: number, it: any) => sum + it.quantity,
          0
        );
        setItemCount(totalItems);
      }
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const handleMoveToWishlist = async (itemId: string, productId: string) => {
    toggleWishlist(productId);
    await handleRemove(itemId);
  };

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;

    setCouponError(null);
    setCouponSuccess(null);
    setCouponLoading(true);

    try {
      const res = await fetch("/api/v1/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, guestToken }),
      });

      const json = await res.json();
      if (json.success) {
        setCartData(json.data);
        setCouponSuccess(`Coupon ${code} applied successfully!`);
        setCouponCode("");
      } else {
        setCouponError(json.error || "Unable to apply coupon");
      }
    } catch (err: any) {
      setCouponError(err.message || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      const res = await fetch(`/api/v1/cart/coupon?guestToken=${guestToken}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setCartData(json.data);
        setCouponSuccess(null);
        setCouponError(null);
      }
    } catch (err) {
      console.error("Failed to remove coupon", err);
    }
  };

  if (loading && !cartData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-wider text-ink-muted">Loading your shopping bag...</p>
        </div>
      </div>
    );
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-20 h-20 rounded-full bg-surface-warm flex items-center justify-center mb-6 border border-[#E5E0D8]">
          <ShoppingBag className="w-9 h-9 text-ink-muted stroke-1" />
        </div>
        <h1 className="font-serif text-3xl font-light text-ink">Your Shopping Bag is Empty</h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-2 max-w-md font-light leading-relaxed">
          Discover our curated Banarasi Katan silks, Jodhpur raw silk bandhgalas, and Normandy linen
          co-ords crafted for discerning patrons.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/women/sarees"
            className="bg-ink hover:bg-emerald-600 text-surface text-xs font-semibold uppercase tracking-wider px-8 py-3.5 rounded-full transition-colors shadow-subtle"
          >
            Explore Women's Atelier
          </Link>
          <Link
            href="/men/kurtas"
            className="bg-surface-card border border-[#E5E0D8] text-ink hover:bg-surface-warm text-xs font-semibold uppercase tracking-wider px-8 py-3.5 rounded-full transition-colors"
          >
            Explore Men's Atelier
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Title */}
      <div className="border-b border-[#E5E0D8] pb-6 mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">
          Shopping Bag ({cartData.items.length} items)
        </h1>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="bg-surface-card rounded-2xl p-5 border border-[#E5E0D8] shadow-subtle mb-8 text-xs">
        {cartData.freeShippingQualified ? (
          <div className="flex items-center gap-2.5 text-emerald-700 font-medium">
            <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm">
              Congratulations! You have unlocked complimentary Express Air Shipping.
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-ink font-medium">
                Add <strong className="text-emerald-700 font-semibold">{formatINR(cartData.amountNeededForFreeShipping)}</strong> more to qualify for complimentary Express Shipping
              </span>
              <span className="text-ink-muted">Threshold: ₹999</span>
            </div>
            <div className="w-full bg-surface-warm h-2 rounded-full overflow-hidden border border-[#E5E0D8]">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (cartData.subtotal / 999) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Items (Left) vs Summary & Coupons (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Cart Items (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {cartData.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl border border-[#E5E0D8] bg-surface-card shadow-subtle"
            >
              {/* Product Thumbnail */}
              <Link
                href={`/product/${item.productId}`}
                className="w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden bg-surface-warm shrink-0 border border-[#E5E0D8] block"
              >
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              </Link>

              {/* Item Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/product/${item.productId}`} className="hover:text-emerald-700 transition-colors">
                      <h3 className="font-serif text-base sm:text-lg font-normal text-ink line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 text-ink-faint hover:text-rose-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-ink-muted mt-1">
                    Color: <span className="text-ink font-medium">{item.color}</span> • Size:{" "}
                    <span className="text-ink font-medium">{item.size}</span> • SKU: {item.sku}
                  </p>

                  <div className="flex items-baseline gap-2.5 mt-2">
                    <span className="font-semibold text-ink text-base">
                      {formatINR(item.price)}
                    </span>
                    {item.mrp > item.price && (
                      <span className="text-xs text-ink-faint line-through">
                        {formatINR(item.mrp)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Stepper & Move to Wishlist */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F0EBE1]">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-[#E5E0D8] rounded-xl bg-surface-warm">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-surface-card rounded-l-xl text-ink-muted transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3.5 text-xs font-semibold text-ink">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-surface-card rounded-r-xl text-ink-muted transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Move to Wishlist Button */}
                  <button
                    onClick={() => handleMoveToWishlist(item.id, item.productId)}
                    className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-rose-600 font-medium transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Move to Wishlist</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary & Coupons (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Coupon Application Box */}
          <div className="bg-surface-card rounded-2xl p-6 border border-[#E5E0D8] shadow-subtle space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Apply Promotion Coupon</span>
            </div>

            {cartData.couponCode ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Coupon <strong className="font-mono">{cartData.couponCode}</strong> applied (-{formatINR(cartData.couponDiscount)})
                  </span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleApplyCoupon();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code (e.g. WELCOME10)"
                    className="w-full bg-surface-warm border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-xs text-ink uppercase tracking-wider placeholder:normal-case placeholder:text-ink-faint focus:outline-none focus:border-ink font-mono"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-ink hover:bg-emerald-600 text-surface text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-xl disabled:opacity-50 transition-colors shrink-0"
                  >
                    {couponLoading ? "Applying..." : "Apply"}
                  </button>
                </form>

                {couponError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponError}</span>
                  </div>
                )}
                {couponSuccess && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 pt-1">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponSuccess}</span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Click Available Coupons */}
            <div className="pt-2 border-t border-[#F0EBE1] space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-ink-muted block font-semibold">
                Available Offers:
              </span>
              <div className="space-y-1.5">
                {PROMO_COUPONS.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleApplyCoupon(c.code)}
                    className="w-full text-left p-2.5 rounded-lg border border-dashed border-[#DCD6CD] hover:border-emerald-600 bg-surface-warm/50 text-xs flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <span className="font-mono font-bold text-emerald-700 tracking-wider">
                        {c.code}
                      </span>
                      <p className="text-[11px] text-ink-muted mt-0.5">{c.desc}</p>
                    </div>
                    <span className="text-[10px] uppercase font-semibold text-ink group-hover:text-emerald-700">
                      Tap to Apply
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Price Breakdown Card */}
          <div className="bg-surface-card rounded-2xl p-6 border border-[#E5E0D8] shadow-subtle space-y-4">
            <h3 className="font-serif text-lg font-medium text-ink pb-3 border-b border-[#E5E0D8]">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-ink-soft">
                <span>Total MRP (Incl. of taxes)</span>
                <span>{formatINR(cartData.totalMrp)}</span>
              </div>

              {cartData.discountOnMrp > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Bag Discount</span>
                  <span>-{formatINR(cartData.discountOnMrp)}</span>
                </div>
              )}

              {cartData.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Savings ({cartData.couponCode})</span>
                  <span>-{formatINR(cartData.couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-ink-soft">
                <span>Estimated GST (12% Included)</span>
                <span>{formatINR(cartData.gstAmount)}</span>
              </div>

              <div className="flex justify-between text-ink-soft">
                <span>Shipping Fee</span>
                <span>
                  {cartData.freeShippingQualified ? (
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  ) : (
                    formatINR(cartData.shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-semibold text-ink pt-3 border-t border-[#E5E0D8]">
                <span>Total Amount</span>
                <span className="font-serif text-lg">{formatINR(cartData.finalTotal)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="w-full bg-ink hover:bg-emerald-600 text-surface py-4 rounded-full text-xs font-semibold uppercase tracking-wider text-center transition-all shadow-luxury flex items-center justify-center gap-2 mt-4 hover:scale-[1.01]"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-ink-muted pt-2 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>256-Bit SSL Encrypted • PCI-DSS Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPageView;
