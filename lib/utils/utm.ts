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
 * Build campaign utm_defaults from form/API input.
 * Defaults utm_campaign to the campaign name slug when not provided.
 */
export function buildCampaignUtmDefaults(
  name: string,
  input?: Partial<UtmParameters> | null
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
