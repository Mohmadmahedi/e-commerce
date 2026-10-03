import { productService } from "@/server/services/product.service";
import { ProductListingView } from "@/components/listing/ProductListingView";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  return {
    title: query ? `Search: "${query}" | AVANYA Luxury` : "Search Catalog | AVANYA",
    description: "Search our curated collection of luxury Indian sarees, bandhgalas, kurtas, and haute couture.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = typeof searchParams.page === "string" ? Math.max(1, parseInt(searchParams.page, 10)) : 1;
  const limit = 12;
  const sortBy = (typeof searchParams.sortBy === "string" ? searchParams.sortBy : "relevance") as any;
  const minPrice = typeof searchParams.minPrice === "string" ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === "string" ? parseFloat(searchParams.maxPrice) : undefined;
  const sizes = typeof searchParams.sizes === "string" ? searchParams.sizes.split(",").map((s) => s.trim()) : undefined;
  const colors = typeof searchParams.colors === "string" ? searchParams.colors.split(",").map((c) => c.trim()) : undefined;
  const occasions = typeof searchParams.occasions === "string" ? searchParams.occasions.split(",").map((o) => o.trim()) : undefined;
  const inStockOnly = searchParams.inStockOnly === "true";

  const result = await productService.getProducts({
    page,
    limit,
    sortBy,
    search: q || undefined,
    minPrice,
    maxPrice,
    sizes,
    colors,
    occasions,
    inStockOnly,
  });

  return (
    <ProductListingView
      title={q ? `Search: "${q}"` : "The Complete Atelier Catalog"}
      description={
        q
          ? `Discovered ${result.pagination.total} handcrafted piece(s) matching your inquiry.`
          : "Explore the complete panoply of AVANYA Indian luxury and contemporary couture."
      }
      products={result.items}
      pagination={result.pagination}
    />
  );
}
