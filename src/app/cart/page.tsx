import { CartPageView } from "@/components/cart/CartPageView";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shopping Bag | AVANYA Luxury",
  description: "Review and manage your selected luxury handcrafted garments, silk sarees, and bespoke attire.",
};

export default function CartPage() {
  return <CartPageView />;
}
