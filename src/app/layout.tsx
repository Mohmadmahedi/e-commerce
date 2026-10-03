import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/JsonLd";
import { CookieConsent } from "@/components/analytics/CookieConsent";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { WhatsAppConcierge } from "@/components/layout/WhatsAppConcierge";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AVANYA | Contemporary Indian Luxury & Haute Couture",
    template: "%s | AVANYA Luxury",
  },
  description:
    "Discover handcrafted luxury fashion for men and women. Heritage Kanjivarams, bespoke bandhgalas, artisanal organza sarees, and tailored modern luxury.",
  keywords: [
    "luxury fashion India",
    "designer sarees",
    "bespoke bandhgala",
    "lehengas",
    "designer ethnic wear",
    "AVANYA",
  ],
  authors: [{ name: "AVANYA Atelier" }],
  creator: "AVANYA Atelier",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://avanya.in",
    title: "AVANYA | Contemporary Indian Luxury Fashion",
    description: "Curated luxury Indian craftsmanship for modern discerning wardrobes.",
    siteName: "AVANYA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className="min-h-screen flex flex-col bg-surface text-ink antialiased font-sans selection:bg-emerald-500 selection:text-white">
        <AuthProvider>
          {/* Analytics Conditional Injection based on DPDP Consent */}
          <AnalyticsScripts />

          {/* Global Promotional & Free Shipping Announcement */}
          <AnnouncementBar />

          {/* Global Sticky Luxury Header with MegaMenu & Drawer Navigation */}
          <Header />

          {/* Dynamic Page Content with mobile bottom bar clearance */}
          <main className="flex-1 pb-16 lg:pb-0">{children}</main>

          {/* Global Slide-Out Cart Drawer */}
          <CartDrawer />

          {/* Floating Luxury WhatsApp Concierge */}
          <WhatsAppConcierge />

          {/* DPDP Act Compliant Cookie Consent Banner */}
          <CookieConsent />

          {/* Mobile Bottom Navigation Bar (Home, Couture, Wishlist, Bag, Account) */}
          <MobileBottomNav />

          {/* Global Luxury Footer */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

