"use client";

import Link from "next/link";
import { Sparkles, ShieldCheck, RefreshCw, Truck, ArrowRight, PhoneCall } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#111111] text-[#FAF8F5] pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* 1. Value Proposition Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-16 border-b border-stone-800 text-stone-300">
          <div className="flex items-start gap-4">
            <Truck className="w-6 h-6 text-gold shrink-0 mt-1" />
            <div>
              <h4 className="font-serif text-base text-white">Express Pan-India Delivery</h4>
              <p className="text-xs text-stone-400 mt-1">
                Complimentary express air shipping across 28,000+ PIN codes on orders above ₹999.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <RefreshCw className="w-6 h-6 text-gold shrink-0 mt-1" />
            <div>
              <h4 className="font-serif text-base text-white">7-Day Doorstep Returns</h4>
              <p className="text-xs text-stone-400 mt-1">
                Zero questions asked returns with complimentary reverse pickup from your residence.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-gold shrink-0 mt-1" />
            <div>
              <h4 className="font-serif text-base text-white">100% Handloom Certified</h4>
              <p className="text-xs text-stone-400 mt-1">
                Authentic GI-tagged silk weaves and master artisan craft direct from loom to wardrobe.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-gold shrink-0 mt-1" />
            <div>
              <h4 className="font-serif text-base text-white">Bespoke Concierge</h4>
              <p className="text-xs text-stone-400 mt-1">
                Direct WhatsApp styling assistance, custom measurements, and festive wedding edits.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Main Footer Navigation Columns & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 py-16 border-b border-stone-800 text-xs text-stone-400">
          {/* Brand Bio */}
          <div className="lg:col-span-2">
            <span className="font-serif text-3xl font-light tracking-[0.2em] text-white block">
              AVANYA
            </span>
            <p className="mt-4 text-xs leading-relaxed max-w-sm text-stone-400">
              AVANYA Atelier reimagines Indian royal heritage silhouettes for the contemporary global
              wardrobe. Woven with pure silk zari, European linen, and timeless couture craftsmanship.
            </p>

            {/* Newsletter Subscription */}
            <div className="mt-6">
              <span className="text-[11px] uppercase tracking-wider text-gold font-semibold block">
                Receive 10% Off Your Inaugural Order
              </span>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Subscribe for private invitations to seasonal drops & festive previews.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="mt-3 flex max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="bg-stone-900 border border-stone-700 text-white px-4 py-2.5 text-xs rounded-l-lg focus:outline-none focus:border-gold w-full"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-r-lg transition-colors shrink-0"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Women Collections */}
          <div>
            <h5 className="font-semibold text-white tracking-widest uppercase mb-4">Women</h5>
            <ul className="space-y-2.5">
              <li><Link href="/women/sarees" className="hover:text-white transition-colors">Banarasi & Katan Silk Sarees</Link></li>
              <li><Link href="/women/lehengas" className="hover:text-white transition-colors">Bridal & Festive Lehengas</Link></li>
              <li><Link href="/women/kurtis" className="hover:text-white transition-colors">Chikankari Kurta Sets</Link></li>
              <li><Link href="/women/dresses" className="hover:text-white transition-colors">Mulberry Silk Slip Dresses</Link></li>
              <li><Link href="/women/co-ord-sets" className="hover:text-white transition-colors">Normandy Linen Co-ords</Link></li>
              <li><Link href="/women/jewellery" className="hover:text-white transition-colors">Kundan & Polki Jewellery</Link></li>
            </ul>
          </div>

          {/* Men Collections */}
          <div>
            <h5 className="font-semibold text-white tracking-widest uppercase mb-4">Men</h5>
            <ul className="space-y-2.5">
              <li><Link href="/men/kurtas" className="hover:text-white transition-colors">Silk Kurtas & Sherwanis</Link></li>
              <li><Link href="/men/ethnic-wear" className="hover:text-white transition-colors">Jodhpur Bandhgalas & Achkans</Link></li>
              <li><Link href="/men/shirts" className="hover:text-white transition-colors">Giza Cotton Bespoke Shirts</Link></li>
              <li><Link href="/men/trousers" className="hover:text-white transition-colors">Italian Wool Gurkha Trousers</Link></li>
              <li><Link href="/men/footwear" className="hover:text-white transition-colors">Handmade Leather Kolhapuris</Link></li>
              <li><Link href="/men/accessories" className="hover:text-white transition-colors">Devanagari Chronographs</Link></li>
            </ul>
          </div>

          {/* Customer Care & Concierge */}
          <div>
            <h5 className="font-semibold text-white tracking-widest uppercase mb-4">Client Care</h5>
            <ul className="space-y-2.5">
              <li><Link href="/track-order" className="hover:text-white transition-colors">Track Your Consignment</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Exchange Portal</Link></li>
              <li><Link href="/size-guide" className="hover:text-white transition-colors">Bespoke Size & Fit Guide</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">DPDP Privacy & Rights</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Haute Couture</Link></li>
            </ul>

            <div className="mt-6">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-950 text-emerald-300 border border-emerald-800 px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-emerald-900 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>WhatsApp Stylist</span>
              </a>
            </div>
          </div>
        </div>

        {/* 3. Payment Badges & Regulatory Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-stone-500">
          <div>
            <p>© 2026 AVANYA Atelier Pvt. Ltd. All Rights Reserved. Prices are inclusive of all Indian GST taxes.</p>
            <p className="mt-1 text-stone-600">
              Concept project crafted by Antigravity Design Lab. Built for high-conversion luxury retail.
            </p>
          </div>

          {/* Payment Badges (UPI, RuPay, Visa, Mastercard, NetBanking, COD) */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-wider text-stone-400">
            <span className="bg-stone-900 border border-stone-800 px-2.5 py-1 rounded">UPI</span>
            <span className="bg-stone-900 border border-stone-800 px-2.5 py-1 rounded">RUPAY</span>
            <span className="bg-stone-900 border border-stone-800 px-2.5 py-1 rounded">VISA</span>
            <span className="bg-stone-900 border border-stone-800 px-2.5 py-1 rounded">MASTERCARD</span>
            <span className="bg-stone-900 border border-stone-800 px-2.5 py-1 rounded">NETBANKING</span>
            <span className="bg-stone-900 border border-stone-800 px-2.5 py-1 rounded">CASH ON DELIVERY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
