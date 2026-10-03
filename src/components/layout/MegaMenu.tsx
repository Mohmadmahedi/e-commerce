"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface MegaMenuProps {
  activeTab: "women" | "men" | "festive" | null;
  onClose: () => void;
}

export function MegaMenu({ activeTab, onClose }: MegaMenuProps) {
  if (!activeTab) return null;

  return (
    <div
      onMouseLeave={onClose}
      className="absolute top-full left-0 w-full bg-surface-card border-b border-[#E5E0D8] shadow-luxury z-40 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
    >
      <div className="max-w-7xl mx-auto px-8 py-10">
        {activeTab === "women" && (
          <div className="grid grid-cols-5 gap-8">
            <div>
              <h4 className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
                Ethnic & Heritage
              </h4>
              <ul className="space-y-2.5 text-sm text-ink-soft">
                <li>
                  <Link href="/women/sarees" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Pure Silk Sarees (Banarasi / Katan)
                  </Link>
                </li>
                <li>
                  <Link href="/women/lehengas" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Bridal & Festive Lehengas
                  </Link>
                </li>
                <li>
                  <Link href="/women/kurtis" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Chikankari Kurtis & Kurta Sets
                  </Link>
                </li>
                <li>
                  <Link href="/women/anarkalis" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Tissue & Organza Anarkalis
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
                Contemporary & Resort
              </h4>
              <ul className="space-y-2.5 text-sm text-ink-soft">
                <li>
                  <Link href="/women/dresses" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Silk Slip Dresses & Evening Gowns
                  </Link>
                </li>
                <li>
                  <Link href="/women/co-ord-sets" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Normandy Linen Co-ord Sets
                  </Link>
                </li>
                <li>
                  <Link href="/women/tops" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Satin Tops & Blouses
                  </Link>
                </li>
                <li>
                  <Link href="/women?newArrival=true" onClick={onClose} className="hover:text-emerald-500 font-medium text-emerald-700 transition-colors">
                    New Arrivals This Week
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
                Accessories & Jewellery
              </h4>
              <ul className="space-y-2.5 text-sm text-ink-soft">
                <li>
                  <Link href="/women/jewellery" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    22K Gold Kundan & Polki Jewellery
                  </Link>
                </li>
                <li>
                  <Link href="/women/bags" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Embroidered Potlis & Clutches
                  </Link>
                </li>
                <li>
                  <Link href="/women/footwear" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Artisanal Juttis & Heeled Mules
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-4 border-l border-[#E5E0D8] pl-8">
              <Link
                href="/collections/royal-festive"
                onClick={onClose}
                className="group relative rounded-xl overflow-hidden aspect-[4/5] bg-surface-warm block"
              >
                <img
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop"
                  alt="Royal Festive Edit"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent p-4 flex flex-col justify-end text-white">
                  <span className="text-[10px] uppercase tracking-widest text-gold">Curated</span>
                  <h5 className="font-serif text-base font-medium">The Festive Edit '26</h5>
                  <span className="text-xs inline-flex items-center gap-1 mt-1 text-stone-200">
                    Discover <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>

              <Link
                href="/women/sarees"
                onClick={onClose}
                className="group relative rounded-xl overflow-hidden aspect-[4/5] bg-surface-warm block"
              >
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop"
                  alt="Katan Silk Sarees"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent p-4 flex flex-col justify-end text-white">
                  <span className="text-[10px] uppercase tracking-widest text-gold">Handloom</span>
                  <h5 className="font-serif text-base font-medium">Pure Katan Silks</h5>
                  <span className="text-xs inline-flex items-center gap-1 mt-1 text-stone-200">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "men" && (
          <div className="grid grid-cols-5 gap-8">
            <div>
              <h4 className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
                Royal Ceremonial
              </h4>
              <ul className="space-y-2.5 text-sm text-ink-soft">
                <li>
                  <Link href="/men/kurtas" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Pure Silk Kurtas & Sherwanis
                  </Link>
                </li>
                <li>
                  <Link href="/men/ethnic-wear" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Jodhpur Bandhgalas & Achkans
                  </Link>
                </li>
                <li>
                  <Link href="/men/nehru-jackets" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Handloom Matka Silk Nehru Vests
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
                Tailored Modern
              </h4>
              <ul className="space-y-2.5 text-sm text-ink-soft">
                <li>
                  <Link href="/men/shirts" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Egyptian Giza Cotton Shirts
                  </Link>
                </li>
                <li>
                  <Link href="/men/trousers" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Italian Wool Gurkha Trousers
                  </Link>
                </li>
                <li>
                  <Link href="/men/jackets" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Flax Linen Deconstructed Blazers
                  </Link>
                </li>
                <li>
                  <Link href="/men/jeans" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Japanese Selvedge Denim
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
                Footwear & Accoutrements
              </h4>
              <ul className="space-y-2.5 text-sm text-ink-soft">
                <li>
                  <Link href="/men/footwear" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Ergonomic Kolhapuris & Juttis
                  </Link>
                </li>
                <li>
                  <Link href="/men/accessories" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Devanagari Chronograph Watches
                  </Link>
                </li>
                <li>
                  <Link href="/men/accessories" onClick={onClose} className="hover:text-emerald-500 transition-colors">
                    Silk Pocket Squares & Enamel Cufflinks
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-4 border-l border-[#E5E0D8] pl-8">
              <Link
                href="/men/kurtas"
                onClick={onClose}
                className="group relative rounded-xl overflow-hidden aspect-[4/5] bg-surface-warm block"
              >
                <img
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop"
                  alt="Men's Bandhgalas"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent p-4 flex flex-col justify-end text-white">
                  <span className="text-[10px] uppercase tracking-widest text-gold">Bespoke</span>
                  <h5 className="font-serif text-base font-medium">The Bandhgala Series</h5>
                  <span className="text-xs inline-flex items-center gap-1 mt-1 text-stone-200">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>

              <Link
                href="/men/shirts"
                onClick={onClose}
                className="group relative rounded-xl overflow-hidden aspect-[4/5] bg-surface-warm block"
              >
                <img
                  src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop"
                  alt="Giza Cotton Shirts"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent p-4 flex flex-col justify-end text-white">
                  <span className="text-[10px] uppercase tracking-widest text-gold">Executive</span>
                  <h5 className="font-serif text-base font-medium">140s Giza Cotton</h5>
                  <span className="text-xs inline-flex items-center gap-1 mt-1 text-stone-200">
                    Shop Now <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "festive" && (
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h4 className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
                Wedding Celebrations
              </h4>
              <ul className="space-y-2.5 text-sm text-ink-soft">
                <li><Link href="/women/lehengas" onClick={onClose} className="hover:text-emerald-500">Bridal & Sangeet Ensembles</Link></li>
                <li><Link href="/men/kurtas" onClick={onClose} className="hover:text-emerald-500">Groom & Groomsmen Kurtas</Link></li>
                <li><Link href="/women/jewellery" onClick={onClose} className="hover:text-emerald-500">Heirloom Kundan Sets</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
                Festivals & Poojas
              </h4>
              <ul className="space-y-2.5 text-sm text-ink-soft">
                <li><Link href="/women/sarees" onClick={onClose} className="hover:text-emerald-500">Auspicious Chanderi & Katan Silks</Link></li>
                <li><Link href="/men/ethnic-wear" onClick={onClose} className="hover:text-emerald-500">Hand-done Aari Embroidered Kurtas</Link></li>
                <li><Link href="/kids" onClick={onClose} className="hover:text-emerald-500">Young Royalty: Boys & Girls Sets</Link></li>
              </ul>
            </div>
            <div className="col-span-2 rounded-xl bg-surface-warm p-6 border border-[#E5E0D8] flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">Festive Special</span>
                <h4 className="font-serif text-2xl font-light text-ink mt-1">Avanya Concierge Styling</h4>
                <p className="text-xs text-ink-muted mt-2 max-w-sm">
                  Complimentary bespoke video consultations with our senior wedding couture stylists.
                </p>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="mt-4 inline-block bg-ink text-surface text-xs uppercase tracking-wider font-semibold px-5 py-2.5 rounded-full hover:bg-emerald-600 transition-colors"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MegaMenu;
