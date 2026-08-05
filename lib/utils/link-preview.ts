/**
 * Build a minimal HTML document with Open Graph / Twitter Card meta tags
 * so Slack, iMessage, LinkedIn, etc. can unfurl short links.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface LinkPreviewMeta {
  title: string;
  description: string;
  url: string;
  imageUrl?: string | null;
  siteName?: string;
}

export function buildLinkPreviewHtml(meta: LinkPreviewMeta): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const url = escapeHtml(meta.url);
  const siteName = escapeHtml(meta.siteName || "lunr.to");
  const image = meta.imageUrl ? escapeHtml(meta.imageUrl) : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${siteName}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url}" />
  ${image ? `<meta property="og:image" content="${image}" />` : ""}
  <meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  ${image ? `<meta name="twitter:image" content="${image}" />` : ""}
</head>
<body>
  <p><a href="${url}">${title}</a></p>
</body>
</html>`;
}
