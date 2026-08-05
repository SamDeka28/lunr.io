"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Link from "next/link";
import { useUserStore } from "@/store/user-store";
import { BrandLogo } from "@/components/brand-logo";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { setUser, refreshUserData } = useUserStore();

  const redirect = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    const authError = searchParams.get("error");
    if (authError === "oauth_error") {
      setError("Failed to authenticate with Google. Please try again.");
    } else if (authError === "email_unconfirmed") {
      setError(
        "Please confirm your email before accessing the dashboard. Check your inbox for a verification link."
      );
    }
  }, [searchParams]);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address first");
      return;
    }

    setResetLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password/confirm`,
        }
      );

      if (resetError) throw resetError;

      toast.success("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send password reset email");
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        },
      });

      if (oauthError) throw oauthError;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to sign in with Google";
      console.error("Google OAuth error:", err);
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (signUpError) throw signUpError;

        toast.success(
          "Account created! Please check your email to confirm your account."
        );
        setEmail("");
        setPassword("");
      } else {
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) throw signInError;

        const authUser = signInData.user;
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || null,
          });
          void refreshUserData();
        }

        toast.success("Welcome back!");
        const next =
          redirect.startsWith("/") && !redirect.startsWith("//")
            ? redirect
            : "/dashboard";
        window.location.assign(next);
        return;
      }
    } catch (err: any) {
      const errorMessage =
        err?.message || (typeof err === "string" ? err : "An error occurred");
      console.error("Signup/Signin error:", err);
      setError(errorMessage);
      toast.error(errorMessage);
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
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <BrandLogo href={null} variant="full" size="lg" priority />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-text tracking-tight mb-3">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-neutral-muted">
            {isSignUp
              ? "Get started with 2 free links and 2 QR codes"
              : "Sign in to access your dashboard"}
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-card shadow-soft border border-neutral-border/80 p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-neutral-muted mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-neutral-muted" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn(
                    "w-full pl-11 pr-4 h-12 rounded-xl border border-neutral-border/80",
                    "bg-white text-neutral-text text-sm font-medium shadow-soft",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    "transition-colors"
                  )}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-neutral-muted mb-2"
              >
                Password
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
                  className={cn(
                    "w-full pl-11 pr-4 h-12 rounded-xl border border-neutral-border/80",
                    "bg-white text-neutral-text text-sm font-medium shadow-soft",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    "transition-colors"
                  )}
                  placeholder="••••••••"
                />
              </div>
              {!isSignUp && (
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading || resetLoading}
                    className="text-xs text-primary hover:text-bright-indigo font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? "Sending..." : "Forgot password?"}
                  </button>
                </div>
              )}
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
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                <>
                  {isSignUp ? "Create account" : "Sign in"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-border/70">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="w-full text-center text-sm text-neutral-muted hover:text-primary font-medium transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-neutral-border/80" />
            <span className="text-xs text-neutral-muted font-medium">OR</span>
            <div className="flex-1 h-px bg-neutral-border/80" />
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 rounded-full border border-neutral-border/80 bg-white text-neutral-text text-sm font-semibold shadow-soft hover:border-primary/30 hover:text-primary transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-muted">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="text-primary hover:text-bright-indigo font-semibold"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-primary hover:text-bright-indigo font-semibold"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main
          className="min-h-screen flex items-center justify-center"
          style={{ background: "#F3F5FA" }}
        >
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-soft border border-neutral-border/70">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-neutral-muted font-medium">Loading…</span>
          </div>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
