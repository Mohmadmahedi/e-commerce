"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, Check, Sparkles, ArrowRight, Clock } from "lucide-react";

export function DealCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 36,
    seconds: 42,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText("FESTIVE25");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#073E32] via-[#0B5D4B] to-[#04261F] text-white p-8 sm:p-14 shadow-2xl border border-emerald-700/50">
        {/* Subtle Luxury Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-900/60 backdrop-blur-md px-3.5 py-1 rounded-full border border-emerald-500/30 text-xs uppercase tracking-[0.2em] font-semibold text-gold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Limited Festive Solstice Offer</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-white leading-tight">
              Enjoy <span className="text-gold font-normal">25% Off</span> On Curated Royal Attire
            </h2>

            <p className="text-sm text-emerald-100/80 font-light max-w-lg leading-relaxed">
              Applicable across all Handcrafted Banarasi Silk Sarees, Jodhpur Bandhgalas, and
              Couture Lehengas. Orders above ₹4,999 include complimentary door concierge.
            </p>

            {/* Coupon Code Pill */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <div className="flex items-center bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5">
                <span className="text-xs uppercase tracking-wider text-emerald-200 mr-3">Code:</span>
                <span className="font-mono text-base font-bold text-gold tracking-widest mr-4">
                  FESTIVE25
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
                  title="Copy coupon code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <Link
                href="/collections/royal-festive"
                className="bg-gold hover:bg-[#b59870] text-ink text-xs font-semibold uppercase tracking-wider px-7 py-3 rounded-xl transition-all shadow-lg hover:scale-105 flex items-center gap-2"
              >
                <span>Shop The Sale</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Timer Box */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center lg:items-end">
            <div className="bg-black/40 backdrop-blur-md border border-white/15 p-6 rounded-2xl text-center w-full max-w-sm">
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-emerald-200 mb-4 font-medium">
                <Clock className="w-4 h-4 text-gold" />
                <span>Offer Expires In</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                  <div className="font-serif text-3xl font-bold text-white">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-emerald-200 mt-1">Hours</div>
                </div>

                <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                  <div className="font-serif text-3xl font-bold text-white">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-emerald-200 mt-1">Mins</div>
                </div>

                <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                  <div className="font-serif text-3xl font-bold text-gold">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-emerald-200 mt-1">Secs</div>
                </div>
              </div>

              <span className="text-[11px] text-stone-300 block mt-4 font-light">
                Prices adjust automatically at checkout
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DealCountdown;
