"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Copy,
  DollarSign,
  Download,
  Link2,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoTooltip, LabelWithTip } from "@/components/ui/info-tooltip";
import { formatCampaignMoney, normalizeCurrency } from "@/lib/utils/currency";
import type { CampaignWithStats, CampaignCreator, CampaignSpendEntry } from "@/types/database.types";

type Tab =
  | "overview"
  | "creators"
  | "links"
  | "analytics"
  | "spend"
  | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "creators", label: "Creators" },
  { id: "links", label: "Links" },
  { id: "analytics", label: "Analytics" },
  { id: "spend", label: "Spend" },
  { id: "settings", label: "Settings" },
];

const PLATFORMS = [
  "instagram",
  "tiktok",
  "youtube",
  "twitter",
  "linkedin",
  "other",
] as const;

const CREATOR_STATUSES = [
  "invited",
  "accepted",
  "content_submitted",
  "posted",
  "paid",
  "dropped",
] as const;

const CREATOR_CSV_HEADERS =
  "display_name,handle,platform,fee_amount,destination_url";

const CREATOR_CSV_TEMPLATE = `${CREATOR_CSV_HEADERS}
Alex Creator,alex,instagram,500,https://example.com/landing
Jordan Lee,jordanlee,tiktok,750,https://example.com/landing
Sam Rivera,samr,youtube,,https://example.com/landing
`;

const SETUP_GUIDE_HREF = "/docs/campaigns/influencer-setup";

function downloadCreatorCsvTemplate() {
  const blob = new Blob([CREATOR_CSV_TEMPLATE], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "creator-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function getCampaignStatusLabel(campaign: {
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
}): "active" | "scheduled" | "ended" | "archived" {
  if (campaign.is_active === false) return "archived";
  const now = Date.now();
  if (campaign.start_date) {
    const start = new Date(campaign.start_date).getTime();
    if (!Number.isNaN(start) && now < start) return "scheduled";
  }
  if (campaign.end_date) {
    const end = new Date(campaign.end_date).getTime();
    if (!Number.isNaN(end) && now > end) return "ended";
  }
  return "active";
}

export function CampaignWorkspace({
  campaign: initialCampaign,
  initialTab,
}: {
  campaign: CampaignWithStats;
  initialTab: string;
  userId: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(
    TABS.some((t) => t.id === initialTab) ? (initialTab as Tab) : "overview"
  );
  const [campaign] = useState(initialCampaign);
  const [creators, setCreators] = useState<CampaignCreator[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [spend, setSpend] = useState<{ entries: CampaignSpendEntry[]; total: number }>({
    entries: [],
    total: 0,
  });
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<{ from: string; to: string }>(() => {
    const to = new Date();
    const from = new Date(to.getTime() - 29 * 86400000);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  });

  const status = getCampaignStatusLabel(campaign);
  const isInfluencer = campaign.campaign_type === "influencer";
  const currency = normalizeCurrency(campaign.currency);

  const loadCreators = useCallback(async () => {
    const res = await fetch(`/api/campaigns/${campaign.id}/creators`);
    if (res.ok) setCreators(await res.json());
  }, [campaign.id]);

  const loadLinks = useCallback(async () => {
    const res = await fetch(`/api/campaigns/${campaign.id}/links`);
    if (res.ok) setLinks(await res.json());
  }, [campaign.id]);

  const loadSpend = useCallback(async () => {
    const res = await fetch(`/api/campaigns/${campaign.id}/spend`);
    if (res.ok) setSpend(await res.json());
  }, [campaign.id]);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/campaigns/${campaign.id}/analytics?from=${range.from}&to=${range.to}`
      );
      if (res.ok) setAnalytics(await res.json());
      else toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [campaign.id, range.from, range.to]);

  useEffect(() => {
    if (tab === "creators" || tab === "overview") void loadCreators();
    if (tab === "links" || tab === "overview") void loadLinks();
    if (tab === "spend" || tab === "overview") void loadSpend();
    if (tab === "analytics" || tab === "overview") void loadAnalytics();
  }, [tab, loadCreators, loadLinks, loadSpend, loadAnalytics]);

  const setTabAndUrl = (next: Tab) => {
    setTab(next);
    router.replace(`/dashboard/campaigns/${campaign.id}?tab=${next}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/campaigns"
          className="p-2 rounded-xl hover:bg-neutral-bg text-neutral-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <PageHeader
          title={campaign.name}
          description={campaign.description || "Campaign workspace"}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusChip status={status} />
        {campaign.campaign_type && (
          <span className="text-xs font-medium text-neutral-muted px-2.5 py-1 rounded-full bg-white border border-neutral-border/80">
            {campaign.campaign_type.replace(/_/g, " ")}
          </span>
        )}
        <span className="text-xs font-medium text-neutral-muted px-2.5 py-1 rounded-full bg-white border border-neutral-border/80">
          {currency}
        </span>
        <div className="flex items-center gap-3 ml-auto">
          <Link
            href={SETUP_GUIDE_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-muted hover:text-primary"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Setup guide
          </Link>
          <Link
            href={`/dashboard/campaigns/${campaign.id}/edit`}
            className="text-xs font-semibold text-primary hover:text-bright-indigo"
          >
            Edit details
          </Link>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto p-1 bg-white/80 border border-neutral-border/80 rounded-full shadow-soft">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTabAndUrl(t.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors",
              tab === t.id
                ? "bg-primary text-white shadow-button"
                : "text-neutral-muted hover:text-neutral-text"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <OverviewTab
          campaign={campaign}
          creators={creators}
          links={links}
          spendTotal={spend.total}
          analytics={analytics}
          isInfluencer={isInfluencer}
          currency={currency}
          onGo={setTabAndUrl}
        />
      )}
      {tab === "creators" && (
        <CreatorsTab
          campaignId={campaign.id}
          creators={creators}
          defaultDestination={campaign.default_destination_url || ""}
          currency={currency}
          onRefresh={loadCreators}
          isInfluencer={isInfluencer}
        />
      )}
      {tab === "links" && (
        <LinksTab campaignId={campaign.id} links={links} onRefresh={loadLinks} />
      )}
      {tab === "analytics" && (
        <AnalyticsTab
          analytics={analytics}
          loading={loading}
          range={range}
          setRange={setRange}
          onRefresh={loadAnalytics}
          campaignId={campaign.id}
          currency={currency}
        />
      )}
      {tab === "spend" && (
        <SpendTab
          campaignId={campaign.id}
          spend={spend}
          creators={creators}
          plannedBudget={Number(campaign.budget) || 0}
          currency={currency}
          onRefresh={loadSpend}
        />
      )}
      {tab === "settings" && (
        <SettingsHint campaignId={campaign.id} />
      )}
    </div>
  );
}

function StatusChip({
  status,
}: {
  status: "active" | "scheduled" | "ended" | "archived";
}) {
  const styles = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    scheduled: "bg-sky-50 text-sky-700 border-sky-100",
    ended: "bg-amber-50 text-amber-700 border-amber-100",
    archived: "bg-neutral-bg text-neutral-muted border-neutral-border",
  };
  return (
    <span
      className={cn(
        "text-xs font-semibold px-2.5 py-1 rounded-full border capitalize",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}

function OverviewTab({
  campaign,
  creators,
  links,
  spendTotal,
  analytics,
  isInfluencer,
  currency,
  onGo,
}: any) {
  const totals = analytics?.totals;
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Links" value={links.length} />
        <Stat label="Creators" value={creators.length} />
        <Stat label="Clicks (range)" value={totals?.clicks ?? "—"} />
        <Stat
          label="Spend"
          value={
            spendTotal > 0
              ? formatCampaignMoney(spendTotal, currency)
              : `Plan ${formatCampaignMoney(campaign.budget || 0, currency)}`
          }
        />
      </div>
      {isInfluencer && creators.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="Add your first creator"
          description="Generate unique tracking links per influencer and measure who drives clicks and conversions. See the setup guide if you’re new to campaign ops."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onGo("creators")}
                className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold shadow-button"
              >
                Add creators
              </button>
              <Link
                href={SETUP_GUIDE_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-neutral-border text-sm font-semibold hover:border-primary/40"
              >
                <BookOpen className="h-4 w-4" />
                Setup guide
              </Link>
            </div>
          }
        />
      ) : !isInfluencer && links.length === 0 ? (
        <EmptyState
          icon={<Link2 className="h-8 w-8" />}
          title="Add links to this campaign"
          description="Assign existing links or create new ones with campaign UTM defaults."
          action={
            <button
              type="button"
              onClick={() => onGo("links")}
              className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold shadow-button"
            >
              Manage links
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-card border border-neutral-border/80 shadow-soft p-5">
          <h3 className="font-semibold text-neutral-text mb-3">Top creators</h3>
          {(analytics?.creatorLeaderboard || []).slice(0, 5).length === 0 ? (
            <p className="text-sm text-neutral-muted">No creator clicks in this range yet.</p>
          ) : (
            <ul className="space-y-2">
              {(analytics?.creatorLeaderboard || []).slice(0, 5).map((c: any) => (
                <li key={c.id} className="flex justify-between text-sm">
                  <span className="font-medium text-neutral-text">
                    {c.display_name}
                    <span className="text-neutral-muted"> · {c.platform}</span>
                  </span>
                  <span className="text-neutral-muted">{c.clicks} clicks</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <p className="text-xs text-neutral-muted">
        Planned budget is a planning estimate. CPC uses real spend when logged.
      </p>
    </div>
  );
}

function Stat({
  label,
  tip,
  value,
}: {
  label: string;
  tip?: string;
  value: string | number;
}) {
  return (
    <div className="bg-white rounded-card border border-neutral-border/80 shadow-soft p-4">
      <p className="text-xs font-medium text-neutral-muted mb-1 inline-flex items-center gap-1">
        {label}
        {tip && <InfoTooltip text={tip} label={`About ${label}`} />}
      </p>
      <p className="text-2xl font-semibold text-neutral-text tracking-tight">{value}</p>
    </div>
  );
}

function CreatorsTab({
  campaignId,
  creators,
  defaultDestination,
  currency,
  onRefresh,
  isInfluencer,
}: {
  campaignId: string;
  creators: CampaignCreator[];
  defaultDestination: string;
  currency: string;
  onRefresh: () => void;
  isInfluencer: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    handle: "",
    platform: "instagram",
    fee_amount: "",
    destination_url: defaultDestination,
    deliverable_notes: "",
  });
  const [csvText, setCsvText] = useState("");

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      destination_url: prev.destination_url || defaultDestination,
    }));
  }, [defaultDestination]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const hasCampaignDefault = Boolean(defaultDestination?.trim());

  const submit = async () => {
    const destination = form.destination_url.trim() || defaultDestination.trim();
    if (!destination) {
      toast.error(
        "Destination URL is required — enter a landing page here, or set Default destination URL in Settings."
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/creators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: form.display_name,
          handle: form.handle,
          platform: form.platform,
          fee_amount: form.fee_amount ? Number(form.fee_amount) : null,
          fee_currency: currency,
          destination_url: destination,
          deliverable_notes: form.deliverable_notes || null,
          generate_link: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Creator added");
      setOpen(false);
      setForm({
        display_name: "",
        handle: "",
        platform: "instagram",
        fee_amount: "",
        destination_url: defaultDestination,
        deliverable_notes: "",
      });
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to add creator");
    } finally {
      setSaving(false);
    }
  };

  const importCsv = async () => {
    const rows = csvText
      .trim()
      .split("\n")
      .map((line) => line.split(",").map((c) => c.trim()))
      .filter((cols) => cols[0] && cols[0].toLowerCase() !== "display_name");

    const creatorsPayload = rows.map((cols) => ({
      display_name: cols[0],
      handle: cols[1] || undefined,
      platform: cols[2] || "other",
      fee_amount: cols[3] ? Number(cols[3]) : undefined,
      destination_url: cols[4] || undefined,
    }));

    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/creators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creators: creatorsPayload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      toast.success(`Imported ${data.created} creators`);
      if (data.errors?.length) toast.message(`${data.errors.length} rows failed`);
      setCsvText("");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/campaigns/${campaignId}/creators/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, create_spend_on_paid: true }),
    });
    if (res.ok) {
      toast.success("Status updated");
      onRefresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "Update failed");
    }
  };

  const copyLink = async (shortCode?: string | null) => {
    if (!shortCode) return;
    await navigator.clipboard.writeText(`${origin}/${shortCode}`);
    toast.success("Link copied");
  };

  return (
    <div className="space-y-4">
      {!isInfluencer && (
        <p className="text-sm text-neutral-muted">
          Creators are optional for this campaign type. Use them for partners or placements, or manage Links only.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold shadow-button"
        >
          <Plus className="h-4 w-4" /> Add creator
        </button>
      </div>

      {open && (
        <div className="bg-white rounded-card border border-neutral-border/80 shadow-soft p-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Display name" value={form.display_name} onChange={(v) => setForm({ ...form, display_name: v })} />
            <Field
              label="Handle"
              tip="Their social username (without or with @). Used in UTM content so you can tell creators apart in analytics."
              value={form.handle}
              onChange={(v) => setForm({ ...form, handle: v })}
              placeholder="@handle"
            />
            <div>
              <LabelWithTip
                tip="Social network this creator posts on. Becomes the default utm_source on their tracking link."
                className="mb-1.5 text-xs font-semibold text-neutral-muted"
              >
                Platform
              </LabelWithTip>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full h-11 px-3 rounded-xl border border-neutral-border/80 bg-white text-sm"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <Field
              label={`Fee (${currency})`}
              tip={`What you pay this creator in ${currency}. Marking them Paid can auto-log this amount under Spend.`}
              value={form.fee_amount}
              onChange={(v) => setForm({ ...form, fee_amount: v })}
              placeholder="500"
            />
            <div className="sm:col-span-2">
              <Field
                label="Destination URL"
                tip="The landing page this creator’s short link opens (e.g. your product page). If empty, we use the campaign’s Default destination URL from Settings."
                value={form.destination_url}
                onChange={(v) => setForm({ ...form, destination_url: v })}
                placeholder={
                  hasCampaignDefault
                    ? defaultDestination
                    : "https://yoursite.com/landing (required)"
                }
              />
              <p className="mt-1.5 text-xs text-neutral-muted">
                {hasCampaignDefault ? (
                  <>
                    Leave blank to use the campaign default:{" "}
                    <span className="font-medium text-neutral-text break-all">
                      {defaultDestination}
                    </span>
                  </>
                ) : (
                  <>
                    No campaign default set — enter a URL here, or{" "}
                    <Link
                      href={`/dashboard/campaigns/${campaignId}/edit`}
                      className="font-semibold text-primary hover:underline"
                    >
                      set Default destination URL in Settings
                    </Link>
                    .
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={saving || !form.display_name}
            onClick={submit}
            className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold disabled:opacity-40"
          >
            {saving ? "Saving…" : "Create + generate link"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-card border border-neutral-border/80 shadow-soft p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-neutral-text">Bulk CSV import</h3>
            <p className="text-xs text-neutral-muted mt-1">
              Columns: {CREATOR_CSV_HEADERS}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                downloadCreatorCsvTemplate();
                toast.success("Template downloaded");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-border text-xs font-semibold hover:border-primary/40"
            >
              <Download className="h-3.5 w-3.5" />
              Download template
            </button>
            <Link
              href={SETUP_GUIDE_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-border text-xs font-semibold hover:border-primary/40"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Setup guide
            </Link>
          </div>
        </div>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-neutral-border/80 p-3 text-sm font-mono"
          placeholder={CREATOR_CSV_TEMPLATE.trim()}
        />
        <button
          type="button"
          disabled={saving || !csvText.trim()}
          onClick={importCsv}
          className="px-4 py-2 rounded-full border border-neutral-border text-sm font-semibold hover:border-primary/40"
        >
          Import creators
        </button>
      </div>

      {creators.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title={isInfluencer ? "No creators yet" : "No creators on this campaign"}
          description="Add creators to generate unique tracking links per person."
        />
      ) : (
        <div className="bg-white rounded-card border border-neutral-border/80 shadow-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-bg/80 text-neutral-muted text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Creator</th>
                <th className="px-4 py-3 font-semibold">Platform</th>
                <th className="px-4 py-3 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    Status
                    <InfoTooltip text="Pipeline stage: invited → accepted → content submitted → posted → paid (or dropped)." />
                  </span>
                </th>
                <th className="px-4 py-3 font-semibold">Link</th>
                <th className="px-4 py-3 font-semibold">Fee</th>
              </tr>
            </thead>
            <tbody>
              {creators.map((c) => (
                <tr key={c.id} className="border-t border-neutral-border/70">
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-text">{c.display_name}</div>
                    {c.handle && <div className="text-xs text-neutral-muted">@{c.handle}</div>}
                  </td>
                  <td className="px-4 py-3 capitalize text-neutral-muted">{c.platform}</td>
                  <td className="px-4 py-3">
                    <select
                      value={c.status}
                      onChange={(e) => updateStatus(c.id, e.target.value)}
                      className="h-9 px-2 rounded-lg border border-neutral-border/80 text-xs"
                    >
                      {CREATOR_STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {c.link?.short_code ? (
                      <button
                        type="button"
                        onClick={() => copyLink(c.link?.short_code)}
                        className="inline-flex items-center gap-1 text-primary font-medium"
                      >
                        /{c.link.short_code} <Copy className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <span className="text-neutral-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-muted">
                    {c.fee_amount != null
                      ? formatCampaignMoney(c.fee_amount, c.fee_currency || currency)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  tip,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  tip?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      {tip ? (
        <LabelWithTip tip={tip} className="mb-1.5 text-xs font-semibold text-neutral-muted">
          {label}
        </LabelWithTip>
      ) : (
        <label className="block text-xs font-semibold text-neutral-muted mb-1.5">{label}</label>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-3 rounded-xl border border-neutral-border/80 bg-white text-sm"
      />
    </div>
  );
}

function LinksTab({
  campaignId,
  links,
  onRefresh,
}: {
  campaignId: string;
  links: any[];
  onRefresh: () => void;
}) {
  const [available, setAvailable] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [search, setSearch] = useState("");

  const loadAvailable = useCallback(async () => {
    setLoadingAvailable(true);
    try {
      const res = await fetch("/api/links?all=true");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.links || [];
        setAvailable(list);
      } else {
        setAvailable([]);
      }
    } catch {
      setAvailable([]);
    } finally {
      setLoadingAvailable(false);
    }
  }, []);

  useEffect(() => {
    void loadAvailable();
  }, [loadAvailable, campaignId]);

  const unassigned = available.filter((l) => !l.campaign_id);
  const assignable = unassigned.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.short_code?.toLowerCase().includes(q) ||
      l.title?.toLowerCase().includes(q) ||
      l.original_url?.toLowerCase().includes(q)
    );
  });

  const assign = async () => {
    if (!selected.length) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link_ids: selected, action: "assign" }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(
        selected.length === 1
          ? "Link assigned to campaign"
          : `${selected.length} links assigned`
      );
      setSelected([]);
      onRefresh();
      void loadAvailable();
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const unassign = async (linkId: string) => {
    const res = await fetch(`/api/campaigns/${campaignId}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link_ids: [linkId], action: "unassign" }),
    });
    if (res.ok) {
      toast.success("Link unassigned");
      onRefresh();
      void loadAvailable();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/dashboard/links/new?campaign_id=${campaignId}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold shadow-button"
        >
          <Plus className="h-4 w-4" /> New link in campaign
        </Link>
        <Link
          href={`/dashboard/links?campaign_id=${campaignId}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-border text-sm font-semibold hover:border-primary/40"
        >
          View in links list
        </Link>
      </div>

      {links.length === 0 && (
        <EmptyState
          icon={<Link2 className="h-8 w-8" />}
          title="No links in this campaign yet"
          description="Create a new short link tied to this campaign, or assign links you already have. Creator tracking links also show up here once you add creators."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href={`/dashboard/links/new?campaign_id=${campaignId}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold shadow-button"
              >
                <Plus className="h-4 w-4" /> Create link
              </Link>
            </div>
          }
        />
      )}

      <div className="bg-white rounded-card border border-neutral-border/80 shadow-soft p-5 space-y-3">
        <div>
          <h3 className="font-semibold text-neutral-text">Assign existing links</h3>
          <p className="text-xs text-neutral-muted mt-1">
            Pick short links that aren’t in another campaign yet.
          </p>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by short code, title, or URL…"
          className="w-full h-10 px-3 rounded-xl border border-neutral-border/80 text-sm"
        />
        <div className="max-h-48 overflow-y-auto space-y-1 border border-neutral-border/70 rounded-xl p-2 min-h-[4.5rem]">
          {loadingAvailable ? (
            <p className="px-2 py-3 text-sm text-neutral-muted flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading your links…
            </p>
          ) : assignable.length === 0 ? (
            <p className="px-2 py-3 text-sm text-neutral-muted">
              {unassigned.length === 0
                ? available.length === 0
                  ? "You don’t have any links yet — create one first."
                  : "All your links are already in a campaign. Create a new link or unassign one elsewhere."
                : "No links match your search."}
            </p>
          ) : (
            assignable.map((l) => (
              <label
                key={l.id}
                className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-neutral-bg rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(l.id)}
                  onChange={(e) => {
                    setSelected((prev) =>
                      e.target.checked
                        ? [...prev, l.id]
                        : prev.filter((id) => id !== l.id)
                    );
                  }}
                />
                <span className="font-medium shrink-0">/{l.short_code}</span>
                <span className="text-neutral-muted truncate">
                  {l.title || l.original_url}
                </span>
              </label>
            ))
          )}
        </div>
        <button
          type="button"
          disabled={!selected.length || loading}
          onClick={assign}
          className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold disabled:opacity-40"
        >
          {loading ? "Assigning…" : "Assign selected"}
        </button>
      </div>

      {links.length > 0 && (
        <div className="bg-white rounded-card border border-neutral-border/80 shadow-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-bg/80 text-neutral-muted text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Short link</th>
                <th className="px-4 py-3 font-semibold">Clicks</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id} className="border-t border-neutral-border/70">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/links/${l.id}/analytics`}
                      className="font-medium text-primary"
                    >
                      /{l.short_code}
                    </Link>
                    <div className="text-xs text-neutral-muted truncate max-w-md">
                      {l.title || l.original_url}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-muted">
                    {l.click_count || 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => unassign(l.id)}
                      className="text-xs font-semibold text-neutral-muted hover:text-rose-600"
                    >
                      Unassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AnalyticsTab({
  analytics,
  loading,
  range,
  setRange,
  onRefresh,
  campaignId,
  currency,
}: any) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-semibold text-neutral-muted mb-1">From</label>
          <input
            type="date"
            value={range.from}
            onChange={(e) => setRange({ ...range, from: e.target.value })}
            className="h-10 px-3 rounded-xl border border-neutral-border/80 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-muted mb-1">To</label>
          <input
            type="date"
            value={range.to}
            onChange={(e) => setRange({ ...range, to: e.target.value })}
            className="h-10 px-3 rounded-xl border border-neutral-border/80 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="h-10 px-4 rounded-full bg-primary text-white text-sm font-semibold"
        >
          Apply
        </button>
        <a
          href={`/api/campaigns/${campaignId}/analytics?from=${range.from}&to=${range.to}&format=csv`}
          className="h-10 px-4 rounded-full border border-neutral-border text-sm font-semibold inline-flex items-center"
        >
          Export CSV
        </a>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-neutral-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {analytics && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Clicks" value={analytics.totals.clicks} />
            <Stat
              label="Uniques"
              tip="Approximate unique visitors (distinct IPs) in this date range."
              value={analytics.totals.uniques}
            />
            <Stat
              label="Conversions"
              tip="Goal events recorded for this campaign’s links (purchases, signups, etc.)."
              value={analytics.totals.conversions}
            />
            <Stat
              label="Conv. rate"
              tip="Conversions ÷ clicks × 100 for this date range."
              value={`${analytics.totals.conversion_rate.toFixed(1)}%`}
            />
            <Stat
              label="Spend"
              tip="Sum of logged spend entries (including creator fees)."
              value={formatCampaignMoney(analytics.totals.total_spend || 0, currency)}
            />
            <Stat
              label="CPC"
              tip="Cost per click = spend ÷ clicks. Uses logged spend when available; otherwise planned budget."
              value={
                analytics.totals.cpc != null
                  ? formatCampaignMoney(analytics.totals.cpc, currency)
                  : "—"
              }
            />
            <Stat
              label="CPA"
              tip="Cost per acquisition = spend ÷ conversions. Needs both spend and conversions."
              value={
                analytics.totals.cpa != null
                  ? formatCampaignMoney(analytics.totals.cpa, currency)
                  : "—"
              }
            />
            <Stat
              label="Planned budget"
              tip="Your planning estimate / ceiling — not counted as real spend."
              value={formatCampaignMoney(analytics.totals.planned_budget || 0, currency)}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Leaderboard
              title="Creator leaderboard"
              rows={(analytics.creatorLeaderboard || []).map((c: any) => ({
                label: `${c.display_name} · ${c.platform}`,
                value: `${c.clicks} clicks · ${c.conversions} conv`,
              }))}
            />
            <Leaderboard
              title="UTM sources"
              rows={(analytics.utmSources || []).map((u: any) => ({
                label: u.key,
                value: String(u.count),
              }))}
            />
            <Leaderboard
              title="Platform mix"
              rows={(analytics.platformMix || []).map((u: any) => ({
                label: u.key,
                value: String(u.count),
              }))}
            />
            <Leaderboard
              title="Link leaderboard"
              rows={(analytics.linkLeaderboard || []).map((l: any) => ({
                label: `/${l.short_code}`,
                value: `${l.clicks} clicks`,
              }))}
            />
          </div>
        </>
      )}
    </div>
  );
}

function Leaderboard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="bg-white rounded-card border border-neutral-border/80 shadow-soft p-5">
      <h3 className="font-semibold text-neutral-text mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-muted">No data</p>
      ) : (
        <ul className="space-y-2">
          {rows.slice(0, 8).map((r) => (
            <li key={r.label} className="flex justify-between gap-3 text-sm">
              <span className="truncate text-neutral-text">{r.label}</span>
              <span className="text-neutral-muted shrink-0">{r.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SpendTab({
  campaignId,
  spend,
  creators,
  plannedBudget,
  currency,
  onRefresh,
}: {
  campaignId: string;
  spend: { entries: CampaignSpendEntry[]; total: number };
  creators: CampaignCreator[];
  plannedBudget: number;
  currency: string;
  onRefresh: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [saving, setSaving] = useState(false);

  const add = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/spend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          currency,
          note,
          campaign_creator_id: creatorId || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Spend logged");
      setAmount("");
      setNote("");
      setCreatorId("");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entryId: string) => {
    const res = await fetch(`/api/campaigns/${campaignId}/spend/${entryId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Removed");
      onRefresh();
    }
  };

  const progress =
    plannedBudget > 0 ? Math.min((spend.total / plannedBudget) * 100, 100) : null;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <Stat label="Logged spend" value={formatCampaignMoney(spend.total, currency)} />
        <Stat label="Planned budget" value={formatCampaignMoney(plannedBudget, currency)} />
        <Stat
          label="Budget used"
          value={progress != null ? `${progress.toFixed(0)}%` : "—"}
        />
      </div>
      <p className="text-xs text-neutral-muted">
        Amounts use campaign currency ({currency}). Planned budget is a ceiling/estimate. Marking a creator as paid can auto-log their fee.
      </p>

      <div className="bg-white rounded-card border border-neutral-border/80 shadow-soft p-5 space-y-3">
        <h3 className="font-semibold inline-flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" /> Log spend
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label={`Amount (${currency})`} value={amount} onChange={setAmount} placeholder="100" />
          <div>
            <label className="block text-xs font-semibold text-neutral-muted mb-1.5">Creator (optional)</label>
            <select
              value={creatorId}
              onChange={(e) => setCreatorId(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-neutral-border/80 text-sm"
            >
              <option value="">None</option>
              {creators.map((c) => (
                <option key={c.id} value={c.id}>{c.display_name}</option>
              ))}
            </select>
          </div>
          <Field label="Note" value={note} onChange={setNote} placeholder="Boost / fee" />
        </div>
        <button
          type="button"
          disabled={saving || !amount}
          onClick={add}
          className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold disabled:opacity-40"
        >
          Add entry
        </button>
      </div>

      <div className="bg-white rounded-card border border-neutral-border/80 shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-bg/80 text-left text-neutral-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Note</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {spend.entries.map((e) => (
              <tr key={e.id} className="border-t border-neutral-border/70">
                <td className="px-4 py-3">{e.spent_on}</td>
                <td className="px-4 py-3">
                  {formatCampaignMoney(e.amount, e.currency || currency)}
                </td>
                <td className="px-4 py-3 text-neutral-muted">{e.note || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => remove(e.id)} className="text-neutral-muted hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {spend.entries.length === 0 && (
          <p className="p-6 text-sm text-neutral-muted">No spend logged yet.</p>
        )}
      </div>
    </div>
  );
}

function SettingsHint({ campaignId }: { campaignId: string }) {
  return (
    <div className="bg-white rounded-card border border-neutral-border/80 shadow-soft p-6 space-y-3">
      <h3 className="font-semibold text-neutral-text">Campaign settings</h3>
      <p className="text-sm text-neutral-muted">
        Edit name, dates, currency, UTM defaults, planned budget, default destination URL, and type in the full editor.
        Changing UTM defaults fills empty keys on member links without overwriting creator-specific values.
      </p>
      <Link
        href={`/dashboard/campaigns/${campaignId}/edit`}
        className="inline-flex px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold shadow-button"
      >
        Open settings editor
      </Link>
    </div>
  );
}
