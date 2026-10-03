import React from "react";

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AVANYA",
    legalName: "AVANYA Luxury Haute Couture Private Limited",
    url: "https://avanya.in",
    logo: "https://avanya.in/images/logo.png",
    description: "Contemporary Indian Luxury Fashion & Haute Couture for Men and Women.",
    foundingDate: "2024",
    founders: [
      {
        "@type": "Person",
        name: "Devendra Rathore",
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Prestige Golfshire, Villa 14",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      postalCode: "562110",
      addressCountry: "IN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-9876543210",
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    ],
    sameAs: [
      "https://www.instagram.com/avanya.luxury",
      "https://www.facebook.com/avanya.luxury",
      "https://twitter.com/avanya_luxury",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AVANYA Luxury",
    url: "https://avanya.in",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://avanya.in/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
