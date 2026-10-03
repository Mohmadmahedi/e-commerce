"use client";

import { X } from "lucide-react";
import { FilterSidebar } from "./FilterSidebar";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  totalResults: number;
}

export function MobileFilterDrawer({ isOpen, onClose, totalResults }: MobileFilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-out Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-surface-card shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#E5E0D8] flex items-center justify-between">
          <h3 className="font-serif text-lg font-medium text-ink">Filter Catalog</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-warm text-ink-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <FilterSidebar />
        </div>

        {/* Sticky Apply Footer */}
        <div className="p-4 border-t border-[#E5E0D8] bg-surface">
          <button
            onClick={onClose}
            className="w-full bg-ink text-surface py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-center hover:bg-emerald-600 transition-colors shadow-lg"
          >
            Show {totalResults} Masterpieces
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileFilterDrawer;
