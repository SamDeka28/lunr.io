"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const establishSession = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("Recovery code exchange failed:", exchangeError);
          } else {
            // Clean the code from the URL
            window.history.replaceState({}, "", window.location.pathname);
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!cancelled) {
          setHasSession(!!session);
        }
      } catch (err) {
        console.error("Failed to establish recovery session:", err);
        if (!cancelled) {
          setHasSession(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setHasSession(true);
        setCheckingSession(false);
      }
    });

    establishSession();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      toast.success("Password updated successfully!");
      router.push("/login");
      router.refresh();
    } catch (err: any) {
      const message = err?.message || "Failed to update password";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-neutral-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-electric-sapphire/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-bright-indigo/10 rounded-full blur-3xl animate-float-reverse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-vivid-royal/5 rounded-full blur-3xl animate-drift"></div>
      </div>

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        preserveAspectRatio="none"
        viewBox="0 0 1920 1080"
      >
        <path
          d="M0,432 Q960,324 1920,432 T3840,432"
          stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth="3"
          fill="none"
          className="animate-wave"
        />
        <path
          d="M0,540 Q960,432 1920,540 T3840,540"
          stroke="rgba(99, 102, 241, 0.2)"
          strokeWidth="3"
          fill="none"
          className="animate-wave delay-1000"
        />
      </svg>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center mb-6"
          >
            <BrandLogo href={null} variant="full" size="lg" priority />
          </Link>
          <h1 className="text-4xl font-bold text-neutral-text mb-3">
            Set new password
          </h1>
          <p className="text-sm text-neutral-muted">
            Choose a strong password for your account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-neutral-border p-8">
          {checkingSession ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-electric-sapphire" />
              <span className="text-neutral-muted text-sm">
                Verifying reset link...
              </span>
            </div>
          ) : !hasSession ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Invalid or expired reset link
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    This password reset link is missing a valid session. Request
                    a new one from the login page — links expire and can only be
                    used once.
                  </p>
                </div>
              </div>
              <Link
                href="/login"
                className={cn(
                  "w-full h-12 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold",
                  "hover:from-bright-indigo hover:to-vivid-royal",
                  "transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-button"
                )}
              >
                Back to login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide"
                >
                  New password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-muted" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className={cn(
                      "w-full pl-12 pr-4 h-12 rounded-xl border-2 border-neutral-border",
                      "bg-white text-neutral-text text-sm font-medium",
                      "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                      "transition-all"
                    )}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-muted" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className={cn(
                      "w-full pl-12 pr-4 h-12 rounded-xl border-2 border-neutral-border",
                      "bg-white text-neutral-text text-sm font-medium",
                      "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                      "transition-all"
                    )}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
                  <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-12 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold",
                  "hover:from-bright-indigo hover:to-vivid-royal disabled:opacity-30 disabled:cursor-not-allowed",
                  "transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-button"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  <>
                    Update password
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="text-xs text-electric-sapphire hover:text-bright-indigo font-semibold"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
