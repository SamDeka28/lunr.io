export type SocialOtherLink = {
  id: string;
  url: string;
  label?: string;
  iconUrl?: string;
};

/** Known platforms are string URLs; custom links live under `others`. */
export type SocialLinksMap = Record<string, string | SocialOtherLink[] | undefined> & {
  others?: SocialOtherLink[];
};

const KNOWN_PLATFORMS = new Set([
  "email",
  "twitter",
  "instagram",
  "linkedin",
  "github",
  "youtube",
  "facebook",
  "website",
]);

export function getKnownSocialUrl(
  socialLinks: SocialLinksMap | Record<string, any> | null | undefined,
  platform: string
): string {
  const value = socialLinks?.[platform];
  return typeof value === "string" ? value : "";
}

export function getOtherSocialLinks(
  socialLinks: SocialLinksMap | Record<string, any> | null | undefined
): SocialOtherLink[] {
  const others = socialLinks?.others;
  if (!Array.isArray(others)) return [];
  return others.filter(
    (item): item is SocialOtherLink =>
      !!item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.url === "string"
  );
}

export function hasAnySocialLinks(
  socialLinks: SocialLinksMap | Record<string, any> | null | undefined
): boolean {
  if (!socialLinks) return false;
  for (const [key, value] of Object.entries(socialLinks)) {
    if (key === "others") {
      if (getOtherSocialLinks(socialLinks).some((o) => o.url.trim())) return true;
      continue;
    }
    if (KNOWN_PLATFORMS.has(key) && typeof value === "string" && value.trim()) {
      return true;
    }
  }
  return false;
}

export function createOtherSocialId(): string {
  return `other-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Strip empty known platforms and empty others before save */
export function sanitizeSocialLinks(
  socialLinks: SocialLinksMap
): Record<string, any> {
  const next: Record<string, any> = {};
  for (const [key, value] of Object.entries(socialLinks)) {
    if (key === "others") {
      const others = getOtherSocialLinks(socialLinks)
        .filter((o) => o.url.trim())
        .map((o) => ({
          id: o.id,
          url: o.url.trim(),
          ...(o.label?.trim() ? { label: o.label.trim() } : {}),
          ...(o.iconUrl?.trim() ? { iconUrl: o.iconUrl.trim() } : {}),
        }));
      if (others.length > 0) next.others = others;
      continue;
    }
    if (typeof value === "string" && value.trim()) {
      next[key] = value.trim();
    }
  }
  return next;
}
