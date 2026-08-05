"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { Image as ImageIcon, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import {
  createOtherSocialId,
  getOtherSocialLinks,
  type SocialLinksMap,
  type SocialOtherLink,
} from "@/lib/utils/social-links";

function BrandSvg({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={cn("h-4 w-4", className)}
    >
      {children}
    </svg>
  );
}

const SOCIAL_PLATFORMS = [
  {
    id: "email",
    label: "Email",
    placeholder: "your@email.com",
    bg: "bg-[#4361EE]/10 text-[#4361EE]",
    Icon: ({ className }: { className?: string }) => (
      <BrandSvg className={className}>
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
      </BrandSvg>
    ),
  },
  {
    id: "twitter",
    label: "X / Twitter",
    placeholder: "https://x.com/yourprofile",
    bg: "bg-neutral-text/10 text-neutral-text",
    Icon: ({ className }: { className?: string }) => (
      <BrandSvg className={className}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </BrandSvg>
    ),
  },
  {
    id: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/yourprofile",
    bg: "bg-[#E4405F]/10 text-[#E4405F]",
    Icon: ({ className }: { className?: string }) => (
      <BrandSvg className={className}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </BrandSvg>
    ),
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/yourprofile",
    bg: "bg-[#0A66C2]/10 text-[#0A66C2]",
    Icon: ({ className }: { className?: string }) => (
      <BrandSvg className={className}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </BrandSvg>
    ),
  },
  {
    id: "github",
    label: "GitHub",
    placeholder: "https://github.com/yourprofile",
    bg: "bg-neutral-text/10 text-neutral-text",
    Icon: ({ className }: { className?: string }) => (
      <BrandSvg className={className}>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </BrandSvg>
    ),
  },
  {
    id: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@yourchannel",
    bg: "bg-[#FF0000]/10 text-[#FF0000]",
    Icon: ({ className }: { className?: string }) => (
      <BrandSvg className={className}>
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </BrandSvg>
    ),
  },
  {
    id: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/yourprofile",
    bg: "bg-[#1877F2]/10 text-[#1877F2]",
    Icon: ({ className }: { className?: string }) => (
      <BrandSvg className={className}>
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </BrandSvg>
    ),
  },
  {
    id: "website",
    label: "Website",
    placeholder: "https://yourwebsite.com",
    bg: "bg-primary/10 text-primary",
    Icon: ({ className }: { className?: string }) => (
      <BrandSvg className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </BrandSvg>
    ),
  },
  {
    id: "others",
    label: "Others",
    placeholder: "https://…",
    bg: "bg-neutral-surface text-neutral-muted",
    Icon: ({ className }: { className?: string }) => (
      <BrandSvg className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </BrandSvg>
    ),
  },
] as const;

type KnownPlatformId = Exclude<(typeof SOCIAL_PLATFORMS)[number]["id"], "others">;

function CompactIconUpload({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please choose an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be 5MB or smaller");
        return;
      }
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("pathPrefix", "pages");
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        onChange(data.publicUrl);
        toast.success("Icon uploaded");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  return (
    <>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative w-10 h-10 rounded-xl border border-dashed border-neutral-border/80",
          "bg-neutral-surface/60 hover:border-primary/40 hover:bg-primary/5",
          "flex items-center justify-center shrink-0 overflow-hidden transition-colors",
          uploading && "opacity-70 cursor-wait"
        )}
        title={value ? "Replace icon" : "Upload icon (optional)"}
        aria-label={value ? "Replace icon" : "Upload icon"}
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-muted" />
        ) : value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-3.5 w-3.5 text-neutral-muted" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadFile(file);
          e.target.value = "";
        }}
      />
    </>
  );
}

export function SocialLinksEditor({
  value,
  onChange,
}: {
  value: SocialLinksMap;
  onChange: (next: SocialLinksMap) => void;
}) {
  const [adding, setAdding] = useState(false);

  const knownActive = SOCIAL_PLATFORMS.filter(
    (p) => p.id !== "others" && typeof value[p.id] === "string"
  ).map((p) => p.id as KnownPlatformId);

  const others = getOtherSocialLinks(value);
  const totalCount = knownActive.length + others.length;

  const availableKnown = SOCIAL_PLATFORMS.filter(
    (p) => p.id === "others" || !knownActive.includes(p.id as KnownPlatformId)
  );

  const addKnown = (id: KnownPlatformId) => {
    onChange({ ...value, [id]: (value[id] as string) || "" });
    setAdding(false);
  };

  const addOther = () => {
    const next: SocialOtherLink = {
      id: createOtherSocialId(),
      url: "",
      label: "",
      iconUrl: "",
    };
    onChange({ ...value, others: [...others, next] });
    setAdding(false);
  };

  const updateKnown = (id: KnownPlatformId, url: string) => {
    onChange({ ...value, [id]: url });
  };

  const removeKnown = (id: KnownPlatformId) => {
    const next = { ...value };
    delete next[id];
    onChange(next);
  };

  const updateOther = (id: string, patch: Partial<SocialOtherLink>) => {
    onChange({
      ...value,
      others: others.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    });
  };

  const removeOther = (id: string) => {
    const nextOthers = others.filter((o) => o.id !== id);
    const next = { ...value };
    if (nextOthers.length === 0) delete next.others;
    else next.others = nextOthers;
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-neutral-text uppercase tracking-wide">
          Social Links ({totalCount})
        </label>
        {!adding && availableKnown.length > 0 && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-xs text-neutral-text hover:opacity-70 font-semibold flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        )}
      </div>

      {adding && availableKnown.length > 0 && (
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-neutral-border bg-neutral-bg">
          {availableKnown.map((platform) => {
            const Icon = platform.Icon;
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() =>
                  platform.id === "others"
                    ? addOther()
                    : addKnown(platform.id as KnownPlatformId)
                }
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-neutral-border bg-white hover:bg-neutral-bg transition-colors"
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    platform.bg
                  )}
                >
                  <Icon />
                </span>
                <span className="text-xs font-semibold text-neutral-text">
                  {platform.label}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="col-span-2 text-xs text-neutral-muted font-medium mt-1"
          >
            Cancel
          </button>
        </div>
      )}

      {totalCount > 0 ? (
        <div className="space-y-2">
          {knownActive.map((id) => {
            const meta = SOCIAL_PLATFORMS.find((p) => p.id === id)!;
            const Icon = meta.Icon;
            return (
              <div
                key={id}
                className="flex items-center gap-2 rounded-2xl border border-neutral-border/80 bg-white p-1.5 pl-2.5 shadow-soft"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                    meta.bg
                  )}
                >
                  <Icon />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold text-neutral-muted mb-0.5">
                    {meta.label}
                  </div>
                  <input
                    type={id === "email" ? "email" : "url"}
                    value={(value[id] as string) || ""}
                    onChange={(e) => updateKnown(id, e.target.value)}
                    placeholder={meta.placeholder}
                    className="w-full h-8 px-0 border-0 bg-transparent text-sm font-medium text-neutral-text placeholder:text-neutral-muted/70 focus:outline-none focus:ring-0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeKnown(id)}
                  className="w-8 h-8 rounded-full text-neutral-muted hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center shrink-0"
                  aria-label={`Remove ${meta.label}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}

          {others.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-neutral-border/80 bg-white p-2.5 shadow-soft space-y-2"
            >
              <div className="flex items-start gap-2">
                <CompactIconUpload
                  value={item.iconUrl}
                  onChange={(iconUrl) => updateOther(item.id, { iconUrl })}
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={item.label || ""}
                    onChange={(e) => updateOther(item.id, { label: e.target.value })}
                    placeholder="Label (optional)"
                    className="w-full h-8 px-2.5 rounded-lg border border-neutral-border/70 bg-neutral-surface/40 text-xs font-semibold text-neutral-text placeholder:text-neutral-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <input
                    type="url"
                    value={item.url}
                    onChange={(e) => updateOther(item.id, { url: e.target.value })}
                    placeholder="https://link.com/yourprofile"
                    className="w-full h-8 px-2.5 rounded-lg border border-neutral-border/70 bg-white text-sm font-medium text-neutral-text placeholder:text-neutral-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeOther(item.id)}
                  className="w-8 h-8 rounded-full text-neutral-muted hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center shrink-0"
                  aria-label="Remove other link"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-neutral-muted pl-12">
                Optional custom icon · PNG/JPG/WebP
              </p>
            </div>
          ))}
        </div>
      ) : (
        !adding && (
          <p className="text-center text-xs text-neutral-muted py-4">
            Add email, Twitter, Instagram, or a custom link
          </p>
        )
      )}
    </div>
  );
}
