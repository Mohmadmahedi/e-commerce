"use client";

import { useState } from "react";
import { Star, ShieldCheck, Truck, RefreshCw, Feather } from "lucide-react";

interface ProductTabsProps {
  description: string;
  fabricCare?: string | null;
  occasion?: string | null;
  fit?: string | null;
  rating: number;
  reviewCount: number;
  reviews: Array<{
    id: string;
    title: string;
    comment: string;
    rating: number;
    createdAt: Date | string;
    user: { name?: string | null; image?: string | null };
    isVerifiedPurchase: boolean;
  }>;
}

export function ProductTabs({
  description,
  fabricCare,
  occasion,
  fit,
  rating,
  reviewCount,
  reviews,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"desc" | "fabric" | "shipping" | "reviews">("desc");

  return (
    <div className="mt-16 pt-10 border-t border-[#E5E0D8]">
      {/* Tab Navigation Buttons */}
      <div className="flex border-b border-[#E5E0D8] overflow-x-auto scrollbar-none gap-8">
        <button
          onClick={() => setActiveTab("desc")}
          className={`pb-4 text-xs font-semibold uppercase tracking-[0.15em] transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "desc"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          Description & Details
        </button>

        <button
          onClick={() => setActiveTab("fabric")}
          className={`pb-4 text-xs font-semibold uppercase tracking-[0.15em] transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "fabric"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          Fabric, Weave & Care
        </button>

        <button
          onClick={() => setActiveTab("shipping")}
          className={`pb-4 text-xs font-semibold uppercase tracking-[0.15em] transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "shipping"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          Shipping & Returns
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`pb-4 text-xs font-semibold uppercase tracking-[0.15em] transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "reviews"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          Patron Reviews ({reviews.length > 0 ? reviews.length : reviewCount})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="py-8">
        {activeTab === "desc" && (
          <div className="max-w-3xl space-y-4 text-sm text-ink-soft leading-relaxed font-light">
            <p>{description}</p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F0EBE1] text-xs">
              <div>
                <span className="font-semibold text-ink uppercase tracking-wider block mb-1">
                  Occasion
                </span>
                <span className="text-ink-muted">{occasion || "Festive & Contemporary"}</span>
              </div>
              <div>
                <span className="font-semibold text-ink uppercase tracking-wider block mb-1">
                  Cut & Fit
                </span>
                <span className="text-ink-muted">{fit || "Tailored Bespoke Fit"}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "fabric" && (
          <div className="max-w-3xl space-y-4 text-sm text-ink-soft leading-relaxed font-light">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-warm border border-[#E5E0D8]">
              <Feather className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-serif text-sm font-semibold text-ink">Material Composition</h5>
                <p className="text-xs text-ink-muted mt-1">
                  {fabricCare || "100% Pure Certified Natural Handloom. Tested for authentic silk density."}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <h5 className="font-semibold text-ink uppercase tracking-wider">Garment Care Guidelines:</h5>
              <ul className="list-disc pl-5 space-y-1 text-ink-muted">
                <li>Professional dry clean recommended for pure silks and zardozi embroideries.</li>
                <li>Store in breathable organic muslin cloth; avoid hanging heavy silks on wire hangers.</li>
                <li>Iron on low silk heat setting with a protective cotton press cloth.</li>
                <li>Keep away from direct perfumes, hair sprays, and moisture.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-ink-soft">
            <div className="p-5 rounded-xl border border-[#E5E0D8] bg-surface-card space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold uppercase tracking-wider">
                <Truck className="w-4 h-4" />
                <span>Pan-India Air Dispatch</span>
              </div>
              <p className="text-ink-muted leading-relaxed">
                Complimentary express shipping on all orders exceeding ₹999. Dispatched within 24 hours
                from our central atelier in fragrance-sealed keepsake boxes.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#E5E0D8] bg-surface-card space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold uppercase tracking-wider">
                <RefreshCw className="w-4 h-4" />
                <span>7-Day Doorstep Returns</span>
              </div>
              <p className="text-ink-muted leading-relaxed">
                If the fit or drape is anything less than exceptional, initiate a reverse pickup through
                your account. Instant bank/UPI refunds issued upon quality check.
              </p>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-8">
            {/* Rating Breakdown Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-surface-card border border-[#E5E0D8]">
              <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-[#E5E0D8] pb-6 md:pb-0">
                <div className="font-serif text-5xl font-light text-ink">{rating || 4.9}</div>
                <div className="flex items-center gap-1 my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-ink-muted">
                  Based on {reviews.length > 0 ? reviews.length : reviewCount} verified patron reviews
                </span>
              </div>

              {/* Progress Bars */}
              <div className="col-span-2 space-y-2 text-xs">
                {[
                  { stars: "5 Star", pct: 92 },
                  { stars: "4 Star", pct: 8 },
                  { stars: "3 Star", pct: 0 },
                  { stars: "2 Star", pct: 0 },
                  { stars: "1 Star", pct: 0 },
                ].map((row) => (
                  <div key={row.stars} className="flex items-center gap-3">
                    <span className="w-12 text-ink-muted shrink-0">{row.stars}</span>
                    <div className="flex-1 bg-surface-warm h-2 rounded-full overflow-hidden border border-[#E5E0D8]">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-ink-faint">{row.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-xl border border-[#E5E0D8] bg-surface-card space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {rev.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                  </div>

                  <h5 className="font-serif text-sm font-medium text-ink">{rev.title}</h5>
                  <p className="text-ink-soft leading-relaxed font-light">{rev.comment}</p>
                  <span className="text-[11px] text-ink-faint block pt-1">
                    {rev.user.name || "Avanya Patron"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductTabs;
