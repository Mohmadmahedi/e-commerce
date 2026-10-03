import { Star, ShieldCheck } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  city: string;
  rating: number;
  productTitle: string;
  comment: string;
  date: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "rev-1",
    name: "Ananya Iyer",
    city: "Mumbai, Maharashtra",
    rating: 5,
    productTitle: "Royal Emerald Banarasi Katan Silk Saree",
    comment:
      "The zari work is breathtaking. I wore this to my sister’s sangeet and received compliments throughout the evening. The drape is heavy yet effortlessly fluid, and the signature fragrance-infused keepsake box made unboxing feel like receiving royal couture.",
    date: "Verified Buyer • 2 weeks ago",
  },
  {
    id: "rev-2",
    name: "Vikramaditya Singhania",
    city: "New Delhi",
    rating: 5,
    productTitle: "Royal Jodhpur Bandhgala in Raw Mulberry Silk",
    comment:
      "Sartorial perfection. The pick-stitch collar contours cleanly around the neck with zero bunching. The cupro lining breathes naturally even in warm banquet halls. Avanya has matched Savile Row tailoring with Rajasthani heritage.",
    date: "Verified Buyer • 1 month ago",
  },
  {
    id: "rev-3",
    name: "Dr. Priyamvada Nair",
    city: "Bengaluru, Karnataka",
    rating: 5,
    productTitle: "Chandrakala Ivory Silk Chikankari Kurta Set",
    comment:
      "Authentic Lucknowi GI craftsmanship! The mukaish metal work catches the light delicately without being gaudy. The soft cotton lining ensures zero transparency. Outstanding customer concierge on WhatsApp as well.",
    date: "Verified Buyer • 3 weeks ago",
  },
];

export function CustomerReviews() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E5E0D8]">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 font-semibold mb-2">
          Verified Patron Testimonials
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl text-ink font-light">
          Words of <span className="italic font-normal">Praise</span>
        </h2>
        <p className="text-sm text-ink-muted mt-3">
          Over 4.9/5 average rating across 1,800+ delivered couture consignments in India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="bg-surface-card rounded-2xl p-7 border border-[#E5E0D8] shadow-subtle flex flex-col justify-between"
          >
            <div>
              {/* Star Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-xs sm:text-sm text-ink leading-relaxed font-light italic">
                "{t.comment}"
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[#F0EBE1]">
              <div className="text-xs font-semibold text-emerald-700 line-clamp-1 mb-2">
                {t.productTitle}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-serif text-sm font-medium text-ink">{t.name}</h5>
                  <span className="text-[11px] text-ink-faint block">{t.city}</span>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CustomerReviews;
