interface ProductStructuredDataProps {
  product: {
    title: string;
    description: string;
    slug: string;
    basePrice: number;
    rating: number;
    reviewCount: number;
    images: Array<{ url: string }>;
    variants: Array<{ sku: string; stock: number; price: number }>;
  };
}

export function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((img) => img.url),
    brand: {
      "@type": "Brand",
      name: "AVANYA",
    },
    sku: product.variants[0]?.sku || product.slug,
    offers: {
      "@type": "Offer",
      url: `https://avanya.in/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.basePrice,
      availability:
        product.variants.some((v) => v.stock > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "AVANYA Atelier",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating || 4.9,
      reviewCount: Math.max(1, product.reviewCount || 1),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default ProductStructuredData;
