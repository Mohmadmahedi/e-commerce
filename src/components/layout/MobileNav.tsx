"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ChevronRight, Search, Heart, ShoppingBag, User, PhoneCall } from "lucide-react";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [activeTab, setActiveTab] = useState<"women" | "men" | "festive">("women");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-surface-card shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
        {/* Top Header */}
        <div className="p-4 border-b border-[#E5E0D8] flex items-center justify-between">
          <span className="font-serif text-2xl font-bold tracking-widest text-ink">AVANYA</span>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-warm text-ink-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gender Navigation Tabs */}
        <div className="grid grid-cols-3 border-b border-[#E5E0D8] bg-surface">
          <button
            onClick={() => setActiveTab("women")}
            className={`py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "women"
                ? "border-emerald-500 text-emerald-600 bg-surface-card"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            Women
          </button>
          <button
            onClick={() => setActiveTab("men")}
            className={`py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "men"
                ? "border-emerald-500 text-emerald-600 bg-surface-card"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            Men
          </button>
          <button
            onClick={() => setActiveTab("festive")}
            className={`py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "festive"
                ? "border-emerald-500 text-emerald-600 bg-surface-card"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            Festive
          </button>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {activeTab === "women" && (
            <>
              <Link
                href="/women/sarees"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-warm text-sm text-ink font-medium"
              >
                <span>Pure Silk Sarees</span>
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </Link>
              <Link
                href="/women/lehengas"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-warm text-sm text-ink font-medium"
              >
                <span>Bridal & Party Lehengas</span>
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </Link>
              <Link
                href="/women/kurtis"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-warm text-sm text-ink font-medium"
              >
                <span>Chikankari Kurta Sets</span>
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </Link>
              <Link
                href="/women/dresses"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-warm text-sm text-ink font-medium"
              >
                <span>Silk Dresses & Evening Gowns</span>
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </Link>
              <Link
                href="/women/co-ord-sets"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-warm text-sm text-ink font-medium"
              >
                <span>Normandy Linen Co-ords</span>
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </Link>
              <Link
                href="/women/jewellery"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-warm text-sm text-ink font-medium"
              >
                <span>Heritage Kundan Jewellery</span>
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </Link>
              <Link
                href="/women/bags"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-warm text-sm text-ink font-medium"
              >
                <span>Embroidered Potlis & Clutches</span>
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </Link>
            </>
          )}

          {activeTab === "men" && (
            <>
              <Link
                href="/men/kurtas"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-warm text-sm text-ink font-medium"
              >
                <span>Pure Silk Kurtas</span>
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </Link>
              <Link
                href="/men/ethnic-wear"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-warm text-sm text-ink font-medium"
              >
                <span>Jodhpur Bandhgalas</span>
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </Link>
              <Link
                href="/men/shirts"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-warm text-sm text-ink font-medium"
              >
                <span>Giza Cotton Formal Shirts</span>
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </Link>
              <Link
                href="/men/trousers"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-warm text-sm text-ink font-medium"
              >
                <span>Italian Wool Gurkha Trousers</span>
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </Link>
              <Link
                href="/men/footwear"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-warm text-sm text-ink font-medium"
              >
                <span>Cushioned Kolhapuris</span>
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </Link>
              <Link
                href="/men/accessories"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-warm text-sm text-ink font-medium"
              >
                <span>Chronographs & Cufflinks</span>
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </Link>
            </>
          )}

          {activeTab === "festive" && (
            <>
              <Link
                href="/collections/royal-festive"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-warm text-sm text-ink font-medium"
              >
                <span>The Royal Festive Edit</span>
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </Link>
              <Link
                href="/collections/imperial-wedding"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-warm text-sm text-ink font-medium"
              >
                <span>Imperial Wedding Collection</span>
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </Link>
              <Link
                href="/kids"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-warm text-sm text-ink font-medium"
              >
                <span>Kids Royal Festive Edit</span>
                <ChevronRight className="w-4 h-4 text-ink-faint" />
              </Link>
            </>
          )}
        </div>

        {/* Bottom Quick Actions */}
        <div className="p-4 border-t border-[#E5E0D8] bg-surface space-y-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
          <Link
            href="/account"
            onClick={onClose}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-warm"
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>My Account & Orders</span>
          </Link>
          <Link
            href="/wishlist"
            onClick={onClose}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-warm"
          >
            <Heart className="w-4 h-4 text-emerald-600" />
            <span>Saved Wishlist</span>
          </Link>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            <span>WhatsApp Concierge</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default MobileNav;
