"use client";

import { useState } from "react";
import { Link2, Copy, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface LinkFormProps {
  onSubmit: (url: string, customCode?: string) => Promise<void>;
}

export function LinkForm({ onSubmit }: LinkFormProps) {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit(url, customCode || undefined);
      setUrl("");
      setCustomCode("");
    } catch (err: any) {
      setError(err.message || "Failed to create link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
      <div className="space-y-2">
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Enter your long URL
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Link2 className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very/long/url"
            required
            className={cn(
              "w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all",
              "bg-white dark:bg-gray-800",
              "border-gray-200 dark:border-gray-700",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
              "text-gray-900 dark:text-white",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500"
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="customCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Custom short code (optional)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">lunr.to/</span>
          </div>
          <input
            id="customCode"
            type="text"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="my-custom-link"
            pattern="[a-zA-Z0-9_-]+"
            className={cn(
              "w-full pl-32 pr-4 py-4 rounded-xl border-2 transition-all",
              "bg-white dark:bg-gray-800",
              "border-gray-200 dark:border-gray-700",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
              "text-gray-900 dark:text-white",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500"
            )}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Only letters, numbers, hyphens, and underscores allowed
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !url}
        className={cn(
          "w-full py-4 px-6 rounded-xl font-semibold text-white",
          "bg-gradient-to-r from-primary to-secondary",
          "hover:from-primary-dark hover:to-secondary-dark",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all transform hover:scale-[1.02] active:scale-[0.98]",
          "shadow-lg hover:shadow-xl",
          "flex items-center justify-center gap-2"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Link2 className="h-5 w-5" />
            Shorten Link
          </>
        )}
      </button>
    </form>
  );
}

