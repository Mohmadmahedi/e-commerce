import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { orderRepository } from "@/server/repositories/order.repository";
import { OrderConfirmationView } from "@/components/checkout/OrderConfirmationView";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order #${orderNumber} Confirmed | AVANYA Luxury`,
    description: `Thank you for your order. Order #${orderNumber} has been received and is being prepared.`,
  };
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await orderRepository.findByOrderNumber(orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <OrderConfirmationView order={order} />
    </div>
  );
}
