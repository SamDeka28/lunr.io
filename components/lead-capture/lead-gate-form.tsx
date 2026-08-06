"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  type LeadCaptureConfig,
  type LeadCaptureField,
  type LeadFieldResponses,
  pageBackgroundCss,
} from "@/lib/utils/lead-capture-config";

function FieldInput({
  field,
  value,
  onChange,
  accentColor,
  textColor,
  disabled,
  autoFocus,
  borderRadius,
}: {
  field: LeadCaptureField;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  accentColor: string;
  textColor: string;
  disabled?: boolean;
  autoFocus?: boolean;
  borderRadius: number;
}) {
  const focusStyle = {
    ["--lead-accent" as string]: accentColor,
    borderRadius,
  } as CSSProperties;

  if (field.type === "checkbox") {
    return (
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="mt-1 h-4 w-4 rounded border-neutral-border"
          style={{ accentColor }}
        />
        <span className="text-sm font-medium" style={{ color: textColor }}>
          {field.label}
          {!field.required && (
            <span className="font-normal opacity-60"> (optional)</span>
          )}
        </span>
      </label>
    );
  }

  const commonClass =
    "w-full border-2 border-black/10 bg-white/90 text-sm font-medium focus:outline-none focus:ring-2 focus:border-[var(--lead-accent)] transition-all disabled:opacity-60";

  if (field.type === "textarea") {
    return (
      <div>
        <label
          className="block text-sm font-semibold mb-2"
          style={{ color: textColor }}
        >
          {field.label}
          {!field.required && (
            <span className="font-normal opacity-60"> (optional)</span>
          )}
        </label>
        <textarea
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          disabled={disabled}
          rows={3}
          autoFocus={autoFocus}
          style={focusStyle}
          className={cn(
            commonClass,
            "px-4 py-3 resize-none focus:ring-[color:var(--lead-accent)]/40"
          )}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <label
          className="block text-sm font-semibold mb-2"
          style={{ color: textColor }}
        >
          {field.label}
          {!field.required && (
            <span className="font-normal opacity-60"> (optional)</span>
          )}
        </label>
        <select
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          disabled={disabled}
          autoFocus={autoFocus}
          style={focusStyle}
          className={cn(
            commonClass,
            "h-12 px-4 focus:ring-[color:var(--lead-accent)]/40"
          )}
        >
          <option value="">Select…</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const inputType =
    field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text";

  return (
    <div>
      <label
        className="block text-sm font-semibold mb-2"
        style={{ color: textColor }}
      >
        {field.label}
        {!field.required && (
          <span className="font-normal opacity-60"> (optional)</span>
        )}
      </label>
      <input
        type={inputType}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete={
          field.type === "email"
            ? "email"
            : field.type === "phone"
              ? "tel"
              : field.label.toLowerCase().includes("name")
                ? "name"
                : "off"
        }
        style={focusStyle}
        className={cn(
          commonClass,
          "h-12 px-4 focus:ring-[color:var(--lead-accent)]/40"
        )}
      />
    </div>
  );
}

export function LeadGateForm({
  config,
  shortCode,
  linkTitle,
  mode = "live",
  onSuccess,
  className,
}: {
  config: LeadCaptureConfig;
  shortCode?: string;
  linkTitle?: string | null;
  mode?: "live" | "preview";
  onSuccess?: () => void;
  className?: string;
}) {
  const [values, setValues] = useState<LeadFieldResponses>(() => {
    const initial: LeadFieldResponses = {};
    for (const f of config.fields) {
      initial[f.id] = f.type === "checkbox" ? false : "";
    }
    return initial;
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const next: LeadFieldResponses = {};
    for (const f of config.fields) {
      next[f.id] =
        values[f.id] !== undefined
          ? values[f.id]
          : f.type === "checkbox"
            ? false
            : "";
    }
    setValues(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remount field keys when set changes
  }, [config.fields.map((f) => f.id).join(",")]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const font = config.style.fontFamily;
    if (!font || font === "Inter") return;
    const fontName = font.replace(/\s+/g, "+");
    const linkId = `lead-gate-font-${fontName}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700&display=swap`;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, [config.style.fontFamily]);

  const { style } = config;
  const accent = style.accentColor;
  const textColor = style.textColor;
  const radius = style.buttonBorderRadius;

  const cardClass = cn(
    "w-full max-w-md p-8",
    style.cardStyle === "elevated" && "rounded-2xl shadow-xl",
    style.cardStyle === "bordered" && "rounded-2xl border-2 border-black/10 shadow-none",
    style.cardStyle === "flat" && "rounded-2xl shadow-none"
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === "preview") return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/links/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          short_code: shortCode,
          responses: values,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      onSuccess?.();
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const firstInputId = config.fields.find((f) => f.type !== "checkbox")?.id;
  const showTitle = style.showLinkTitle && linkTitle;

  const buttonBg =
    style.buttonVariant === "soft"
      ? `${accent}22`
      : style.buttonVariant === "filled"
        ? accent
        : accent;
  const buttonFg =
    style.buttonVariant === "soft" ? accent : style.buttonTextColor;

  return (
    <div
      className={cn(
        "flex items-center justify-center p-4",
        mode === "live" ? "min-h-screen" : "h-full min-h-full",
        className
      )}
      style={{
        background: pageBackgroundCss(style),
        fontFamily: `"${style.fontFamily}", sans-serif`,
        color: textColor,
      }}
    >
      <div
        className={cardClass}
        style={{ backgroundColor: style.cardBackground, color: textColor }}
      >
        <div className="text-center mb-8">
          {style.logoUrl ? (
            <img
              src={style.logoUrl}
              alt=""
              className="h-14 w-14 mx-auto mb-4 rounded-2xl object-cover"
            />
          ) : (
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${accent}18` }}
            >
              <Mail className="h-8 w-8" style={{ color: accent }} />
            </div>
          )}
          <h1
            className="text-2xl font-bold mb-2 tracking-tight"
            style={{ color: textColor }}
          >
            {config.heading}
          </h1>
          {showTitle && (
            <p className="text-sm font-medium mb-1 opacity-80">{linkTitle}</p>
          )}
          {config.description && (
            <p className="text-sm opacity-70">{config.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {config.fields.map((field) => (
            <FieldInput
              key={field.id}
              field={field}
              value={
                values[field.id] ?? (field.type === "checkbox" ? false : "")
              }
              onChange={(v) =>
                setValues((prev) => ({ ...prev, [field.id]: v }))
              }
              accentColor={accent}
              textColor={textColor}
              borderRadius={Math.min(radius, 16)}
              disabled={mode === "preview" || loading}
              autoFocus={mode === "live" && field.id === firstInputId}
            />
          ))}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || mode === "preview"}
            className="w-full h-12 font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: buttonBg,
              color: buttonFg,
              borderRadius: radius,
            }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>{config.buttonText}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
