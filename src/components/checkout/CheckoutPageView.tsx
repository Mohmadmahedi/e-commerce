"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Lock,
  Banknote,
  User,
  Mail,
  Phone,
  Home,
  Building,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Package,
  Info,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatINR } from "@/lib/utils";
import type { CartCalculationResult } from "@/server/services/cart.service";

/* ─────────────────────── Constants ─────────────────────── */
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Chandigarh",
  "Puducherry", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep",
  "Andaman and Nicobar Islands",
].sort();

type Step = "address" | "payment" | "review";

interface AddressForm {
  name: string;
  phone: string;
  alternatePhone: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  addressType: "HOME" | "WORK" | "OTHER";
}

const EMPTY_ADDRESS: AddressForm = {
  name: "",
  phone: "",
  alternatePhone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  addressType: "HOME",
};

/* ─────────────────────── Component ─────────────────────── */
export function CheckoutPageView() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const guestToken = useCartStore((s) => s.guestToken);
  const setItemCount = useCartStore((s) => s.setItemCount);

  // State
  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [cartData, setCartData] = useState<CartCalculationResult | null>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);

  // Guest info
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Address
  const [shippingAddress, setShippingAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [pinLookupLoading, setPinLookupLoading] = useState(false);
  const [pinCityState, setPinCityState] = useState<{ city: string; state: string } | null>(null);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const idempotencyKeyRef = useRef<string>("");

  // Generate idempotency key once per checkout session
  useEffect(() => {
    idempotencyKeyRef.current = `idem_${Date.now()}_${Math.random().toString(36).substring(2, 18)}`;
  }, []);

  /* ─────────── Fetch Cart ─────────── */
  const fetchCart = useCallback(async () => {
    try {
      setCartLoading(true);
      const res = await fetch(`/api/v1/cart?guestToken=${guestToken}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCartData(json.data);
      } else {
        router.push("/cart");
      }
    } catch {
      router.push("/cart");
    } finally {
      setCartLoading(false);
    }
  }, [guestToken, router]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /* ─────────── PIN Code Auto-Fill ─────────── */
  const handlePinCodeLookup = async (pin: string) => {
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      setPinCityState(null);
      return;
    }

    setPinLookupLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const result = { city: po.District || po.Name, state: po.State };
        setPinCityState(result);
        setShippingAddress((prev) => ({
          ...prev,
          city: result.city,
          state: result.state,
        }));
      } else {
        setPinCityState(null);
      }
    } catch {
      setPinCityState(null);
    } finally {
      setPinLookupLoading(false);
    }
  };

  /* ─────────── Validation ─────────── */
  const validateAddress = (): boolean => {
    const errs: Record<string, string> = {};

    // Guest details
    if (!session?.user) {
      if (!guestEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        errs.guestEmail = "Valid email is required for guest checkout";
      }
    }

    if (!shippingAddress.name || shippingAddress.name.length < 2) {
      errs.name = "Full name is required";
    }
    if (!shippingAddress.phone || !/^[6-9]\d{9}$/.test(shippingAddress.phone)) {
      errs.phone = "Valid 10-digit Indian mobile number required";
    }
    if (!shippingAddress.addressLine1 || shippingAddress.addressLine1.length < 5) {
      errs.addressLine1 = "Address is required (min 5 characters)";
    }
    if (!shippingAddress.city || shippingAddress.city.length < 2) {
      errs.city = "City is required";
    }
    if (!shippingAddress.state) {
      errs.state = "State is required";
    }
    if (!shippingAddress.postalCode || !/^[1-9][0-9]{5}$/.test(shippingAddress.postalCode)) {
      errs.postalCode = "Valid 6-digit PIN code required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ─────────── Step Navigation ─────────── */
  const goToPayment = () => {
    if (validateAddress()) {
      setCurrentStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToReview = () => {
    setCurrentStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ─────────── Place Order ─────────── */
  const handlePlaceOrder = async () => {
    if (submitting) return;
    setSubmitting(true);
    setGlobalError(null);

    try {
      const checkoutPayload = {
        guestToken,
        guestEmail: session?.user?.email || guestEmail || undefined,
        guestPhone: guestPhone || undefined,
        shippingAddress: {
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          alternatePhone: shippingAddress.alternatePhone || undefined,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2 || undefined,
          landmark: shippingAddress.landmark || undefined,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          addressType: shippingAddress.addressType,
        },
        billingAddress: sameAsShipping
          ? undefined
          : {
              name: billingAddress.name,
              phone: billingAddress.phone,
              addressLine1: billingAddress.addressLine1,
              addressLine2: billingAddress.addressLine2 || undefined,
              landmark: billingAddress.landmark || undefined,
              city: billingAddress.city,
              state: billingAddress.state,
              postalCode: billingAddress.postalCode,
              addressType: billingAddress.addressType,
            },
        sameAsShipping,
        paymentMethod,
        idempotencyKey: idempotencyKeyRef.current,
      };

      const res = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutPayload),
      });

      const json = await res.json();

      if (!json.success) {
        setGlobalError(json.error || "Checkout failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const orderData = json.data;

      if (paymentMethod === "RAZORPAY" && orderData.razorpay) {
        // Open Razorpay Checkout SDK
        await openRazorpayCheckout(orderData);
      } else {
        // COD — go directly to confirmation
        setItemCount(0);
        router.push(`/order-confirmation/${orderData.orderNumber}`);
      }
    } catch (err: any) {
      setGlobalError(err.message || "An unexpected error occurred");
      setSubmitting(false);
    }
  };

  /* ─────────── Razorpay Checkout SDK ─────────── */
  const openRazorpayCheckout = async (orderData: any) => {
    // If keys are development placeholders, offer local sandbox completion
    if (
      orderData.razorpay?.keyId?.includes("placeholder") ||
      orderData.razorpay?.keyId?.includes("mock")
    ) {
      const simulateSuccess = window.confirm(
        "⚡ [AVANYA Payment Sandbox]\n\nRazorpay API keys in .env are set to test placeholders.\n\nClick [OK] to simulate a successful payment and complete this order, or [Cancel] to return."
      );
      if (simulateSuccess) {
        try {
          const verifyRes = await fetch("/api/v1/checkout/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderData.orderId,
              razorpayOrderId: orderData.razorpay.orderId,
              razorpayPaymentId: `pay_mock_${Date.now()}`,
              razorpaySignature: "valid_test_signature",
            }),
          });
          const verifyJson = await verifyRes.json();
          if (verifyJson.success) {
            setItemCount(0);
            router.push(`/order-confirmation/${orderData.orderNumber}`);
            return;
          }
        } catch {
          setGlobalError("Payment sandbox simulation failed");
          setSubmitting(false);
          return;
        }
      } else {
        setSubmitting(false);
        return;
      }
    }

    // Dynamically load Razorpay SDK if not loaded
    if (!(window as any).Razorpay) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
        document.head.appendChild(script);
      });
    }

    const options = {
      key: orderData.razorpay.keyId,
      amount: orderData.razorpay.amount,
      currency: orderData.razorpay.currency,
      name: "AVANYA",
      description: `Order #${orderData.orderNumber}`,
      order_id: orderData.razorpay.orderId,
      prefill: {
        name: shippingAddress.name,
        email: session?.user?.email || guestEmail,
        contact: shippingAddress.phone,
      },
      theme: {
        color: "#0B5D4B",
        backdrop_color: "rgba(0,0,0,0.6)",
      },
      modal: {
        ondismiss: () => {
          setSubmitting(false);
          setGlobalError("Payment was cancelled. Your order is saved — you can retry.");
        },
      },
      handler: async (response: any) => {
        // Verify payment signature server-side
        try {
          const verifyRes = await fetch("/api/v1/checkout/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderData.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const verifyJson = await verifyRes.json();
          if (verifyJson.success) {
            setItemCount(0);
            router.push(`/order-confirmation/${orderData.orderNumber}`);
          } else {
            setGlobalError("Payment verification failed. Contact support with order #" + orderData.orderNumber);
            setSubmitting(false);
          }
        } catch {
          setGlobalError("Payment verification error. Contact support with order #" + orderData.orderNumber);
          setSubmitting(false);
        }
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", (response: any) => {
      setGlobalError(
        `Payment failed: ${response.error?.description || "Unknown error"}. Please retry.`
      );
      setSubmitting(false);
    });
    rzp.open();
  };

  /* ─────────── Loading/Empty States ─────────── */
  if (cartLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mx-auto mb-4" />
          <p className="text-sm text-gray-500">Preparing your checkout…</p>
        </div>
      </div>
    );
  }

  if (!cartData || !cartData.items || cartData.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <Package className="w-16 h-16 text-gray-300" />
        <h2 className="font-playfair text-2xl text-ink">Your bag is empty</h2>
        <p className="text-gray-500 text-center">Add items to your bag before proceeding to checkout.</p>
        <Link
          href="/"
          className="mt-4 px-8 py-3 bg-emerald-700 text-white rounded-full hover:bg-emerald-800 transition-colors text-sm tracking-wide"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: "address", label: "Address", icon: <MapPin className="w-4 h-4" /> },
    { key: "payment", label: "Payment", icon: <CreditCard className="w-4 h-4" /> },
    { key: "review", label: "Review", icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  /* ─────────── Render ─────────── */
  return (
    <div className="bg-surface min-h-screen">
      {/* Checkout Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/cart" className="flex items-center gap-2 text-gray-600 hover:text-emerald-700 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Bag</span>
          </Link>
          <h1 className="font-playfair text-xl sm:text-2xl text-ink">Secure Checkout</h1>
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs">
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">256-bit SSL</span>
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <div className="bg-white border-b border-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-0">
            {steps.map((step, i) => (
              <div key={step.key} className="flex items-center">
                <button
                  onClick={() => {
                    if (i < stepIndex) setCurrentStep(step.key);
                  }}
                  disabled={i > stepIndex}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    i === stepIndex
                      ? "bg-emerald-700 text-white shadow-sm"
                      : i < stepIndex
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {step.icon}
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </button>
                {i < steps.length - 1 && (
                  <ChevronRight className={`w-4 h-4 mx-1 ${i < stepIndex ? "text-emerald-500" : "text-gray-300"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left: Form Area */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Global Error */}
            {globalError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 font-medium">Order Error</p>
                  <p className="text-sm text-red-600 mt-1">{globalError}</p>
                </div>
              </div>
            )}

            {/* ═══════════ STEP 1: ADDRESS ═══════════ */}
            {currentStep === "address" && (
              <div className="space-y-6">
                {/* Guest Contact Info */}
                {authStatus !== "loading" && !session?.user && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
                    <h2 className="font-playfair text-lg text-ink mb-1">Contact Information</h2>
                    <p className="text-xs text-gray-500 mb-4">
                      Already have an account?{" "}
                      <Link href="/auth/login?callbackUrl=/checkout" className="text-emerald-700 underline">
                        Log in
                      </Link>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            placeholder="your@email.com"
                            className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                              errors.guestEmail ? "border-red-300 bg-red-50" : "border-gray-200"
                            }`}
                          />
                        </div>
                        {errors.guestEmail && <p className="text-xs text-red-500 mt-1">{errors.guestEmail}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Phone (Optional)</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="tel"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            placeholder="9876543210"
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
                  <h2 className="font-playfair text-lg text-ink mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-700" />
                    Shipping Address
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={shippingAddress.name}
                          onChange={(e) => setShippingAddress((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Ananya Sharma"
                          className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            errors.name ? "border-red-300 bg-red-50" : "border-gray-200"
                          }`}
                        />
                      </div>
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Mobile Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-gray-500">+91</span>
                        <input
                          type="tel"
                          value={shippingAddress.phone}
                          onChange={(e) =>
                            setShippingAddress((p) => ({
                              ...p,
                              phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                            }))
                          }
                          placeholder="9876543210"
                          className={`w-full pl-[4.5rem] pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            errors.phone ? "border-red-300 bg-red-50" : "border-gray-200"
                          }`}
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>

                    {/* Alternate Phone */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Alternate Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={shippingAddress.alternatePhone}
                          onChange={(e) =>
                            setShippingAddress((p) => ({
                              ...p,
                              alternatePhone: e.target.value.replace(/\D/g, "").slice(0, 10),
                            }))
                          }
                          placeholder="Optional"
                          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* PIN Code */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">PIN Code *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={shippingAddress.postalCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                            setShippingAddress((p) => ({ ...p, postalCode: val }));
                            if (val.length === 6) handlePinCodeLookup(val);
                          }}
                          placeholder="560001"
                          className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            errors.postalCode ? "border-red-300 bg-red-50" : "border-gray-200"
                          }`}
                        />
                        {pinLookupLoading && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-emerald-600" />
                        )}
                        {pinCityState && !pinLookupLoading && (
                          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
                      {pinCityState && (
                        <p className="text-xs text-emerald-600 mt-1">
                          📍 {pinCityState.city}, {pinCityState.state}
                        </p>
                      )}
                    </div>

                    {/* Address Type */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Address Type</label>
                      <div className="flex gap-2">
                        {(["HOME", "WORK", "OTHER"] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setShippingAddress((p) => ({ ...p, addressType: type }))}
                            className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                              shippingAddress.addressType === type
                                ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            {type === "HOME" ? "🏠 Home" : type === "WORK" ? "🏢 Work" : "📍 Other"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Flat / House No */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Flat / House No. / Building *
                      </label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={shippingAddress.addressLine1}
                          onChange={(e) => setShippingAddress((p) => ({ ...p, addressLine1: e.target.value }))}
                          placeholder="Flat 301, Tower B, Prestige Lakeside"
                          className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            errors.addressLine1 ? "border-red-300 bg-red-50" : "border-gray-200"
                          }`}
                        />
                      </div>
                      {errors.addressLine1 && <p className="text-xs text-red-500 mt-1">{errors.addressLine1}</p>}
                    </div>

                    {/* Area / Street */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Area / Street / Sector</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={shippingAddress.addressLine2}
                          onChange={(e) => setShippingAddress((p) => ({ ...p, addressLine2: e.target.value }))}
                          placeholder="Whitefield Main Road"
                          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Landmark */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Landmark</label>
                      <input
                        type="text"
                        value={shippingAddress.landmark}
                        onChange={(e) => setShippingAddress((p) => ({ ...p, landmark: e.target.value }))}
                        placeholder="Near Phoenix Mall"
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">City *</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress((p) => ({ ...p, city: e.target.value }))}
                        placeholder="Bengaluru"
                        className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          errors.city ? "border-red-300 bg-red-50" : "border-gray-200"
                        }`}
                      />
                      {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                    </div>

                    {/* State */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">State *</label>
                      <select
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress((p) => ({ ...p, state: e.target.value }))}
                        className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${
                          errors.state ? "border-red-300 bg-red-50" : "border-gray-200"
                        }`}
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                    </div>
                  </div>

                  {/* Billing Address Toggle */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsShipping}
                        onChange={(e) => setSameAsShipping(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">Billing address same as shipping</span>
                    </label>
                  </div>
                </div>

                {/* Continue to Payment Button */}
                <button
                  type="button"
                  onClick={goToPayment}
                  className="w-full py-3.5 bg-emerald-700 text-white rounded-xl font-medium text-sm tracking-wide hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20"
                >
                  Continue to Payment
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ═══════════ STEP 2: PAYMENT ═══════════ */}
            {currentStep === "payment" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
                  <h2 className="font-playfair text-lg text-ink mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-700" />
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    {/* Razorpay */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "RAZORPAY"
                          ? "border-emerald-500 bg-emerald-50/50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="RAZORPAY"
                        checked={paymentMethod === "RAZORPAY"}
                        onChange={() => setPaymentMethod("RAZORPAY")}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-700" />
                          <span className="text-sm font-medium text-ink">Pay Online</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          UPI, Cards, Net Banking, Wallets — Powered by Razorpay
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-medium">Secure</span>
                      </div>
                    </label>

                    {/* COD */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "COD"
                          ? "border-emerald-500 bg-emerald-50/50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-medium text-ink">Cash on Delivery</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Pay when your order arrives. Available for orders under ₹25,000.
                        </p>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === "RAZORPAY" && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        You&apos;ll be redirected to Razorpay&apos;s secure payment page after reviewing your order. 
                        Your card details are never stored on our servers.
                      </p>
                    </div>
                  )}
                </div>

                {/* Continue to Review */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep("address")}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 inline mr-1" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={goToReview}
                    className="flex-1 py-3.5 bg-emerald-700 text-white rounded-xl font-medium text-sm tracking-wide hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20"
                  >
                    Review Order
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════ STEP 3: REVIEW ═══════════ */}
            {currentStep === "review" && (
              <div className="space-y-6">
                {/* Address Summary */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm text-ink flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-700" />
                      Shipping To
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep("address")}
                      className="text-xs text-emerald-700 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p className="font-medium text-ink">{shippingAddress.name}</p>
                    <p>{shippingAddress.addressLine1}</p>
                    {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                    {shippingAddress.landmark && <p>Landmark: {shippingAddress.landmark}</p>}
                    <p>
                      {shippingAddress.city}, {shippingAddress.state} — {shippingAddress.postalCode}
                    </p>
                    <p className="text-emerald-700">📱 +91 {shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm text-ink flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-700" />
                      Payment
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep("payment")}
                      className="text-xs text-emerald-700 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {paymentMethod === "RAZORPAY"
                      ? "🔒 Online Payment (UPI / Cards / Net Banking)"
                      : "💵 Cash on Delivery"}
                  </p>
                </div>

                {/* Items Preview */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
                  <h3 className="font-medium text-sm text-ink mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-700" />
                    Items ({cartData.items.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cartData.items.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center">
                        <div className="w-12 h-14 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              IMG
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink font-medium truncate">{item.title}</p>
                          <p className="text-xs text-gray-500">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && " · "}
                            {item.color && `Color: ${item.color}`}
                            {" · "}Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-ink">{formatINR(item.itemTotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Place Order Button */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep("payment")}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 inline mr-1" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    className="flex-1 py-3.5 bg-emerald-700 text-white rounded-xl font-semibold text-sm tracking-wide hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        {paymentMethod === "RAZORPAY"
                          ? `Pay ${formatINR(cartData.finalTotal)}`
                          : `Place Order · ${formatINR(cartData.finalTotal)}`}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Mobile Toggle */}
              <button
                type="button"
                onClick={() => setOrderSummaryOpen(!orderSummaryOpen)}
                className="w-full lg:hidden flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm"
              >
                <span className="text-sm font-medium text-ink flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-700" />
                  Order Summary ({cartData.items.length} items)
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-emerald-700">{formatINR(cartData.finalTotal)}</span>
                  {orderSummaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              <div className={`${orderSummaryOpen ? "block" : "hidden"} lg:block`}>
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="font-playfair text-lg text-ink mb-4 hidden lg:block">Order Summary</h3>

                  {/* Items */}
                  <div className="space-y-3 max-h-48 overflow-y-auto mb-4 pb-4 border-b border-gray-100">
                    {cartData.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative w-12 h-14 bg-gray-50 rounded-md flex-shrink-0 overflow-hidden">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                              IMG
                            </div>
                          )}
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 text-white text-[10px] rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-ink truncate">{item.title}</p>
                          <p className="text-[10px] text-gray-400">{item.size} / {item.color}</p>
                        </div>
                        <p className="text-xs font-medium text-ink">{formatINR(item.itemTotal)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Total MRP</span>
                      <span>{formatINR(cartData.totalMrp)}</span>
                    </div>

                    {cartData.discountOnMrp > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount on MRP</span>
                        <span>−{formatINR(cartData.discountOnMrp)}</span>
                      </div>
                    )}

                    {cartData.couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Coupon ({cartData.couponCode})</span>
                        <span>−{formatINR(cartData.couponDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        Shipping
                      </span>
                      <span className={cartData.shippingFee === 0 ? "text-emerald-600 font-medium" : ""}>
                        {cartData.shippingFee === 0 ? "FREE" : formatINR(cartData.shippingFee)}
                      </span>
                    </div>

                    <div className="flex justify-between text-gray-500 text-xs">
                      <span>GST (Included)</span>
                      <span>{formatINR(cartData.gstAmount)}</span>
                    </div>

                    <div className="h-px bg-gray-200 my-2" />

                    <div className="flex justify-between font-semibold text-ink text-base">
                      <span>Total Payable</span>
                      <span className="text-emerald-700">{formatINR(cartData.finalTotal)}</span>
                    </div>
                  </div>

                  {/* Savings Badge */}
                  {(cartData.discountOnMrp + cartData.couponDiscount) > 0 && (
                    <div className="mt-3 p-2.5 bg-emerald-50 rounded-lg flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs text-emerald-700 font-medium">
                        You&apos;re saving {formatINR(cartData.discountOnMrp + cartData.couponDiscount)} on this order!
                      </span>
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mt-4 shadow-sm">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />, text: "Secure Payment" },
                      { icon: <Truck className="w-5 h-5 text-emerald-700" />, text: "Free Shipping ₹999+" },
                      { icon: <Package className="w-5 h-5 text-emerald-700" />, text: "Easy 15-Day Returns" },
                      { icon: <Lock className="w-5 h-5 text-emerald-700" />, text: "Privacy Protected" },
                    ].map((badge, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {badge.icon}
                        <span className="text-[11px] text-gray-600">{badge.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
