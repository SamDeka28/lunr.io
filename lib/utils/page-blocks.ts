export type PageBlockType = "video" | "text" | "email_capture";

export interface PageBlockBase {
  id: string;
  type: PageBlockType;
}

export interface VideoBlock extends PageBlockBase {
  type: "video";
  url: string;
  title?: string;
}

export interface TextBlock extends PageBlockBase {
  type: "text";
  content: string;
}

export interface EmailCaptureBlock extends PageBlockBase {
  type: "email_capture";
  heading?: string;
  buttonText?: string;
  placeholder?: string;
}

export type PageBlock = VideoBlock | TextBlock | EmailCaptureBlock;

export function createBlockId(type: PageBlockType): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Convert YouTube / Vimeo watch URLs into embeddable iframe src */
export function getVideoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const id = u.searchParams.get("v") || u.pathname.split("/embed/")[1]?.split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const parts = u.pathname.split("/").filter(Boolean);
      const id = host === "player.vimeo.com" ? parts[1] : parts[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
}

/** Very light markdown: paragraphs, **bold**, *italic*, line breaks */
export function renderSimpleMarkdown(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n\n+/g, "</p><p>")
    .replace(/\n/g, "<br />")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}
