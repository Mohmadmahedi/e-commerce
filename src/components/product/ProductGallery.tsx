"use client";

import { useState } from "react";
import { Sparkles, ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  images: Array<{ id: string; url: string; alt?: string | null }>;
  title: string;
  discountPercent?: number;
  isBestSeller?: boolean;
}

export function ProductGallery({
  images,
  title,
  discountPercent = 0,
  isBestSeller = false,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const activeImage = images[selectedIndex]?.url || images[0]?.url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnails Column */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[600px] shrink-0 scrollbar-none py-1">
        {images.map((img, idx) => (
          <button
            key={img.id || idx}
            onClick={() => setSelectedIndex(idx)}
            className={`w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 bg-surface-warm relative ${
              selectedIndex === idx
                ? "border-emerald-600 ring-2 ring-emerald-600/30 scale-105"
                : "border-[#E5E0D8] opacity-75 hover:opacity-100"
            }`}
          >
            <img src={img.url} alt={img.alt || title} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image Stage with Hover Magnifier */}
      <div
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        className="relative flex-1 aspect-[3/4] max-h-[750px] rounded-2xl overflow-hidden bg-surface-warm border border-[#E5E0D8] cursor-crosshair group shadow-subtle"
      >
        <img
          src={activeImage}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isZoomed ? "scale-150 origin-center" : "scale-100"
          }`}
          style={
            isZoomed
              ? {
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                }
              : undefined
          }
        />

        {/* Badges Stack */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
          {discountPercent > 0 && (
            <span className="bg-emerald-600 text-white text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-md shadow-md">
              {discountPercent}% OFF
            </span>
          )}
          {isBestSeller && (
            <span className="bg-ink text-surface text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-md shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-gold" />
              <span>Best Seller</span>
            </span>
          )}
        </div>

        {/* Zoom Hint Icon */}
        <div className="absolute bottom-4 right-4 bg-surface/80 backdrop-blur-md p-2 rounded-full text-ink-muted group-hover:opacity-0 transition-opacity pointer-events-none">
          <ZoomIn className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

export default ProductGallery;
