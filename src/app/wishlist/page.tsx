import { WishlistPageView } from "@/components/wishlist/WishlistPageView";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Wishlist | AVANYA Luxury",
  description: "View and curate your saved bespoke Indian couture garments, silk sarees, and luxury favorites.",
};

export default function WishlistPage() {
  return <WishlistPageView />;
}
