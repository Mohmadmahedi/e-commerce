import Link from "next/link";

interface CategoryPill {
  name: string;
  slug: string;
  gender: string;
  itemCount: string;
  imageUrl: string;
}

const FEATURED_CATEGORIES: CategoryPill[] = [
  {
    name: "Pure Silk Sarees",
    slug: "/women/sarees",
    gender: "Women",
    itemCount: "40+ Masterpieces",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Jodhpur Bandhgalas",
    slug: "/men/ethnic-wear",
    gender: "Men",
    itemCount: "Bespoke Cut",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Bridal Lehengas",
    slug: "/women/lehengas",
    gender: "Women",
    itemCount: "Zardozi & Velvet",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Linen Co-ord Sets",
    slug: "/women/co-ord-sets",
    gender: "Women",
    itemCount: "Resort Solstice",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Giza Cotton Shirts",
    slug: "/men/shirts",
    gender: "Men",
    itemCount: "140s 2-Ply",
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Kundan Jewellery",
    slug: "/women/jewellery",
    gender: "Women",
    itemCount: "22K Gold Plated",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Chikankari Kurtas",
    slug: "/women/kurtis",
    gender: "Women",
    itemCount: "32 Stitches",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Handmade Kolhapuris",
    slug: "/men/footwear",
    gender: "Men",
    itemCount: "Cushioned Sole",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop",
  },
];

export function CategoryGrid() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E5E0D8]">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">Mastered Silhouettes</p>
          <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal mt-1">Explore By Category</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6">
        {FEATURED_CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={cat.slug}
            className="group flex flex-col items-center text-center space-y-2.5"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden p-0.5 border border-[#E5E0D8] group-hover:border-emerald-600 transition-colors shadow-subtle bg-surface-card">
              <div className="w-full h-full rounded-full overflow-hidden bg-surface-warm">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-ink group-hover:text-emerald-700 transition-colors leading-tight line-clamp-1">
                {cat.name}
              </h4>
              <span className="text-[10px] text-ink-faint uppercase tracking-wider block mt-0.5">
                {cat.gender}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoryGrid;
