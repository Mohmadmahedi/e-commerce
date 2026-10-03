"use client";

import { useState } from "react";
import { X, Ruler } from "lucide-react";

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName?: string;
}

export function SizeChartModal({ isOpen, onClose, categoryName = "Apparel" }: SizeChartModalProps) {
  const [unit, setUnit] = useState<"in" | "cm">("in");

  if (!isOpen) return null;

  const measurements = [
    { size: "XS", chestIn: "34 - 36", waistIn: "28 - 30", hipIn: "36 - 38", chestCm: "86 - 91", waistCm: "71 - 76", hipCm: "91 - 96" },
    { size: "S", chestIn: "36 - 38", waistIn: "30 - 32", hipIn: "38 - 40", chestCm: "91 - 96", waistCm: "76 - 81", hipCm: "96 - 101" },
    { size: "M", chestIn: "38 - 40", waistIn: "32 - 34", hipIn: "40 - 42", chestCm: "96 - 101", waistCm: "81 - 86", hipCm: "101 - 106" },
    { size: "L", chestIn: "40 - 42", waistIn: "34 - 36", hipIn: "42 - 44", chestCm: "101 - 106", waistCm: "86 - 91", hipCm: "106 - 111" },
    { size: "XL", chestIn: "42 - 44", waistIn: "36 - 38", hipIn: "44 - 46", chestCm: "106 - 111", waistCm: "91 - 96", hipCm: "111 - 116" },
    { size: "XXL", chestIn: "44 - 46", waistIn: "38 - 40", hipIn: "46 - 48", chestCm: "111 - 116", waistCm: "96 - 101", hipCm: "116 - 121" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-surface-card rounded-2xl shadow-2xl border border-[#E5E0D8] p-6 sm:p-8 z-50 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D8]">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-5 h-5 text-emerald-600" />
            <h3 className="font-serif text-xl font-medium text-ink">
              Bespoke Fit Guide • {categoryName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-warm text-ink-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unit Selector */}
        <div className="flex items-center justify-between my-5">
          <p className="text-xs text-ink-muted">
            All garments are handcrafted with 2 inches of internal margin for custom tailoring.
          </p>
          <div className="inline-flex rounded-lg border border-[#E5E0D8] p-1 bg-surface-warm">
            <button
              onClick={() => setUnit("in")}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                unit === "in" ? "bg-ink text-surface shadow-sm" : "text-ink-muted hover:text-ink"
              }`}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit("cm")}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                unit === "cm" ? "bg-ink text-surface shadow-sm" : "text-ink-muted hover:text-ink"
              }`}
            >
              CM
            </button>
          </div>
        </div>

        {/* Measurement Table */}
        <div className="overflow-x-auto rounded-xl border border-[#E5E0D8]">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-warm border-b border-[#E5E0D8] text-ink uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Chest / Bust ({unit})</th>
                <th className="py-3 px-4">Waist ({unit})</th>
                <th className="py-3 px-4">Hip ({unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8] text-ink-soft">
              {measurements.map((row) => (
                <tr key={row.size} className="hover:bg-surface-warm/50">
                  <td className="py-3 px-4 font-semibold text-ink">{row.size}</td>
                  <td className="py-3 px-4">{unit === "in" ? row.chestIn : row.chestCm}</td>
                  <td className="py-3 px-4">{unit === "in" ? row.waistIn : row.waistCm}</td>
                  <td className="py-3 px-4">{unit === "in" ? row.hipIn : row.hipCm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Measuring Tip */}
        <div className="mt-5 p-4 rounded-xl bg-surface-warm border border-[#E5E0D8] text-xs text-ink-muted space-y-1">
          <p className="font-semibold text-ink">Measuring Advice:</p>
          <p>
            Measure over undergarments with a flexible tape held comfortably snug. If your
            measurements fall between two sizes, choose the larger size for Indian ethnic wear.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SizeChartModal;
