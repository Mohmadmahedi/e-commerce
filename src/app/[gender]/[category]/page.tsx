import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { productService } from "@/server/services/product.service";
import { ProductListingView } from "@/components/listing/ProductListingView";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: {
    gender: string;
    category: string;
  };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categorySlug = `${params.gender}-${params.category}`;
  const category = await prisma.category.findFirst({
    where: {
      OR: [{ slug: categorySlug }, { slug: params.category }],
    },
  });

  if (!category) return { title: "Haute Couture Collection" };

  return {
    title: `${category.name} | AVANYA Luxury`,
    description:
      category.description ||
      `Explore luxury ${category.name} handcrafted for modern connoisseurs.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  // Normalize slug: check both "women-sarees" and "sarees"
  const fullSlug = `${params.gender}-${params.category}`;
  const category = await prisma.category.findFirst({
    where: {
      OR: [{ slug: fullSlug }, { slug: params.category }],
    },
  });

  if (!category) {
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
    category: category.slug,
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
      title={category.name}
      description={category.description}
      products={result.items}
      pagination={result.pagination}
    />
  );
}
