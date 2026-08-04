"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import type { PageBlock } from "@/lib/utils/page-blocks";
import { getVideoEmbedUrl, renderSimpleMarkdown } from "@/lib/utils/page-blocks";

interface PageContentBlocksProps {
  pageId: string;
  blocks: PageBlock[];
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  fontFamily: string;
  buttonBorderRadius: number;
  buttonPadding: number;
  linkGap: number;
  interactive?: boolean;
}

export function PageContentBlocks({
  pageId,
  blocks,
  textColor,
  buttonColor,
  buttonTextColor,
  fontFamily,
  buttonBorderRadius,
  buttonPadding,
  linkGap,
  interactive = true,
}: PageContentBlocksProps) {
  if (!blocks?.length) return null;

  return (
    <div className="w-full flex flex-col" style={{ gap: `${linkGap}px` }}>
      {blocks.map((block) => {
        if (block.type === "video") {
          const embed = getVideoEmbedUrl(block.url);
          if (!embed) return null;
          return (
            <div key={block.id} className="w-full">
              {block.title && (
                <p
                  className="text-sm font-semibold mb-2"
                  style={{ color: textColor, fontFamily: `"${fontFamily}", sans-serif` }}
                >
                  {block.title}
                </p>
              )}
              <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={embed}
                  title={block.title || "Video"}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          );
        }

        if (block.type === "text") {
          return (
            <div
              key={block.id}
              className="w-full text-sm leading-relaxed prose-sm"
              style={{ color: textColor, fontFamily: `"${fontFamily}", sans-serif`, opacity: 0.9 }}
              dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(block.content || "") }}
            />
          );
        }

        if (block.type === "email_capture") {
          return (
            <EmailCaptureForm
              key={block.id}
              pageId={pageId}
              block={block}
              textColor={textColor}
              buttonColor={buttonColor}
              buttonTextColor={buttonTextColor}
              fontFamily={fontFamily}
              buttonBorderRadius={buttonBorderRadius}
              buttonPadding={buttonPadding}
              interactive={interactive}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

function EmailCaptureForm({
  pageId,
  block,
  textColor,
  buttonColor,
  buttonTextColor,
  fontFamily,
  buttonBorderRadius,
  buttonPadding,
  interactive,
}: {
  pageId: string;
  block: Extract<PageBlock, { type: "email_capture" }>;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  fontFamily: string;
  buttonBorderRadius: number;
  buttonPadding: number;
  interactive: boolean;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactive || done) return;
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/email-capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), block_id: block.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");
      setDone(true);
      toast.success("Thanks for subscribing!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full rounded-xl border border-black/10 bg-white/40 backdrop-blur-sm p-4 space-y-3"
      style={{ fontFamily: `"${fontFamily}", sans-serif` }}
    >
      {block.heading && (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" style={{ color: textColor }} />
          <p className="text-sm font-semibold" style={{ color: textColor }}>
            {block.heading}
          </p>
        </div>
      )}
      {done ? (
        <p className="text-sm" style={{ color: textColor, opacity: 0.8 }}>
          You&apos;re on the list. Thanks!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={block.placeholder || "you@example.com"}
            disabled={!interactive || loading}
            className="flex-1 h-11 px-3 rounded-xl border border-black/10 bg-white text-sm outline-none focus:ring-2 focus:ring-black/10"
            style={{ color: "#111" }}
            required
          />
          <button
            type="submit"
            disabled={!interactive || loading}
            className="h-11 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{
              backgroundColor: buttonColor,
              color: buttonTextColor,
              borderRadius: `${buttonBorderRadius}px`,
              paddingLeft: `${buttonPadding}px`,
              paddingRight: `${buttonPadding}px`,
            }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {block.buttonText || "Subscribe"}
          </button>
        </form>
      )}
    </div>
  );
}
