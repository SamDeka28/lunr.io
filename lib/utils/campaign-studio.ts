/** Campaign Studio helpers — general-purpose campaign workspaces */

export const CAMPAIGN_TYPES = [
  { value: "product_launch", label: "Product Launch" },
  { value: "seasonal_promotion", label: "Seasonal Promotion" },
  { value: "email_marketing", label: "Email Marketing" },
  { value: "social_media", label: "Social Media" },
  { value: "content_marketing", label: "Content Marketing" },
  { value: "paid_advertising", label: "Paid Advertising" },
  { value: "influencer", label: "Influencer / Creator" },
  { value: "affiliate", label: "Affiliate / Partner" },
  { value: "event", label: "Event" },
  { value: "other", label: "Other" },
] as const;

export type CampaignTypeValue = (typeof CAMPAIGN_TYPES)[number]["value"];

/** Default type for new campaigns — general, not influencer */
export const DEFAULT_CAMPAIGN_TYPE: CampaignTypeValue = "product_launch";

const PARTNER_TYPES = new Set<string>(["influencer", "affiliate"]);

/** Types that benefit from the Partners tab by default */
export function isPartnerCampaignType(type?: string | null): boolean {
  return !!type && PARTNER_TYPES.has(type);
}

export function campaignTypeLabel(type?: string | null): string {
  if (!type) return "Campaign";
  const found = CAMPAIGN_TYPES.find((t) => t.value === type);
  if (found) return found.label;
  return type.replace(/_/g, " ");
}

export function formatCampaignTypeChip(type?: string | null): string {
  if (!type) return "General";
  return type.replace(/_/g, " ");
}
