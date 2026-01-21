"use client";

import { useMemo } from "react";
import { BarChart3, TrendingUp, Globe, MapPin, Target, Tag, Filter } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function AnalyticsCharts({
  clicksByDate,
  topReferrers,
  clicksByCountry,
  utmSources,
  utmMediums,
  utmCampaigns,
}: {
  clicksByDate: Array<{ date: string; count: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  clicksByCountry: Array<{ country: string; count: number }>;
  utmSources?: Array<{ source: string; count: number }>;
  utmMediums?: Array<{ medium: string; count: number }>;
  utmCampaigns?: Array<{ campaign: string; count: number }>;
}) {
  // Memoize formatted data to avoid recalculating on every render
  const formattedClicksByDate = useMemo(() => {
    return clicksByDate.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));
  }, [clicksByDate]);

  // Memoize formatted referrers
  const formattedReferrers = useMemo(() => {
    return topReferrers.map((item) => ({
      ...item,
      referrer: item.referrer.length > 30 ? item.referrer.substring(0, 30) + "..." : item.referrer,
    }));
  }, [topReferrers]);

  // Chart data
  const clicksOverTimeData = {
    labels: formattedClicksByDate.map((item) => item.date),
    datasets: [
      {
        label: "Clicks",
        data: formattedClicksByDate.map((item) => item.count),
        borderColor: "rgb(67, 97, 238)",
        backgroundColor: "rgba(67, 97, 238, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(67, 97, 238)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const clicksOverTimeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "600" as const,
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "#6B7280",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          stepSize: 1,
          precision: 0,
          font: {
            size: 12,
          },
          color: "#6B7280",
          callback: function(value: any) {
            if (Number.isInteger(value)) {
              return value;
            }
            return '';
          },
        },
        border: {
          display: false,
        },
      },
    },
  };

  const referrersData = {
    labels: formattedReferrers.map((item) => item.referrer),
    datasets: [
      {
        label: "Clicks",
        data: formattedReferrers.map((item) => item.count),
        backgroundColor: [
          "rgba(67, 97, 238, 0.8)",
          "rgba(247, 37, 133, 0.8)",
          "rgba(114, 9, 183, 0.8)",
          "rgba(76, 201, 240, 0.8)",
          "rgba(181, 23, 158, 0.8)",
          "rgba(72, 12, 168, 0.8)",
          "rgba(58, 12, 163, 0.8)",
          "rgba(63, 55, 201, 0.8)",
        ],
        borderColor: [
          "rgb(67, 97, 238)",
          "rgb(247, 37, 133)",
          "rgb(114, 9, 183)",
          "rgb(76, 201, 240)",
          "rgb(181, 23, 158)",
          "rgb(72, 12, 168)",
          "rgb(58, 12, 163)",
          "rgb(63, 55, 201)",
        ],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const referrersOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "600" as const,
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "#6B7280",
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "#6B7280",
        },
      },
    },
  };

  const countriesData = {
    labels: clicksByCountry.map((item) => item.country),
    datasets: [
      {
        label: "Clicks",
        data: clicksByCountry.map((item) => item.count),
        backgroundColor: [
          "rgba(67, 97, 238, 0.8)",
          "rgba(247, 37, 133, 0.8)",
          "rgba(114, 9, 183, 0.8)",
          "rgba(76, 201, 240, 0.8)",
          "rgba(181, 23, 158, 0.8)",
          "rgba(72, 12, 168, 0.8)",
          "rgba(58, 12, 163, 0.8)",
          "rgba(63, 55, 201, 0.8)",
        ],
        borderColor: [
          "rgb(67, 97, 238)",
          "rgb(247, 37, 133)",
          "rgb(114, 9, 183)",
          "rgb(76, 201, 240)",
          "rgb(181, 23, 158)",
          "rgb(72, 12, 168)",
          "rgb(58, 12, 163)",
          "rgb(63, 55, 201)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const countriesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#111827",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "600" as const,
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Clicks Over Time */}
      {clicksByDate.length > 0 && (
        <div className="bg-white rounded-card border border-neutral-border p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-electric-sapphire" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-text">Clicks Over Time</h3>
              <p className="text-xs text-neutral-muted">Last 30 days</p>
            </div>
          </div>
          <div className="h-80">
            <Line data={clicksOverTimeData} options={clicksOverTimeOptions} />
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Referrers */}
        {topReferrers.length > 0 && (
          <div className="bg-white rounded-card border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-neon-pink" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-text">Top Referrers</h3>
                <p className="text-xs text-neutral-muted">Traffic sources</p>
              </div>
            </div>
            <div className="h-64">
              <Bar data={referrersData} options={referrersOptions} />
            </div>
          </div>
        )}

        {/* Clicks by Country */}
        {clicksByCountry.length > 0 && (
          <div className="bg-white rounded-card border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-energy/10 to-sky-aqua/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-energy" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-text">Clicks by Country</h3>
                <p className="text-xs text-neutral-muted">Geographic distribution</p>
              </div>
            </div>
            <div className="h-64">
              <Doughnut data={countriesData} options={countriesOptions} />
            </div>
          </div>
        )}
      </div>

      {/* UTM Tracking Section - Only show if there's UTM data */}
      {(utmSources && utmSources.length > 0) || (utmMediums && utmMediums.length > 0) || (utmCampaigns && utmCampaigns.length > 0) ? (
        <div className="bg-white rounded-card border border-neutral-border p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vivid-royal/10 to-indigo-bloom/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-vivid-royal" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-text">UTM Tracking</h3>
              <p className="text-xs text-neutral-muted">Campaign performance across all links</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* UTM Sources */}
            {utmSources && utmSources.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-4 w-4 text-neutral-muted" />
                  <h4 className="text-sm font-semibold text-neutral-text">UTM Source</h4>
                </div>
                <div className="h-48">
                  <Doughnut
                    data={{
                      labels: utmSources.slice(0, 5).map((item) => item.source),
                      datasets: [
                        {
                          data: utmSources.slice(0, 5).map((item) => item.count),
                          backgroundColor: [
                            "rgba(58, 12, 163, 0.8)",
                            "rgba(72, 12, 168, 0.8)",
                            "rgba(86, 11, 173, 0.8)",
                            "rgba(114, 9, 183, 0.8)",
                            "rgba(181, 23, 158, 0.8)",
                          ],
                          borderColor: [
                            "rgb(58, 12, 163)",
                            "rgb(72, 12, 168)",
                            "rgb(86, 11, 173)",
                            "rgb(114, 9, 183)",
                            "rgb(181, 23, 158)",
                          ],
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: "60%",
                      plugins: {
                        legend: {
                          position: "bottom" as const,
                          labels: {
                            padding: 10,
                            font: { size: 11 },
                            usePointStyle: true,
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context: any) {
                              const label = context.label || "";
                              const value = context.parsed || 0;
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${label}: ${value} (${percentage}%)`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* UTM Mediums */}
            {utmMediums && utmMediums.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4 text-neutral-muted" />
                  <h4 className="text-sm font-semibold text-neutral-text">UTM Medium</h4>
                </div>
                <div className="h-48">
                  <Doughnut
                    data={{
                      labels: utmMediums.slice(0, 5).map((item) => item.medium),
                      datasets: [
                        {
                          data: utmMediums.slice(0, 5).map((item) => item.count),
                          backgroundColor: [
                            "rgba(63, 55, 201, 0.8)",
                            "rgba(67, 97, 238, 0.8)",
                            "rgba(72, 149, 239, 0.8)",
                            "rgba(76, 201, 240, 0.8)",
                            "rgba(247, 37, 133, 0.8)",
                          ],
                          borderColor: [
                            "rgb(63, 55, 201)",
                            "rgb(67, 97, 238)",
                            "rgb(72, 149, 239)",
                            "rgb(76, 201, 240)",
                            "rgb(247, 37, 133)",
                          ],
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: "60%",
                      plugins: {
                        legend: {
                          position: "bottom" as const,
                          labels: {
                            padding: 10,
                            font: { size: 11 },
                            usePointStyle: true,
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context: any) {
                              const label = context.label || "";
                              const value = context.parsed || 0;
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${label}: ${value} (${percentage}%)`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* UTM Campaigns */}
            {utmCampaigns && utmCampaigns.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-4 w-4 text-neutral-muted" />
                  <h4 className="text-sm font-semibold text-neutral-text">UTM Campaign</h4>
                </div>
                <div className="h-48">
                  <Bar
                    data={{
                      labels: utmCampaigns.slice(0, 5).map((item) => item.campaign.length > 15 ? item.campaign.substring(0, 15) + "..." : item.campaign),
                      datasets: [
                        {
                          label: "Clicks",
                          data: utmCampaigns.slice(0, 5).map((item) => item.count),
                          backgroundColor: "rgba(67, 97, 238, 0.8)",
                          borderColor: "rgb(67, 97, 238)",
                          borderWidth: 1,
                          borderRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: "y" as const,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          padding: 12,
                          cornerRadius: 8,
                        },
                      },
                      scales: {
                        x: {
                          beginAtZero: true,
                          grid: {
                            color: "rgba(0, 0, 0, 0.05)",
                          },
                          ticks: {
                            font: { size: 11 },
                            color: "#6B7280",
                            stepSize: 1,
                            precision: 0,
                            callback: function(value: any) {
                              if (Number.isInteger(value)) {
                                return value;
                              }
                              return '';
                            },
                          },
                        },
                        y: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            font: { size: 11 },
                            color: "#6B7280",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Empty State */}
      {clicksByDate.length === 0 && topReferrers.length === 0 && clicksByCountry.length === 0 && (
        <div className="bg-white rounded-card border border-neutral-border p-12 text-center shadow-soft">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="h-10 w-10 text-electric-sapphire/60" />
          </div>
          <h3 className="text-xl font-bold text-neutral-text mb-2">
            No analytics data yet
          </h3>
          <p className="text-sm text-neutral-muted">
            Start sharing your links to see analytics here
          </p>
        </div>
      )}
    </div>
  );
}
