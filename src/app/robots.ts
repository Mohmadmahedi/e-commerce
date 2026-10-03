import { MetadataRoute } from "next";

/**
 * Next.js dynamic robots.txt generator
 * Blocks crawlers from private, admin, and user session directories
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://avanya.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/product/", "/women/", "/men/", "/search"],
        disallow: [
          "/admin/",
          "/api/",
          "/account/",
          "/checkout/",
          "/order-confirmation/",
          "/auth/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
