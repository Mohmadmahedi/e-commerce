"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ShoppingBag, ArrowRight, Trash2, Plus, Minus, Truck } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatINR } from "@/lib/utils";
import type { CartCalculationResult } from "@/server/services/cart.service";

export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const guestToken = useCartStore((state) => state.guestToken);
  const setItemCount = useCartStore((state) => state.setItemCount);

  const [cartData, setCartData] = useState<CartCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);

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
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCart} />

      {/* Slide-out Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-surface-card shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#E5E0D8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h3 className="font-serif text-lg font-medium text-ink">Your Shopping Bag</h3>
            {cartData && cartData.items.length > 0 && (
              <span className="text-xs text-ink-muted">({cartData.items.length} items)</span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-surface-warm text-ink-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {cartData && (
          <div className="bg-surface-warm px-5 py-3 border-b border-[#E5E0D8] text-xs">
            {cartData.freeShippingQualified ? (
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <Truck className="w-4 h-4" />
                <span>You have unlocked complimentary Express Air Shipping!</span>
              </div>
            ) : (
              <div>
                <p className="text-ink-muted">
                  Add <span className="font-semibold text-ink">{formatINR(cartData.amountNeededForFreeShipping)}</span> more to unlock complimentary Express Shipping!
                </p>
                <div className="w-full bg-[#E5E0D8] h-1.5 rounded-full mt-2 overflow-hidden">
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
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading && !cartData ? (
            <div className="text-center py-12 text-ink-muted text-xs">Updating bag...</div>
          ) : !cartData || cartData.items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-ink-faint mx-auto stroke-1 mb-3" />
              <h4 className="font-serif text-base text-ink">Your bag is empty</h4>
              <p className="text-xs text-ink-muted mt-1 max-w-xs mx-auto">
                Explore our curated Banarasi silks, Jodhpur bandhgalas, and Normandy linen co-ords.
              </p>
              <button
                onClick={closeCart}
                className="mt-6 bg-ink text-surface text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-full hover:bg-emerald-600 transition-colors"
              >
                Discover Catalog
              </button>
            </div>
          ) : (
            cartData.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-3 rounded-xl border border-[#E5E0D8] bg-surface/50"
              >
                {/* Thumbnail */}
                <div className="w-20 h-24 rounded-lg overflow-hidden bg-surface-warm shrink-0">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-serif text-sm text-ink line-clamp-1">{item.title}</h5>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      {item.color} • Size {item.size}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-semibold text-ink text-xs">{formatINR(item.price)}</span>
                      {item.mrp > item.price && (
                        <span className="text-[10px] text-ink-faint line-through">{formatINR(item.mrp)}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-[#E5E0D8] rounded-lg bg-surface-card">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-surface-warm text-ink-muted"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-ink">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-surface-warm text-ink-muted"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1 text-ink-faint hover:text-rose-500 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with Subtotal & Checkout CTA */}
        {cartData && cartData.items.length > 0 && (
          <div className="p-5 border-t border-[#E5E0D8] bg-surface space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-ink-muted">
                <span>Subtotal</span>
                <span>{formatINR(cartData.subtotal)}</span>
              </div>
              {cartData.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatINR(cartData.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-muted">
                <span>Shipping</span>
                <span>{cartData.freeShippingQualified ? "FREE" : formatINR(cartData.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-ink pt-2 border-t border-[#E5E0D8]">
                <span>Total (GST Included)</span>
                <span>{formatINR(cartData.finalTotal)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={closeCart}
                className="w-full bg-surface-card border border-[#E5E0D8] text-ink py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-center hover:bg-surface-warm transition-colors"
              >
                View Full Bag
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full bg-ink text-surface py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-center hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
