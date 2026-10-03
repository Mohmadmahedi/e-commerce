"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Check, X, RotateCcw } from "lucide-react";

const SIZES = ["Free Size", "XS", "S", "M", "L", "XL", "XXL", "38", "40", "42", "44", "30", "32", "34", "36"];

const COLORS = [
  { name: "Deep Emerald", hex: "#0B5D4B" },
  { name: "Warm Ivory", hex: "#FAF8F5" },
  { name: "Midnight Black", hex: "#111111" },
  { name: "Terracotta Earth", hex: "#C8553D" },
  { name: "Molten Gold", hex: "#C5A880" },
  { name: "Crimson Red", hex: "#8B0000" },
  { name: "Midnight Navy", hex: "#0F1A2C" },
  { name: "Sage Mist", hex: "#86C1B1" },
];

const OCCASIONS = [
  "Festive & Wedding",
  "Cocktail & Reception",
  "Executive & Formal",
  "Casual Chic",
  "Resort & Travel",
];

const PRICE_RANGES = [
  { label: "Under ₹3,000", min: 0, max: 3000 },
  { label: "₹3,000 - ₹7,000", min: 3000, max: 7000 },
  { label: "₹7,000 - ₹15,000", min: 7000, max: 15000 },
  { label: "₹15,000 - ₹25,000", min: 15000, max: 25000 },
  { label: "Above ₹25,000", min: 25000, max: 100000 },
];

export function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper to update URL search params while preserving other filters
  const updateQuery = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset to page 1 on filter change

    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Helper for multi-select (comma-separated values)
  const toggleArrayFilter = (key: string, value: string) => {
    const currentStr = searchParams.get(key) || "";
    const list = currentStr ? currentStr.split(",").map((s) => s.trim()) : [];

    let updated: string[];
    if (list.includes(value)) {
      updated = list.filter((item) => item !== value);
    } else {
      updated = [...list, value];
    }

    updateQuery(key, updated.length > 0 ? updated.join(",") : null);
  };

  const selectedSizes = (searchParams.get("sizes") || "").split(",").filter(Boolean);
  const selectedColors = (searchParams.get("colors") || "").split(",").filter(Boolean);
  const selectedOccasions = (searchParams.get("occasions") || "").split(",").filter(Boolean);
  const inStockOnly = searchParams.get("inStockOnly") === "true";
  const currentMinPrice = searchParams.get("minPrice");
  const currentMaxPrice = searchParams.get("maxPrice");

  const clearAllFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters =
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedOccasions.length > 0 ||
    inStockOnly ||
    currentMinPrice !== null ||
    currentMaxPrice !== null;

  return (
    <aside className="w-full space-y-8 pr-4">
      {/* Top Header with Clear Action */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D8]">
        <h3 className="font-serif text-lg font-medium text-ink">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-emerald-700 hover:text-ink font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. In Stock Toggle */}
      <div className="pb-6 border-b border-[#E5E0D8]">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink group-hover:text-emerald-700 transition-colors">
            In-Stock Only
          </span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateQuery("inStockOnly", e.target.checked ? "true" : null)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
          />
        </label>
      </div>

      {/* 2. Price Range Brackets */}
      <div className="space-y-3 pb-6 border-b border-[#E5E0D8]">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-ink">Price Range</h4>
        <div className="space-y-2">
          {PRICE_RANGES.map((bracket) => {
            const isSelected =
              currentMinPrice === String(bracket.min) && currentMaxPrice === String(bracket.max);
            return (
              <label
                key={bracket.label}
                className="flex items-center gap-2.5 text-xs text-ink-soft cursor-pointer hover:text-ink"
              >
                <input
                  type="radio"
                  name="priceRange"
                  checked={isSelected}
                  onChange={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("page", "1");
                    if (isSelected) {
                      params.delete("minPrice");
                      params.delete("maxPrice");
                    } else {
                      params.set("minPrice", String(bracket.min));
                      params.set("maxPrice", String(bracket.max));
                    }
                    router.push(`${pathname}?${params.toString()}`, { scroll: false });
                  }}
                  className="text-emerald-600 accent-emerald-600 cursor-pointer"
                />
                <span>{bracket.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Sizes Facet */}
      <div className="space-y-3 pb-6 border-b border-[#E5E0D8]">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-ink">Size</h4>
        <div className="grid grid-cols-4 gap-2">
          {SIZES.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleArrayFilter("sizes", size)}
                className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                  isSelected
                    ? "bg-ink text-white border-ink shadow-sm"
                    : "bg-surface-card text-ink border-[#E5E0D8] hover:border-ink"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Color Swatches */}
      <div className="space-y-3 pb-6 border-b border-[#E5E0D8]">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-ink">Color Palette</h4>
        <div className="space-y-2">
          {COLORS.map((color) => {
            const isSelected = selectedColors.includes(color.name);
            return (
              <label
                key={color.name}
                className="flex items-center justify-between text-xs text-ink-soft cursor-pointer hover:text-ink group"
                onClick={() => toggleArrayFilter("colors", color.name)}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-full border border-stone-300 shadow-sm shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className={isSelected ? "font-semibold text-ink" : ""}>{color.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Occasions */}
      <div className="space-y-3 pb-6 border-b border-[#E5E0D8]">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-ink">Occasion</h4>
        <div className="space-y-2">
          {OCCASIONS.map((occ) => {
            const isSelected = selectedOccasions.includes(occ);
            return (
              <label
                key={occ}
                className="flex items-center gap-2.5 text-xs text-ink-soft cursor-pointer hover:text-ink"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleArrayFilter("occasions", occ)}
                  className="w-3.5 h-3.5 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                />
                <span className={isSelected ? "font-semibold text-ink" : ""}>{occ}</span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default FilterSidebar;
