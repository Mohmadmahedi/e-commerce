"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Heart, ShoppingBag, User } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";

export function MobileBottomNav() {
  const pathname = usePathname();
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const cartCount = useCartStore((state) => state.itemCount);
  const openCart = useCartStore((state) => state.openCart);

  // Check active states
  const isHome = pathname === "/";
  const isExplore = pathname.startsWith("/women") || pathname.startsWith("/men") || pathname.startsWith("/collections");
  const isWishlist = pathname === "/wishlist";
  const isAccount = pathname.startsWith("/account") || pathname.startsWith("/auth");

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-[#E5E0D8] lg:hidden safe-area-bottom shadow-2xl"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isHome ? "text-emerald-700 font-semibold" : "text-ink-muted hover:text-ink"
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] tracking-tight mt-1">Home</span>
        </Link>

        {/* 2. Explore / Catalog */}
        <Link
          href="/women"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isExplore ? "text-emerald-700 font-semibold" : "text-ink-muted hover:text-ink"
          }`}
        >
          <Compass className={`w-5 h-5 ${isExplore ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] tracking-tight mt-1">Couture</span>
        </Link>

        {/* 3. Wishlist with live count badge */}
        <Link
          href="/wishlist"
          className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
            isWishlist ? "text-emerald-700 font-semibold" : "text-ink-muted hover:text-ink"
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${isWishlist ? "stroke-[2.5] fill-rose-500 text-rose-500" : "stroke-[1.75]"}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Wishlist</span>
        </Link>

        {/* 4. Bag / Cart Trigger with live count badge */}
        <button
          onClick={openCart}
          className="flex flex-col items-center justify-center py-1 text-ink-muted hover:text-ink transition-colors relative"
          aria-label="Open Shopping Bag"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Bag</span>
        </button>

        {/* 5. Account */}
        <Link
          href="/account"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isAccount ? "text-emerald-700 font-semibold" : "text-ink-muted hover:text-ink"
          }`}
        >
          <User className={`w-5 h-5 ${isAccount ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] tracking-tight mt-1">Account</span>
        </Link>
      </div>
    </nav>
  );
}
