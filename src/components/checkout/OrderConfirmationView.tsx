"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  Printer,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

interface OrderConfirmationViewProps {
  order: any;
}

export function OrderConfirmationView({ order }: OrderConfirmationViewProps) {
  const [copied, setCopied] = useState(false);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Expected delivery date: 4 to 6 days from order date
  const orderDate = new Date(order.createdAt);
  const deliveryStart = new Date(orderDate);
  deliveryStart.setDate(deliveryStart.getDate() + 4);
  const deliveryEnd = new Date(orderDate);
  deliveryEnd.setDate(deliveryEnd.getDate() + 6);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 print:py-0 print:px-0">
      {/* Luxury Success Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10 mb-8 text-center relative overflow-hidden print:border-none print:shadow-none">
        {/* Subtle decorative background gradient */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold px-3 py-1 bg-emerald-50 rounded-full">
          Order Confirmed
        </span>

        <h1 className="font-playfair text-2xl sm:text-3xl text-ink font-semibold mt-3 mb-2">
          Thank you for choosing AVANYA
        </h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Your bespoke luxury order has been placed. We have dispatched a confirmation email to{" "}
          <span className="font-medium text-ink">{order.shippingAddress?.phone ? `+91 ${order.shippingAddress.phone}` : "your registered address"}</span>.
        </p>

        {/* Order Identifier Banner */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 bg-surface px-5 py-2.5 rounded-full border border-gray-200">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Order No:</span>
          <span className="font-mono text-sm font-bold text-ink">{order.orderNumber}</span>
          <button
            onClick={copyOrderNumber}
            className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium transition-colors"
            title="Copy order number"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>

        {/* Action Buttons: Print & Tracking */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-gray-300 text-xs font-medium text-gray-700 rounded-lg transition-colors bg-white shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500" />
            Print Receipt
          </button>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 px-4 py-2 bg-ink hover:bg-black text-xs font-medium text-white rounded-lg transition-colors shadow-xs"
          >
            <Package className="w-3.5 h-3.5" />
            Track in My Account
          </Link>
        </div>
      </div>

      {/* Grid: Order Details & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Items & Delivery Timeline */}
        <div className="md:col-span-2 space-y-6">
          {/* Estimated Delivery Status */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-playfair text-base font-semibold text-ink">Delivery Estimate</h3>
              </div>
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Express White-Glove
              </span>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-ink">
                  Arriving between {formatDate(deliveryStart)} – {formatDate(deliveryEnd)}
                </p>
                <p className="text-xs text-gray-500">
                  Carefully packed in tamper-proof AVANYA heirloom preservation boxes.
                </p>
              </div>
            </div>
          </div>

          {/* Ordered Garments */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
            <h3 className="font-playfair text-base font-semibold text-ink mb-4 pb-3 border-b border-gray-100 flex items-center justify-between">
              <span>Articles Ordered ({order.items?.length || 0})</span>
              <span className="text-xs text-gray-500 font-sans font-normal">All GST Included</span>
            </h3>

            <div className="divide-y divide-gray-100">
              {order.items?.map((item: any) => {
                const img = item.product?.images?.[0]?.url || null;
                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                    <div className="w-16 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 relative">
                      {img ? (
                        <img
                          src={img}
                          alt={item.title}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          AVANYA
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-ink truncate">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && " | "}
                        {item.color && `Color: ${item.color}`}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink">{formatINR(item.totalPrice)}</p>
                      <p className="text-[11px] text-gray-400">{formatINR(item.unitPrice)} each</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Address & Financial Summary */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
            <h3 className="font-playfair text-base font-semibold text-ink mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              Delivery Destination
            </h3>
            {order.shippingAddress ? (
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-ink text-sm">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                {order.shippingAddress.landmark && <p>Landmark: {order.shippingAddress.landmark}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} –{" "}
                  <span className="font-medium text-ink">{order.shippingAddress.postalCode}</span>
                </p>
                <p className="pt-1 text-emerald-700 font-medium">📞 +91 {order.shippingAddress.phone}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Address details unavailable.</p>
            )}
          </div>

          {/* Payment & Billing Breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
            <h3 className="font-playfair text-base font-semibold text-ink mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Payment Summary
            </h3>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-medium text-ink">
                  {order.payments?.[0]?.paymentGateway === "COD"
                    ? "Cash on Delivery"
                    : "Razorpay (Online)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status</span>
                <span
                  className={`font-semibold ${
                    order.paymentStatus === "PAID"
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <div className="h-px bg-gray-100 my-2" />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Savings {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>- {formatINR(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shippingFee === 0 ? "FREE" : formatINR(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Applicable GST</span>
                <span>{formatINR(order.taxAmount)}</span>
              </div>
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex justify-between text-sm font-bold text-ink">
                <span>Total Amount</span>
                <span className="text-emerald-800">{formatINR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Continue Shopping CTA */}
          <div className="print:hidden">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-3 bg-surface hover:bg-gray-100 text-ink text-xs font-medium rounded-xl border border-gray-200 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Curating Your Wardrobe
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
