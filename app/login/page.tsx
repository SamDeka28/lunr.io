"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Link2, Loader2, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Link from "next/link";
import { useUserStore } from "@/store/user-store";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { setUser, refreshUserData } = useUserStore();

  const redirect = searchParams.get("redirect") || "/dashboard";

  // Check for OAuth errors in URL
  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError === "oauth_error") {
      setError("Failed to authenticate with Google. Please try again.");
    }
  }, [searchParams]);

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
      let errorMessage = "Failed to sign in with Google";
      
      if (err.message) {
        errorMessage = err.message;
      }
      
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

        toast.success("Account created! Please check your email to confirm your account.");
        setEmail("");
        setPassword("");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        // Get user data and store in Zustand
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || null,
          });
          // Fetch and store plan data
          await refreshUserData();
        }

        toast.success("Welcome back!");
        router.push(redirect);
        router.refresh();
      }
    } catch (err: any) {
      // More detailed error handling
      let errorMessage = "An error occurred";
      
      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      
      // Log full error for debugging
      console.error("Signup/Signin error:", err);
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-neutral-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-electric-sapphire/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-bright-indigo/10 rounded-full blur-3xl animate-float-reverse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-vivid-royal/5 rounded-full blur-3xl animate-drift"></div>
      </div>
      
      {/* Curved decorative lines - Centered */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none" viewBox="0 0 1920 1080">
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
        <path
          d="M0,648 Q960,540 1920,648 T3840,648"
          stroke="rgba(139, 92, 246, 0.15)"
          strokeWidth="2"
          fill="none"
          className="animate-wave delay-2000"
        />
      </svg>
      
      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-electric-sapphire/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
              opacity: 0.6 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>
      
      {/* Orbiting elements */}
      <div className="absolute top-1/4 right-20 w-32 h-32 border-2 border-electric-sapphire/10 rounded-full animate-orbit"></div>
      <div className="absolute bottom-1/4 left-20 w-24 h-24 border-2 border-bright-indigo/10 rounded-full animate-orbit" style={{ animationDirection: 'reverse', animationDuration: '20s' }}></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-sapphire via-bright-indigo to-vivid-royal flex items-center justify-center shadow-button">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-neutral-text">lunr.to</div>
              <div className="text-xs text-neutral-muted">Premium</div>
            </div>
          </Link>
          <h1 className="text-4xl font-bold text-neutral-text mb-3">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-neutral-muted">
            {isSignUp
              ? "Get started with 2 free links and 2 QR codes"
              : "Sign in to access your dashboard"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-border p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-muted" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn(
                    "w-full pl-12 pr-4 h-12 rounded-xl border-2 border-neutral-border",
                    "bg-white text-neutral-text text-sm font-medium",
                    "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                    "transition-all"
                  )}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide"
              >
                Password
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
                  className={cn(
                    "w-full pl-12 pr-4 h-12 rounded-xl border-2 border-neutral-border",
                    "bg-white text-neutral-text text-sm font-medium",
                    "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                    "transition-all"
                  )}
                  placeholder="••••••••"
                />
              </div>
              {!isSignUp && (
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    className="text-xs text-electric-sapphire hover:text-bright-indigo font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
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

          {/* Toggle Sign Up/Sign In */}
          <div className="mt-6 pt-6 border-t border-neutral-border">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="w-full text-center text-sm text-neutral-muted hover:text-electric-sapphire font-medium transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-neutral-border" />
            <span className="text-xs text-neutral-muted font-medium">OR</span>
            <div className="flex-1 h-px bg-neutral-border" />
          </div>

          {/* Social Login */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 rounded-xl border-2 border-neutral-border text-neutral-text text-sm font-semibold hover:bg-neutral-bg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-muted">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-electric-sapphire hover:text-bright-indigo font-semibold">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-electric-sapphire hover:text-bright-indigo font-semibold">
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
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-neutral-bg flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-electric-sapphire" />
          <span className="text-neutral-muted">Loading...</span>
        </div>
      </main>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
