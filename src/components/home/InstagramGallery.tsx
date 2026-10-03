import Link from "next/link";
import { Instagram, ShoppingBag } from "lucide-react";

interface GalleryItem {
  id: string;
  imageUrl: string;
  handle: string;
  productSlug: string;
  productTitle: string;
}

const GALLERY_POSTS: GalleryItem[] = [
  {
    id: "post-1",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop",
    handle: "@ananya.iyer",
    productSlug: "royal-emerald-banarasi-katan-silk-saree",
    productTitle: "Emerald Banarasi Saree",
  },
  {
    id: "post-2",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop",
    handle: "@vikram.singhania",
    productSlug: "royal-jodhpur-bandhgala-jacket-raw-silk",
    productTitle: "Royal Jodhpur Bandhgala",
  },
  {
    id: "post-3",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
    handle: "@meera_kapoor",
    productSlug: "mehrunissa-velvet-bridal-lehenga-crimson",
    productTitle: "Mehrunissa Velvet Lehenga",
  },
  {
    id: "post-4",
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop",
    handle: "@karan_oberoi",
    productSlug: "bespoke-egyptian-giza-cotton-poplin-shirt",
    productTitle: "Giza Cotton Poplin Shirt",
  },
  {
    id: "post-5",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop",
    handle: "@tanya.sen",
    productSlug: "solstice-linen-wide-leg-co-ord-set",
    productTitle: "Solstice Linen Co-ord Set",
  },
  {
    id: "post-6",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
    handle: "@roshni.deshmukh",
    productSlug: "padmavati-gold-kundan-pearl-choker",
    productTitle: "Padmavati Kundan Choker",
  },
];

export function InstagramGallery() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E5E0D8]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-semibold text-emerald-600 mb-1">
            <Instagram className="w-3.5 h-3.5" />
            <span>#MyAvanyaStyle</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-ink font-light">
            Patronage in <span className="italic font-normal">Real Life</span>
          </h2>
        </div>

        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold uppercase tracking-wider text-ink hover:text-emerald-700 transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Follow @AvanyaAtelier</span>
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {GALLERY_POSTS.map((post) => (
          <Link
            key={post.id}
            href={`/product/${post.productSlug}`}
            className="group relative rounded-xl overflow-hidden aspect-square bg-surface-warm block shadow-subtle"
          >
            <img
              src={post.imageUrl}
              alt={post.productTitle}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-between text-white">
              <span className="text-[10px] text-stone-300 font-light truncate">{post.handle}</span>
              <div>
                <span className="text-[11px] font-serif block truncate font-medium">{post.productTitle}</span>
                <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-gold font-semibold mt-1">
                  <ShoppingBag className="w-2.5 h-2.5" />
                  <span>Shop Look</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default InstagramGallery;
