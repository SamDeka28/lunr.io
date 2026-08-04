"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

function PasswordPromptForm() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const shortCode = params?.shortCode as string;
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "invalid") {
      setError("Incorrect password. Please try again.");
      setLoading(false);
      setPassword("");
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("error");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/links/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ short_code: shortCode, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Incorrect password. Please try again.");
        setLoading(false);
        setPassword("");
        return;
      }

      // Cookie is set by the API; navigate to the short link to complete redirect
      router.replace(`/${shortCode}`);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-electric-sapphire" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-text mb-2">
            Password Protected Link
          </h1>
          <p className="text-sm text-neutral-muted">
            This link is protected. Please enter the password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-neutral-text mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border-2 border-neutral-border bg-white text-neutral-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire transition-all"
              placeholder="Enter password"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Continue</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PasswordPromptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-electric-sapphire" />
          </div>
        </div>
      </div>
    }>
      <PasswordPromptForm />
    </Suspense>
  );
}
