"use client";

import { HelpfulContent } from "../helpful-content";

/** Compact tips panel for layouts that only need the sidebar content. */
export function LinksPageClient({ linkCount }: { linkCount: number }) {
  return <HelpfulContent linkCount={linkCount} />;
}
