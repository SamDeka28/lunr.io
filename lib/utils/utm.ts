/** Campaign / link UTM helpers */

export type UtmParameters = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  [key: string]: string | undefined;
};

/** Slugify a campaign name for use as default utm_campaign */
export function slugifyCampaignName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);
}

/** Strip empty / whitespace-only UTM values */
export function cleanUtmParameters(
  params: Record<string, string | undefined | null> | null | undefined
): Record<string, string> | null {
  if (!params) return null;
  const cleaned: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value != null && String(value).trim() !== "") {
      cleaned[key] = String(value).trim();
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : null;
}

/**
 * Merge campaign UTM defaults into link UTM params.
 * Link-specific values win over campaign defaults.
 */
export function mergeCampaignUtmDefaults(
  campaignDefaults: Record<string, string> | null | undefined,
  linkUtm: Record<string, string> | null | undefined
): Record<string, string> | null {
  return cleanUtmParameters({
    ...(campaignDefaults || {}),
    ...(linkUtm || {}),
  });
}

/**
 * Fill only empty keys on a link from campaign defaults.
 * Never overwrites a link's explicit non-empty UTM values.
 */
export function fillEmptyUtmFromDefaults(
  campaignDefaults: Record<string, string> | null | undefined,
  linkUtm: Record<string, string> | null | undefined
): Record<string, string> | null {
  const current = { ...(linkUtm || {}) };
  const defaults = campaignDefaults || {};
  for (const [key, value] of Object.entries(defaults)) {
    if (!value || !String(value).trim()) continue;
    const existing = current[key];
    if (existing == null || String(existing).trim() === "") {
      current[key] = String(value).trim();
    }
  }
  return cleanUtmParameters(current);
}

/**
 * Build UTM params for a partner / placement tracking link.
 * Uses campaign defaults; sets source from platform and content from handle
 * when those keys are empty. Does not force utm_medium=influencer.
 */
export function buildCreatorLinkUtm(options: {
  campaignDefaults?: Record<string, string> | null;
  platform?: string | null;
  handle?: string | null;
  utmSourceOverride?: string | null;
  utmContentOverride?: string | null;
  utmMediumOverride?: string | null;
}): Record<string, string> | null {
  const platform = options.platform?.trim().toLowerCase() || undefined;
  const handle = options.handle?.trim().replace(/^@/, "") || undefined;
  const defaults = options.campaignDefaults || {};
  const medium =
    options.utmMediumOverride?.trim() ||
    defaults.utm_medium ||
    (platform ? "social" : undefined);

  return mergeCampaignUtmDefaults(defaults, {
    ...(medium ? { utm_medium: medium } : {}),
    ...(options.utmSourceOverride?.trim() || platform
      ? { utm_source: options.utmSourceOverride?.trim() || platform }
      : {}),
    ...(options.utmContentOverride?.trim() || handle
      ? { utm_content: options.utmContentOverride?.trim() || handle }
      : {}),
  });
}

/**
 * Build campaign utm_defaults from form/API input.
 * Defaults utm_campaign to the campaign name slug when not provided.
 */
export function buildCampaignUtmDefaults(
  name: string,
  input?: Partial<UtmParameters> | null,
  _campaignType?: string | null
): Record<string, string> | null {
  const slug = slugifyCampaignName(name);
  return cleanUtmParameters({
    utm_source: input?.utm_source,
    utm_medium: input?.utm_medium,
    utm_campaign: input?.utm_campaign || slug || undefined,
    utm_term: input?.utm_term,
    utm_content: input?.utm_content,
  });
}

/** Cost per click when budget > 0 */
export function computeCpc(budget: number, clicks: number): number | null {
  if (!budget || budget <= 0) return null;
  if (!clicks || clicks <= 0) return null;
  return budget / clicks;
}
