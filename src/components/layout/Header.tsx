"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, Heart, ShoppingBag, User, X } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";

export function Header() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<"women" | "men" | "festive" | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const wishlistCount = useWishlistStore((state) => state.items.length);
  const cartCount = useCartStore((state) => state.itemCount);
  const openCart = useCartStore((state) => state.openCart);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-[#E5E0D8] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* 1. Mobile Menu Button & Desktop Main Nav */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-2 -ml-2 rounded-lg text-ink lg:hidden hover:bg-surface-warm transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-1 group">
              <span className="font-serif text-2xl sm:text-3xl font-light tracking-[0.2em] text-ink group-hover:text-emerald-600 transition-colors">
                AVANYA
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.15em] text-ink-soft ml-6">
              <div
                onMouseEnter={() => setActiveMenu("women")}
                className="py-6 cursor-pointer hover:text-emerald-600 transition-colors"
              >
                <Link href="/women">Women</Link>
              </div>
              <div
                onMouseEnter={() => setActiveMenu("men")}
                className="py-6 cursor-pointer hover:text-emerald-600 transition-colors"
              >
                <Link href="/men">Men</Link>
              </div>
              <div
                onMouseEnter={() => setActiveMenu("festive")}
                className="py-6 cursor-pointer hover:text-emerald-600 transition-colors"
              >
                <Link href="/collections/royal-festive">Festive & Wedding</Link>
              </div>
              <Link
                href="/about"
                className="py-6 hover:text-emerald-600 transition-colors"
              >
                The Atelier
              </Link>
            </nav>
          </div>

          {/* 2. Action Icons (Search, Wishlist, Cart, Account) */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-surface-warm text-ink transition-colors relative"
              aria-label="Search catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon with Live Count */}
            <Link
              href="/wishlist"
              className="p-2 rounded-full hover:bg-surface-warm text-ink transition-colors relative"
              aria-label="View wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-50">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger with Count */}
            <button
              onClick={openCart}
              className="p-2 rounded-full hover:bg-surface-warm text-ink transition-colors relative"
              aria-label="Open shopping bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-50">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account Profile Link */}
            <Link
              href="/account"
              className="p-2 rounded-full hover:bg-surface-warm text-ink transition-colors"
              aria-label="Account profile"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* 3. Interactive Search Bar Modal/Drawer */}
        {searchOpen && (
          <div className="border-t border-[#E5E0D8] bg-surface-card py-4 px-6 animate-in slide-in-from-top-1 duration-200">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-3">
              <Search className="w-5 h-5 text-ink-muted shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Banarasi sarees, bandhgalas, linen shirts, silk lehengas..."
                className="w-full bg-transparent text-sm md:text-base text-ink focus:outline-none placeholder:text-ink-faint"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-ink-muted hover:text-ink"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded hover:bg-surface-warm text-ink-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* 4. Desktop Mega-Menu Hover Container */}
        <MegaMenu activeTab={activeMenu} onClose={() => setActiveMenu(null)} />
      </header>

      {/* 5. Mobile Navigation Slide-out */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}

export default Header;
