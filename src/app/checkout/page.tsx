import { CheckoutPageView } from "@/components/checkout/CheckoutPageView";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Secure Checkout | AVANYA Luxury",
  description:
    "Complete your luxury couture order with encrypted payment and discreet delivery across India.",
};

export default function CheckoutPage() {
  return <CheckoutPageView />;
}
