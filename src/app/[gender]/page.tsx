import { notFound } from "next/navigation";
import { productService } from "@/server/services/product.service";
import { ProductListingView } from "@/components/listing/ProductListingView";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface GenderPageProps {
  params: { gender: string };
  searchParams: Record<string, string | string[] | undefined>;
}

const GENDER_TITLES: Record<string, { title: string; desc: string; enumVal: "MEN" | "WOMEN" | "KIDS" }> = {
  women: {
    title: "Women's Haute Couture",
    desc: "Exquisite Banarasi Katan silks, handcrafted organza sarees, zardozi lehengas, and contemporary linen ensembles.",
    enumVal: "WOMEN",
  },
  men: {
    title: "Men's Bespoke Atelier",
    desc: "Jodhpur raw silk bandhgalas, 140s Giza cotton shirts, pure silk kurtas, and tailored Italian wool trousers.",
    enumVal: "MEN",
  },
  kids: {
    title: "Young Royalty",
    desc: "Miniature royal brocade sherwanis, festive dhotis, and twirl-worthy handcrafted lehengas for young princes and princesses.",
    enumVal: "KIDS",
  },
};

export async function generateMetadata({ params }: GenderPageProps): Promise<Metadata> {
  const genderKey = params.gender.toLowerCase();
  const config = GENDER_TITLES[genderKey];
  if (!config) return { title: "Catalog" };

  return {
    title: `${config.title} | AVANYA Luxury`,
    description: config.desc,
  };
}

export default async function GenderPage({ params, searchParams }: GenderPageProps) {
  const genderKey = params.gender.toLowerCase();
  const config = GENDER_TITLES[genderKey];

  if (!config) {
    notFound();
  }

  // Parse filters safely from searchParams
  const page = typeof searchParams.page === "string" ? Math.max(1, parseInt(searchParams.page, 10)) : 1;
  const limit = 12;
  const sortBy = (typeof searchParams.sortBy === "string" ? searchParams.sortBy : "relevance") as any;
  const minPrice = typeof searchParams.minPrice === "string" ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === "string" ? parseFloat(searchParams.maxPrice) : undefined;
  const sizes = typeof searchParams.sizes === "string" ? searchParams.sizes.split(",").map((s) => s.trim()) : undefined;
  const colors = typeof searchParams.colors === "string" ? searchParams.colors.split(",").map((c) => c.trim()) : undefined;
  const occasions = typeof searchParams.occasions === "string" ? searchParams.occasions.split(",").map((o) => o.trim()) : undefined;
  const inStockOnly = searchParams.inStockOnly === "true";
  const isNewArrival = searchParams.isNewArrival === "true" ? true : undefined;
  const isBestSeller = searchParams.isBestSeller === "true" ? true : undefined;

  const result = await productService.getProducts({
    page,
    limit,
    sortBy,
    gender: config.enumVal,
    minPrice,
    maxPrice,
    sizes,
    colors,
    occasions,
    inStockOnly,
    isNewArrival,
    isBestSeller,
  });

  return (
    <ProductListingView
      title={config.title}
      description={config.desc}
      products={result.items}
      pagination={result.pagination}
    />
  );
}
