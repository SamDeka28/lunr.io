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

      toast.success("Password updated successfully");
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
    <main
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 80% at 10% 0%, rgba(67,97,238,0.08), transparent 45%), radial-gradient(90% 60% at 100% 100%, rgba(67,97,238,0.05), transparent 40%), #F3F5FA",
      }}
    >
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center mb-6"
          >
            <BrandLogo href={null} variant="full" size="lg" priority />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-text tracking-tight mb-3">
            Set new password
          </h1>
          <p className="text-sm text-neutral-muted">
            Choose a strong password for your account
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-card shadow-soft border border-neutral-border/80 p-5 sm:p-8">
          {checkingSession ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-neutral-muted text-sm">
                Verifying reset link...
              </span>
            </div>
          ) : !hasSession ? (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex gap-3 shadow-soft">
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
                  "w-full h-12 rounded-full bg-primary text-white text-sm font-semibold shadow-button",
                  "hover:bg-bright-indigo transition-all active:scale-[0.98]",
                  "flex items-center justify-center gap-2"
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
                  className="block text-xs font-semibold text-neutral-muted mb-2"
                >
                  New password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-neutral-muted" />
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
                      "w-full pl-11 pr-4 h-12 rounded-xl border border-neutral-border/80",
                      "bg-white text-neutral-text text-sm font-medium shadow-soft",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                      "transition-colors"
                    )}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-neutral-muted mb-2"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-neutral-muted" />
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
                      "w-full pl-11 pr-4 h-12 rounded-xl border border-neutral-border/80",
                      "bg-white text-neutral-text text-sm font-medium shadow-soft",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                      "transition-colors"
                    )}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 shadow-soft">
                  <p className="text-sm font-medium text-rose-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-12 rounded-full bg-primary text-white text-sm font-semibold shadow-button",
                  "hover:bg-bright-indigo disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none",
                  "transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
            className="text-xs text-primary hover:text-bright-indigo font-semibold"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
