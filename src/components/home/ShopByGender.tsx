import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ShopByGender() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 font-semibold mb-2">
          Curated Worlds
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl text-ink font-light">
          Shop By <span className="italic font-normal">Department</span>
        </h2>
        <p className="text-sm text-ink-muted mt-3">
          Distinct ateliers honoring India's most celebrated textile traditions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Women's Haute Couture */}
        <Link
          href="/women"
          className="group relative rounded-2xl overflow-hidden aspect-[3/4] sm:aspect-[4/5] bg-surface-warm shadow-subtle hover:shadow-luxury-hover transition-luxury block"
        >
          <img
            src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop"
            alt="Women's Haute Couture"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold mb-1">
              Atelier Femme
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-tight">
              Women's Haute Couture
            </h3>
            <p className="text-xs text-stone-300 mt-2 line-clamp-2 font-light">
              Banarasi katan silks, heritage organza sarees, and zardozi bridal lehengas.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white mt-4 group-hover:text-gold transition-colors">
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>

        {/* Men's Atelier */}
        <Link
          href="/men"
          className="group relative rounded-2xl overflow-hidden aspect-[3/4] sm:aspect-[4/5] bg-surface-warm shadow-subtle hover:shadow-luxury-hover transition-luxury block"
        >
          <img
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop"
            alt="Men's Atelier"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold mb-1">
              Atelier Homme
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-tight">
              Men's Bespoke Atelier
            </h3>
            <p className="text-xs text-stone-300 mt-2 line-clamp-2 font-light">
              Raw silk Jodhpur bandhgalas, 140s Egyptian Giza shirts, and handloom kurtas.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white mt-4 group-hover:text-gold transition-colors">
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>

        {/* Festive & Young Royalty */}
        <Link
          href="/collections/royal-festive"
          className="group relative rounded-2xl overflow-hidden aspect-[3/4] sm:aspect-[4/5] bg-surface-warm shadow-subtle hover:shadow-luxury-hover transition-luxury block"
        >
          <img
            src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop"
            alt="Festive Celebrations & Kids"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold mb-1">
              Celebration Edits
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-tight">
              Festive, Wedding & Kids
            </h3>
            <p className="text-xs text-stone-300 mt-2 line-clamp-2 font-light">
              Celebratory ensembles, miniature brocade sherwanis, and twirl-worthy lehengas.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white mt-4 group-hover:text-gold transition-colors">
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}

export default ShopByGender;
