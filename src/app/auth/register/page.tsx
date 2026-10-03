"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, ShieldCheck, Lock, Mail, User, Phone, Check, ArrowRight, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeConsent, setAgreeConsent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Live password validation
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@$!%*?&#^]/.test(password);
  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!isPasswordValid) {
      setErrorMessage("Please ensure your password satisfies all security criteria.");
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!agreeConsent) {
      setErrorMessage("Please accept the terms and privacy consent to create your account.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Registration failed. Please check the information provided.");
        setLoading(false);
        return;
      }

      // Automatically sign in upon registration
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/account",
      });

      if (signInRes?.ok) {
        router.push("/account");
        router.refresh();
      } else {
        router.push("/auth/login?registered=true");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong during registration.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface">
      <div className="max-w-lg w-full space-y-8 bg-surface-card p-8 sm:p-10 rounded-2xl border border-[#E5E0D8] shadow-sm">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-emerald-800 font-semibold">
            Join The Atelier
          </span>
          <h1 className="text-3xl font-serif text-ink font-normal tracking-tight">Create an Account</h1>
          <p className="text-sm text-ink-muted">
            Enjoy expedited checkout, order tracking, and bespoke luxury curation.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Radhika Sharma"
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-ink-muted hover:text-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Checklist */}
            <div className="mt-2.5 p-3 bg-surface-warm/70 rounded-xl border border-[#E5E0D8]/60 space-y-1.5 text-[11px]">
              <span className="font-semibold text-ink text-xs block mb-1">Password Requirements:</span>
              <div className="grid grid-cols-2 gap-1 text-ink-muted">
                <span className={`flex items-center gap-1.5 ${hasMinLen ? "text-emerald-700 font-medium" : ""}`}>
                  <Check className={`w-3 h-3 ${hasMinLen ? "text-emerald-700" : "text-ink-faint"}`} /> 8+ Characters
                </span>
                <span className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-700 font-medium" : ""}`}>
                  <Check className={`w-3 h-3 ${hasUpper ? "text-emerald-700" : "text-ink-faint"}`} /> Uppercase Letter
                </span>
                <span className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-700 font-medium" : ""}`}>
                  <Check className={`w-3 h-3 ${hasLower ? "text-emerald-700" : "text-ink-faint"}`} /> Lowercase Letter
                </span>
                <span className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700 font-medium" : ""}`}>
                  <Check className={`w-3 h-3 ${hasNumber ? "text-emerald-700" : "text-ink-faint"}`} /> Number
                </span>
                <span className={`flex items-center gap-1.5 col-span-2 ${hasSpecial ? "text-emerald-700 font-medium" : ""}`}>
                  <Check className={`w-3 h-3 ${hasSpecial ? "text-emerald-700" : "text-ink-faint"}`} /> Special Character (@$!%*?&#^)
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
            {confirmPassword && !passwordsMatch && (
              <span className="text-[11px] text-red-600 mt-1 block">Passwords do not match</span>
            )}
          </div>

          {/* DPDP Consent */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-ink-muted leading-relaxed">
              <input
                type="checkbox"
                required
                checked={agreeConsent}
                onChange={(e) => setAgreeConsent(e.target.checked)}
                className="mt-1 rounded border-[#E5E0D8] text-emerald-800 focus:ring-emerald-700"
              />
              <span>
                I agree to the Terms of Service and acknowledge the processing of my contact and address data in compliance with India&apos;s Digital Personal Data Protection (DPDP) Act.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-ink text-surface rounded-xl font-medium text-sm tracking-wide hover:bg-black active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-6 shadow-sm disabled:opacity-70"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Atelier Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer & Login Link */}
        <div className="text-center pt-4 border-t border-[#E5E0D8]/60 space-y-4">
          <p className="text-xs text-ink-muted">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-emerald-800 hover:text-emerald-900 font-semibold underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>

          <div className="flex items-center justify-center gap-4 text-[11px] text-ink-faint">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> 256-Bit SSL
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> DPDP Act Protected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
