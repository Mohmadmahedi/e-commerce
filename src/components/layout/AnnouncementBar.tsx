"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

const ANNOUNCEMENTS = [
  {
    icon: Sparkles,
    text: "Complimentary Express Shipping on all orders above ₹999 across India",
    linkText: "Shop New Arrivals",
    href: "/women/sarees",
  },
  {
    icon: ShieldCheck,
    text: "The Royal Festive Edit is Live • Use code FESTIVE25 for 25% off",
    linkText: "Explore Collection",
    href: "/collections/royal-festive",
  },
  {
    icon: Sparkles,
    text: "Silk Mark & Handloom Mark Certified • 100% Authentic Indian Craftsmanship",
    linkText: "Our Heritage",
    href: "/about",
  },
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = ANNOUNCEMENTS[currentIndex];
  const Icon = current.icon;

  return (
    <div className="bg-ink text-surface py-2 px-4 border-b border-stone-800 text-[11px] sm:text-xs tracking-wider uppercase font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center transition-all duration-500 ease-in-out">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-gold shrink-0 animate-pulse" />
          <span className="truncate">{current.text}</span>
          <Link
            href={current.href}
            className="hidden md:inline-flex items-center gap-1 text-gold hover:text-white transition-colors underline underline-offset-4 ml-2 lowercase font-normal text-xs"
          >
            <span>{current.linkText}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementBar;
