"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Sparkles, Clock, ShieldCheck } from "lucide-react";

export function WhatsAppConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isPDP = pathname.startsWith("/product/");

  const whatsappNumber = "919876543210";
  const defaultMessage = encodeURIComponent(
    "Namaste AVANYA Atelier. I would like personalized styling consultation and assistance with bespoke couture."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  return (
    <aside
      aria-label="AVANYA Luxury WhatsApp Concierge"
      className={`fixed ${isPDP ? "bottom-36" : "bottom-20"} sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end transition-all duration-300`}
    >
      {/* Concierge Popover Card */}
      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="concierge-dialog-title"
          className="mb-3 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-2xl bg-white/95 backdrop-blur-xl border border-stone-200 shadow-2xl p-4 sm:p-5 text-stone-900 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="flex items-start justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900 text-gold-300 shadow-sm">
                <Sparkles className="h-4 w-4" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div>
                <h4 id="concierge-dialog-title" className="text-sm font-serif font-semibold tracking-wide text-stone-950">
                  AVANYA Private Client
                </h4>
                <p className="text-[11px] text-stone-700 flex items-center gap-1 font-medium">
                  <Clock className="h-3 w-3" /> Dedicated Stylist Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-700 hover:text-stone-900 p-1 rounded-md transition-colors"
              aria-label="Close concierge"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="py-3 text-xs leading-relaxed text-stone-600 space-y-2">
            <p>
              Welcome to our bespoke styling room. Connect directly with our master drapers and couture consultants for:
            </p>
            <ul className="space-y-1 font-medium text-stone-800">
              <li className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-emerald-600" />
                Custom sizing & bridal tailoring
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-emerald-600" />
                Fabric & drape video consultations
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-emerald-600" />
                VIP priority dispatch & order tracking
              </li>
            </ul>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs py-3 px-4 shadow-lg hover:shadow-emerald-900/20 transition-all duration-200"
          >
            <MessageCircle className="h-4 w-4 text-emerald-300" />
            Start WhatsApp Consultation
          </a>

          <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[10px] text-stone-600">
            <ShieldCheck className="h-3 w-3 text-emerald-700" />
            <span>End-to-end encrypted atelier support</span>
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Open AVANYA Luxury WhatsApp Concierge"
        className="group relative flex items-center gap-2.5 rounded-full bg-stone-900 hover:bg-stone-950 text-white px-4 py-3 shadow-xl hover:shadow-2xl border border-stone-800 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
        <MessageCircle className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
        <span className="text-xs font-serif tracking-wider uppercase font-medium pr-1">
          Concierge
        </span>
      </button>
    </aside>
  );
}
