"use client";

import { useState, useEffect } from "react";
import { MapPin, CheckCircle2, AlertCircle, Truck, Banknote } from "lucide-react";

export function PinCodeDeliveryCheck() {
  const [pinCode, setPinCode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [deliveryDate, setDeliveryDate] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("avanya-pincode");
    if (saved && /^[1-9][0-9]{5}$/.test(saved)) {
      setPinCode(saved);
      calculateDelivery();
    }
  }, []);

  const calculateDelivery = () => {
    const today = new Date();
    // 3 to 4 business days estimate
    const est = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000);
    const options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" };
    setDeliveryDate(est.toLocaleDateString("en-IN", options));
    setStatus("valid");
  };

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(pinCode.trim())) {
      setStatus("invalid");
      return;
    }

    setStatus("checking");
    setTimeout(() => {
      calculateDelivery();
      localStorage.setItem("avanya-pincode", pinCode.trim());
    }, 400);
  };

  return (
    <div className="space-y-3 pt-5 border-t border-[#E5E0D8]">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink">
        <MapPin className="w-4 h-4 text-emerald-600" />
        <span>Delivery & Servicing Details</span>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2 max-w-sm">
        <input
          type="text"
          maxLength={6}
          value={pinCode}
          onChange={(e) => {
            setPinCode(e.target.value.replace(/\D/g, ""));
            if (status !== "idle") setStatus("idle");
          }}
          placeholder="Enter 6-digit Indian PIN Code"
          className="w-full bg-surface-card border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={status === "checking" || pinCode.length !== 6}
          className="bg-ink hover:bg-emerald-600 text-surface text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-xl disabled:opacity-50 transition-colors shrink-0"
        >
          {status === "checking" ? "Checking..." : "Verify"}
        </button>
      </form>

      {status === "invalid" && (
        <div className="flex items-center gap-2 text-xs text-rose-600 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Please enter a valid 6-digit Indian postal PIN code.</span>
        </div>
      )}

      {status === "valid" && (
        <div className="p-3.5 rounded-xl bg-surface-warm border border-[#E5E0D8] space-y-2 text-xs text-ink-soft animate-in fade-in">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Servicing {pinCode}: Verified for Express Air Dispatch</span>
          </div>

          <div className="space-y-1 pl-6 text-ink">
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                Estimated Delivery by <strong className="text-ink font-semibold">{deliveryDate}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-ink-muted">
              <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Cash on Delivery (COD) & UPI on delivery available</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PinCodeDeliveryCheck;
