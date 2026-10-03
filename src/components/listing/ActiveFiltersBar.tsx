"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

export function ActiveFiltersBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const removeFilter = (key: string, valueToRemove?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (!valueToRemove) {
      params.delete(key);
    } else {
      const current = params.get(key) || "";
      const updated = current
        .split(",")
        .map((s) => s.trim())
        .filter((item) => item !== valueToRemove);

      if (updated.length > 0) {
        params.set(key, updated.join(","));
      } else {
        params.delete(key);
      }
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    router.push(pathname, { scroll: false });
  };

  const sizes = (searchParams.get("sizes") || "").split(",").filter(Boolean);
  const colors = (searchParams.get("colors") || "").split(",").filter(Boolean);
  const occasions = (searchParams.get("occasions") || "").split(",").filter(Boolean);
  const inStockOnly = searchParams.get("inStockOnly") === "true";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const hasAnyFilter =
    sizes.length > 0 ||
    colors.length > 0 ||
    occasions.length > 0 ||
    inStockOnly ||
    minPrice !== null;

  if (!hasAnyFilter) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 pt-2">
      <span className="text-[11px] uppercase tracking-wider text-ink-muted mr-1 font-medium">
        Active Filters:
      </span>

      {minPrice && maxPrice && (
        <span className="inline-flex items-center gap-1.5 bg-surface-card border border-[#E5E0D8] text-ink text-xs px-2.5 py-1 rounded-full shadow-subtle">
          <span>₹{Number(minPrice).toLocaleString("en-IN")} - ₹{Number(maxPrice).toLocaleString("en-IN")}</span>
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("minPrice");
              params.delete("maxPrice");
              params.set("page", "1");
              router.push(`${pathname}?${params.toString()}`, { scroll: false });
            }}
            className="hover:text-rose-500"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {inStockOnly && (
        <span className="inline-flex items-center gap-1.5 bg-surface-card border border-[#E5E0D8] text-ink text-xs px-2.5 py-1 rounded-full shadow-subtle">
          <span>In Stock Only</span>
          <button onClick={() => removeFilter("inStockOnly")} className="hover:text-rose-500">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {sizes.map((s) => (
        <span
          key={s}
          className="inline-flex items-center gap-1.5 bg-surface-card border border-[#E5E0D8] text-ink text-xs px-2.5 py-1 rounded-full shadow-subtle"
        >
          <span>Size: {s}</span>
          <button onClick={() => removeFilter("sizes", s)} className="hover:text-rose-500">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {colors.map((c) => (
        <span
          key={c}
          className="inline-flex items-center gap-1.5 bg-surface-card border border-[#E5E0D8] text-ink text-xs px-2.5 py-1 rounded-full shadow-subtle"
        >
          <span>{c}</span>
          <button onClick={() => removeFilter("colors", c)} className="hover:text-rose-500">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {occasions.map((o) => (
        <span
          key={o}
          className="inline-flex items-center gap-1.5 bg-surface-card border border-[#E5E0D8] text-ink text-xs px-2.5 py-1 rounded-full shadow-subtle"
        >
          <span>{o}</span>
          <button onClick={() => removeFilter("occasions", o)} className="hover:text-rose-500">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        onClick={clearAll}
        className="text-xs text-rose-600 hover:text-rose-700 underline font-medium ml-2"
      >
        Clear All
      </button>
    </div>
  );
}

export default ActiveFiltersBar;
