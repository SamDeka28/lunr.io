"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, TrendingUp, Globe, Clock, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { supabase } from "@/lib/supabase/client";
import type { Link, LinkStats } from "@/types/database.types";

export default function LinkDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [link, setLink] = useState<Link | null>(null);
  const [stats, setStats] = useState<LinkStats | null>(null);
  const [loading, setLoading] = useState(true);

  const linkId = params.id as string;

  useEffect(() => {
    if (!linkId) return;

    // Fetch link details
    const fetchLink = async () => {
      try {
        const response = await fetch(`/api/links/${linkId}`);
        if (response.ok) {
          const data = await response.json();
          setLink(data);
        }
      } catch (error) {
        console.error("Failed to fetch link:", error);
      }
    };

    // Fetch stats
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/links/${linkId}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
    fetchStats();

    // Subscribe to real-time updates for click count
    const channel = supabase
      .channel(`link-stats:${linkId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "links",
          filter: `id=eq.${linkId}`,
        },
        (payload) => {
          const updatedLink = payload.new as Link;
          setLink(updatedLink);
          // Refresh stats when click count changes
          fetch(`/api/links/${linkId}/stats`)
            .then((res) => res.json())
            .then((data) => setStats(data))
            .catch(console.error);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "analytics",
          filter: `link_id=eq.${linkId}`,
        },
        () => {
          // Refresh stats when new analytics are added
          fetch(`/api/links/${linkId}/stats`)
            .then((res) => res.json())
            .then((data) => setStats(data))
            .catch(console.error);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [linkId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    );
  }

  if (!link) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Link not found</div>
        </div>
      </main>
    );
  }

  const shortUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${link.short_code}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Link Analytics</h1>
        </div>

        {/* Link Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Short URL</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-lg text-gray-900 dark:text-white">{shortUrl}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Original URL</label>
              <div className="flex items-center gap-2 mt-1">
                <ExternalLink className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white truncate">{link.original_url}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Clicks</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {link.click_count}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Unique Clicks</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.unique_clicks || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Created</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(link.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                <div className="text-lg font-semibold">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-sm",
                      link.is_active
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    )}
                  >
                    {link.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Referrers */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Top Referrers</h2>
              </div>
              {stats.top_referrers.length > 0 ? (
                <div className="space-y-2">
                  {stats.top_referrers.map((ref, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400 truncate">{ref.referrer}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{ref.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No referrer data yet</p>
              )}
            </div>

            {/* Clicks by Country */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-secondary" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Clicks by Country</h2>
              </div>
              {stats.clicks_by_country.length > 0 ? (
                <div className="space-y-2">
                  {stats.clicks_by_country.map((country, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{country.country}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{country.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No country data yet</p>
              )}
            </div>

            {/* Clicks Over Time */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Clicks Over Time</h2>
              </div>
              {stats.clicks_by_date.length > 0 ? (
                <div className="space-y-2">
                  {stats.clicks_by_date.map((date, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-24">
                        {new Date(date.date).toLocaleDateString()}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
                          style={{
                            width: `${
                              (date.count / Math.max(...stats.clicks_by_date.map((d) => d.count))) * 100
                            }%`,
                          }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-900 dark:text-white">
                          {date.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No click data yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

