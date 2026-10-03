"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, Shield, Check } from "lucide-react";
import { getConsent, setConsent } from "@/lib/analytics";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been chosen
    const current = getConsent();
    if (!current) {
      // Show banner after brief delay
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    setConsent("accepted");
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    setConsent("essential");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-surface-card/95 backdrop-blur-md p-5 rounded-2xl border border-[#E5E0D8] shadow-2xl space-y-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="font-serif text-sm font-semibold text-ink flex items-center gap-1.5">
              <span>Your Privacy & Atelier Cookies</span>
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <p className="text-ink-muted leading-relaxed text-[11px]">
              In accordance with India&apos;s Digital Personal Data Protection (DPDP) Act, we use essential cookies for your shopping bag, and optional analytical cookies to personalize your haute couture curation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-[#E5E0D8]/60">
          <button
            onClick={handleEssentialOnly}
            className="flex-1 py-2 px-3 rounded-xl border border-[#E5E0D8] text-ink-muted hover:text-ink text-[11px] font-medium transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="flex-1 py-2 px-3 rounded-xl bg-ink text-surface text-[11px] font-semibold tracking-wider uppercase hover:bg-black transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" /> Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
