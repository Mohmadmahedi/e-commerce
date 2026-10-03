"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        totpCode: totpCode.trim() || undefined,
        callbackUrl,
      });

      if (!res) {
        setErrorMessage("An unexpected network error occurred. Please try again.");
        setLoading(false);
        return;
      }

      if (res.error) {
        if (res.error.includes("TWO_FACTOR_REQUIRED") || res.error.toLowerCase().includes("two-factor")) {
          setRequires2FA(true);
          setErrorMessage("Please enter your 6-digit Authenticator TOTP code below.");
        } else {
          setErrorMessage(res.error);
        }
        setLoading(false);
        return;
      }

      // Successful login
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Unable to sign in. Please verify your credentials.");
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role: "customer" | "admin") => {
    if (role === "customer") {
      setEmail("ananya@example.com");
      setPassword("Password@123");
    } else {
      setEmail("admin@avanya.in");
      setPassword("Password@123");
    }
    setRequires2FA(false);
    setTotpCode("");
    setErrorMessage("");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface">
      <div className="max-w-md w-full space-y-8 bg-surface-card p-8 sm:p-10 rounded-2xl border border-[#E5E0D8] shadow-sm">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-emerald-800 font-semibold">
            Member Access
          </span>
          <h1 className="text-3xl font-serif text-ink font-normal tracking-tight">Welcome Back</h1>
          <p className="text-sm text-ink-muted">
            Sign in to access your orders, saved addresses, and bespoke curation.
          </p>
        </div>

        {/* Demo Credentials Quick Selector */}
        <div className="p-3 bg-surface-warm rounded-xl border border-[#E5E0D8]/60 space-y-2 text-xs">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="font-medium text-ink flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-emerald-700" /> Demo Credentials:
            </span>
            <span className="text-[11px] text-ink-faint">Click to autofill</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials("customer")}
              className="flex-1 py-1.5 px-2.5 bg-surface-card hover:bg-emerald-50 hover:border-emerald-200 border border-[#E5E0D8] rounded text-left transition-colors"
            >
              <div className="font-semibold text-ink">Customer Account</div>
              <div className="text-[10px] text-ink-muted truncate">ananya@example.com</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials("admin")}
              className="flex-1 py-1.5 px-2.5 bg-surface-card hover:bg-emerald-50 hover:border-emerald-200 border border-[#E5E0D8] rounded text-left transition-colors"
            >
              <div className="font-semibold text-ink">Admin Atelier</div>
              <div className="text-[10px] text-ink-muted truncate">admin@avanya.in</div>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                Password
              </label>
              <span className="text-xs text-ink-muted hover:text-emerald-800 cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 transition-colors"
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
          </div>

          {/* Optional / Required 2FA Code Field */}
          {requires2FA && (
            <div className="animate-in slide-in-from-top-2 pt-1">
              <label className="block text-xs uppercase tracking-wider text-emerald-800 mb-1.5 font-semibold">
                Two-Factor Security Code (TOTP)
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-emerald-700 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit authenticator code"
                  className="w-full pl-10 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-300 rounded-xl text-sm tracking-widest font-mono text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  autoFocus
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-ink text-surface rounded-xl font-medium text-sm tracking-wide hover:bg-black active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-6 shadow-sm disabled:opacity-70"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer & Register Link */}
        <div className="text-center pt-4 border-t border-[#E5E0D8]/60 space-y-4">
          <p className="text-xs text-ink-muted">
            New to AVANYA?{" "}
            <Link
              href="/auth/register"
              className="text-emerald-800 hover:text-emerald-900 font-semibold underline underline-offset-4"
            >
              Create an Atelier account
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

