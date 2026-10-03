"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";

interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  link: string;
  ctaText: string;
  imageUrl: string;
  accent: string;
}

const HERO_SLIDES: BannerSlide[] = [
  {
    id: "slide-1",
    badge: "The Festive Edit '26",
    title: "Hand-Spun Chanderi & Royal Katan Silks",
    subtitle: "Imbued with authentic gold tested zari and centuries of Banarasi heritage weaving.",
    link: "/women/sarees",
    ctaText: "Explore Sarees",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1920&auto=format&fit=crop",
    accent: "text-emerald-400",
  },
  {
    id: "slide-2",
    badge: "Men's Haute Couture",
    title: "The Jodhpur Bandhgala Series",
    subtitle: "Structured silhouettes in pure mulberry raw silk and bespoke Italian wool blends.",
    link: "/men/ethnic-wear",
    ctaText: "Discover Bandhgalas",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1920&auto=format&fit=crop",
    accent: "text-gold",
  },
  {
    id: "slide-3",
    badge: "Spring Summer Solstice",
    title: "Normandy Linen & Contemporary Co-ords",
    subtitle: "Featherlight tailoring and relaxed ocean hues designed for resort living.",
    link: "/women/co-ord-sets",
    ctaText: "Shop The Collection",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920&auto=format&fit=crop",
    accent: "text-amber-300",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const slide = HERO_SLIDES[current];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[70vh] sm:h-[80vh] min-h-[550px] max-h-[850px] overflow-hidden bg-ink"
    >
      {/* Background Image with Cinematic Overlay */}
      {HERO_SLIDES.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <img
            src={s.imageUrl}
            alt={s.title}
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-10000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      ))}

      {/* Hero Content Overlay */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-6 sm:px-8 flex flex-col justify-center text-white">
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 text-xs uppercase tracking-[0.2em] font-semibold text-gold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>{slide.badge}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.15] text-white">
            {slide.title}
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-stone-300 font-light leading-relaxed max-w-xl">
            {slide.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={slide.link}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider px-8 py-3.5 rounded-full transition-all shadow-luxury hover:scale-105 flex items-center gap-2"
            >
              <span>{slide.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/collections/royal-festive"
              className="bg-white/15 backdrop-blur-md hover:bg-white/25 text-white border border-white/30 text-xs font-semibold uppercase tracking-wider px-7 py-3.5 rounded-full transition-colors"
            >
              View Lookbook
            </Link>
          </div>
        </div>
      </div>

      {/* Manual Arrow Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 transition-colors hidden sm:block"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 transition-colors hidden sm:block"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === current ? "w-8 bg-gold" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroCarousel;
