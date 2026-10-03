import Link from "next/link";
import { ArrowRight, Award, Feather, ShieldCheck } from "lucide-react";

export function BrandStory() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E5E0D8]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Editorial Visual */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-surface-warm shadow-luxury border border-[#E5E0D8]">
            <img
              src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=1000&auto=format&fit=crop"
              alt="Atelier Craftsman Loom"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Floating Heritage Badge */}
          <div className="absolute -bottom-6 -right-6 bg-surface-card p-5 rounded-2xl border border-[#E5E0D8] shadow-luxury max-w-xs hidden sm:block">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <h5 className="font-serif text-sm font-semibold text-ink">GI-Certified Weaves</h5>
                <p className="text-[11px] text-ink-muted">100% Genuine Silk Mark Certified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Story Copy */}
        <div className="lg:col-span-7 space-y-6 lg:pl-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-emerald-600">
            <Feather className="w-4 h-4" />
            <span>The Avanya Atelier Ethos</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-light text-ink leading-tight tracking-tight">
            Where Heritage Looms Meet <span className="italic font-normal">Modern Precision</span>
          </h2>

          <p className="text-sm sm:text-base text-ink-muted leading-relaxed font-light">
            Founded with a singular devotion to Indian textile sovereignty, AVANYA collaborates directly
            with third-generation master karigars across Varanasi, Lucknow, and Rajasthan. We eliminate the
            distortions of fast-fashion middlemen, allowing discerning patrons to experience couture-grade
            craftsmanship at authentic luxury value.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#E5E0D8]">
            <div>
              <div className="font-serif text-2xl font-bold text-ink">100%</div>
              <div className="text-xs uppercase tracking-wider text-ink-muted mt-1">Pure Mulberry Silk</div>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold text-ink">32+</div>
              <div className="text-xs uppercase tracking-wider text-ink-muted mt-1">Heritage Stitches</div>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold text-emerald-600">Fair Trade</div>
              <div className="text-xs uppercase tracking-wider text-ink-muted mt-1">Artisan Direct</div>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-ink hover:text-emerald-700 transition-colors group"
            >
              <span>Read The Atelier Manifesto</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BrandStory;
