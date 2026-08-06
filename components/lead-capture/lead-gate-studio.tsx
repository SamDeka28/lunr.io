"use client";

import { useState, type DragEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Crown,
  Eye,
  FileText,
  FormInput,
  GripVertical,
  Lock,
  Mail,
  Monitor,
  Palette,
  Plus,
  Settings,
  Smartphone,
  Trash2,
  Type,
  Copy,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ColorPickerWithInput } from "@/components/color-picker-with-input";
import { FontSelector } from "@/components/font-selector";
import { SliderWithInput } from "@/components/slider-with-input";
import { ImageUpload } from "@/components/ui/image-upload";
import { LeadGateForm } from "./lead-gate-form";
import {
  type LeadCaptureConfig,
  type LeadCaptureField,
  type LeadFieldType,
  LEAD_GATE_THEMES,
  applyLeadGateTheme,
  createLeadFieldId,
  defaultLeadCaptureConfig,
  normalizeLeadCaptureConfig,
} from "@/lib/utils/lead-capture-config";
import { toast } from "sonner";

type StudioTab = "form" | "fields" | "design" | "settings";

const ADDABLE: Array<{
  type: Exclude<LeadFieldType, "email">;
  label: string;
}> = [
  { type: "text", label: "Text" },
  { type: "phone", label: "Phone" },
  { type: "textarea", label: "Long text" },
  { type: "select", label: "Dropdown" },
  { type: "checkbox", label: "Checkbox" },
];

function ToggleSwitch({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
        enabled ? "bg-primary" : "bg-neutral-border",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-button",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function DesignSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-border/80 bg-white overflow-visible">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-neutral-bg/50 rounded-xl"
      >
        <span className="text-xs font-semibold text-neutral-text uppercase tracking-wide">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-neutral-muted transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="px-3.5 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

export function LeadGateStudio({
  enabled,
  onEnabledChange,
  config,
  onConfigChange,
  isPremium,
  linkTitle,
  footer,
  modeSwitcher,
}: {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  config: LeadCaptureConfig;
  onConfigChange: (config: LeadCaptureConfig) => void;
  isPremium: boolean;
  linkTitle?: string;
  footer: ReactNode;
  modeSwitcher?: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<StudioTab>("form");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "mobile"
  );
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [designOpen, setDesignOpen] = useState({
    themes: true,
    background: false,
    colors: false,
    button: false,
    type: false,
    card: false,
  });

  const locked = !isPremium;
  const interactive = isPremium && enabled;

  const update = (patch: Partial<LeadCaptureConfig>) => {
    onConfigChange(
      normalizeLeadCaptureConfig({
        ...config,
        ...patch,
        // Manual edits leave custom styling (deselect theme unless themeId provided)
        themeId:
          patch.themeId !== undefined
            ? patch.themeId
            : patch.style
              ? null
              : config.themeId,
      })
    );
  };

  const updateStyle = (patch: Partial<LeadCaptureConfig["style"]>) => {
    update({ style: { ...config.style, ...patch }, themeId: null });
  };

  const handleEnable = (on: boolean) => {
    if (!isPremium) return;
    onEnabledChange(on);
    if (on && (!config.fields || config.fields.length === 0)) {
      onConfigChange(defaultLeadCaptureConfig());
    }
  };

  const updateField = (id: string, patch: Partial<LeadCaptureField>) => {
    update({
      fields: config.fields.map((f) => {
        if (f.id !== id) return f;
        const next = { ...f, ...patch };
        if (next.type === "email") next.required = true;
        return next;
      }),
    });
  };

  const addField = (type: Exclude<LeadFieldType, "email">) => {
    const labels: Record<string, string> = {
      text: "Text",
      phone: "Phone",
      textarea: "Message",
      select: "Choice",
      checkbox: "I agree",
    };
    const field: LeadCaptureField = {
      id: createLeadFieldId(type),
      type,
      label: labels[type] || "Field",
      placeholder: type === "checkbox" ? undefined : "",
      required: false,
      ...(type === "select" ? { options: ["Option 1", "Option 2"] } : {}),
    };
    update({ fields: [...config.fields, field] });
    setSelectedFieldId(field.id);
    setAdding(false);
  };

  const removeField = (id: string) => {
    const field = config.fields.find((f) => f.id === id);
    if (!field || field.type === "email") return;
    update({ fields: config.fields.filter((f) => f.id !== id) });
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const duplicateField = (id: string) => {
    const field = config.fields.find((f) => f.id === id);
    if (!field || field.type === "email") return;
    const copy: LeadCaptureField = {
      ...field,
      id: createLeadFieldId(field.type),
      label: `${field.label} copy`,
      options: field.options ? [...field.options] : undefined,
    };
    const idx = config.fields.findIndex((f) => f.id === id);
    const fields = [...config.fields];
    fields.splice(idx + 1, 0, copy);
    update({ fields });
    setSelectedFieldId(copy.id);
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const fields = [...config.fields];
    const [item] = fields.splice(draggedIndex, 1);
    fields.splice(index, 0, item);
    update({ fields });
    setDraggedIndex(index);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  const tabs: Array<{ id: StudioTab; label: string; icon: typeof FileText }> = [
    { id: "form", label: "Form", icon: FileText },
    { id: "fields", label: "Fields", icon: FormInput },
    { id: "design", label: "Design", icon: Palette },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <motion.div
      className="flex flex-col h-full max-h-full relative overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 80% at 100% 0%, rgba(67,97,238,0.06), transparent 45%), #F3F5FA",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {modeSwitcher && (
        <div className="shrink-0 px-4 py-3 border-b border-neutral-border/70 bg-white/90 backdrop-blur-xl z-10">
          {modeSwitcher}
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Left rail */}
      <div className="w-[22rem] xl:w-96 bg-white/85 backdrop-blur-xl border-r border-neutral-border/70 shadow-soft flex flex-col overflow-hidden shrink-0">
        <div className="px-5 pt-5 pb-4 border-b border-neutral-border/70">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-neutral-text tracking-tight">
                Lead Gate Studio
              </h1>
              <p className="text-sm text-neutral-muted mt-0.5">
                Form builder for your redirect gate
              </p>
            </div>
            <ToggleSwitch
              enabled={enabled && isPremium}
              onChange={handleEnable}
              disabled={locked}
            />
          </div>
          {!isPremium && (
            <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-neon-pink/5 to-raspberry-plum/5 border border-neon-pink/10">
              <p className="text-[11px] text-neutral-muted flex items-center gap-1.5">
                <Crown className="h-3 w-3 text-neon-pink shrink-0" />
                Premium —{" "}
                <a
                  href="/dashboard/billing"
                  className="font-semibold text-neon-pink"
                >
                  Upgrade →
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="px-3 py-3 border-b border-neutral-border/70 bg-neutral-surface/40">
          <div className="flex gap-1 p-1 rounded-full bg-white/80 border border-neutral-border/70 shadow-soft">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 min-w-0 px-2 py-2 rounded-full text-[11px] font-semibold transition-all",
                    active
                      ? "bg-primary text-white shadow-button"
                      : "text-neutral-muted hover:text-neutral-text hover:bg-neutral-surface"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 mx-auto mb-0.5" />
                  <div className="truncate">{tab.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={cn(
            "flex-1 overflow-y-auto overflow-x-visible p-5",
            (!enabled || locked) &&
              activeTab !== "settings" &&
              "opacity-55 pointer-events-none"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
          {activeTab === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-neutral-muted mb-2">
                  Heading
                </label>
                <input
                  type="text"
                  value={config.heading}
                  onChange={(e) => update({ heading: e.target.value })}
                  disabled={!interactive}
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-border/80 bg-white text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-muted mb-2">
                  Description
                </label>
                <textarea
                  value={config.description}
                  onChange={(e) => update({ description: e.target.value })}
                  disabled={!interactive}
                  rows={3}
                  className="w-full px-3.5 py-3 rounded-xl border border-neutral-border/80 bg-white text-sm resize-none shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-muted mb-2">
                  Button text
                </label>
                <input
                  type="text"
                  value={config.buttonText}
                  onChange={(e) => update({ buttonText: e.target.value })}
                  disabled={!interactive}
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-border/80 bg-white text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <label className="flex items-center justify-between gap-3 text-sm text-neutral-text">
                <span>Show link title under heading</span>
                <ToggleSwitch
                  enabled={config.style.showLinkTitle}
                  onChange={(on) => updateStyle({ showLinkTitle: on })}
                  disabled={!interactive}
                />
              </label>
              <div>
                <label className="block text-xs font-semibold text-neutral-muted mb-2">
                  Logo (optional)
                </label>
                {interactive ? (
                  <ImageUpload
                    value={config.style.logoUrl || ""}
                    onChange={(url) => updateStyle({ logoUrl: url || undefined })}
                    pathPrefix="pages"
                    helperText="Shown above the heading · max 5MB"
                    className="w-full"
                    aspectClassName="w-full min-h-[8.5rem] max-h-44"
                  />
                ) : (
                  <div className="w-full min-h-[8.5rem] rounded-xl border border-dashed border-neutral-border bg-neutral-bg/50" />
                )}
                {config.style.logoUrl && interactive && (
                  <button
                    type="button"
                    onClick={() => updateStyle({ logoUrl: undefined })}
                    className="mt-2 text-xs font-semibold text-neutral-muted hover:text-neutral-text"
                  >
                    Remove logo
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "fields" && (
            <motion.div
              key="fields"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-muted uppercase tracking-wide">
                  Fields ({config.fields.length})
                </label>
                <button
                  type="button"
                  onClick={() => setAdding((v) => !v)}
                  disabled={!interactive}
                  className="text-xs font-semibold text-neutral-text hover:opacity-70 flex items-center gap-1 disabled:opacity-40"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>

              {adding && interactive && (
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-neutral-border bg-neutral-bg">
                  {ADDABLE.map(({ type, label }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addField(type)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-neutral-border bg-white hover:bg-neutral-bg transition-colors"
                    >
                      <Type className="h-4 w-4 text-neutral-muted" />
                      <span className="text-xs font-semibold text-neutral-text">
                        {label}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAdding(false)}
                    className="col-span-2 text-xs text-neutral-muted font-medium mt-1"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {config.fields.map((field, index) => {
                  const selected = selectedFieldId === field.id;
                  const isEmail = field.type === "email";
                  return (
                    <div
                      key={field.id}
                      draggable={interactive}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedFieldId(field.id)}
                      className={cn(
                        "rounded-xl border bg-white p-3 cursor-pointer transition-all",
                        selected
                          ? "border-primary ring-1 ring-primary/20"
                          : "border-neutral-border",
                        draggedIndex === index && "opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-neutral-muted shrink-0 cursor-grab" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                              {field.type}
                            </span>
                            {isEmail && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-neutral-muted">
                                <Lock className="h-2.5 w-2.5" /> Locked
                              </span>
                            )}
                            {field.required && !isEmail && (
                              <span className="text-[10px] text-neutral-muted">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-neutral-text truncate">
                            {field.label}
                          </p>
                        </div>
                        {!isEmail && (
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateField(field.id);
                              }}
                              className="p-1.5 rounded-lg text-neutral-muted hover:bg-neutral-bg"
                              title="Duplicate"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeField(field.id);
                              }}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {selected && (
                        <div
                          className="mt-3 pt-3 border-t border-neutral-border/70 space-y-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div>
                            <label className="block text-xs font-semibold text-neutral-muted mb-1.5">
                              Label
                            </label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) =>
                                updateField(field.id, { label: e.target.value })
                              }
                              disabled={!interactive}
                              className="w-full h-10 px-3 rounded-xl border border-neutral-border bg-white text-sm"
                            />
                          </div>
                          {field.type !== "checkbox" && (
                            <div>
                              <label className="block text-xs font-semibold text-neutral-muted mb-1.5">
                                Placeholder
                              </label>
                              <input
                                type="text"
                                value={field.placeholder || ""}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    placeholder: e.target.value,
                                  })
                                }
                                disabled={!interactive}
                                className="w-full h-10 px-3 rounded-xl border border-neutral-border bg-white text-sm"
                              />
                            </div>
                          )}
                          {field.type === "select" && (
                            <div>
                              <label className="block text-xs font-semibold text-neutral-muted mb-1.5">
                                Options (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={(field.options || []).join(", ")}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    options: e.target.value
                                      .split(",")
                                      .map((o) => o.trim())
                                      .filter(Boolean),
                                  })
                                }
                                disabled={!interactive}
                                className="w-full h-10 px-3 rounded-xl border border-neutral-border bg-white text-sm"
                              />
                            </div>
                          )}
                          {!isEmail && (
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    required: e.target.checked,
                                  })
                                }
                                disabled={!interactive}
                                className="h-4 w-4 rounded"
                              />
                              Required
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "design" && (
            <motion.div
              key="design"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-3"
            >
              <DesignSection
                title="Themes"
                open={designOpen.themes}
                onToggle={() =>
                  setDesignOpen((s) => ({ ...s, themes: !s.themes }))
                }
              >
                <div className="grid grid-cols-2 gap-2">
                  {LEAD_GATE_THEMES.map((theme) => {
                    const selected = config.themeId === theme.id;
                    return (
                    <button
                      key={theme.id}
                      type="button"
                      disabled={!interactive}
                      onClick={() => {
                        onConfigChange(applyLeadGateTheme(config, theme));
                        toast.success(`Applied ${theme.name}`);
                      }}
                      className={cn(
                        "rounded-xl border overflow-hidden text-left transition-colors disabled:opacity-50",
                        selected
                          ? "border-primary ring-2 ring-primary/25"
                          : "border-neutral-border hover:border-primary/60"
                      )}
                    >
                      <div
                        className="h-10"
                        style={{
                          background:
                            theme.style.backgroundStyle === "gradient"
                              ? `linear-gradient(135deg, ${theme.style.backgroundColor}, ${theme.style.gradientEnd || theme.style.accentColor})`
                              : theme.style.backgroundColor,
                        }}
                      />
                      <div className="px-2.5 py-2 flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ background: theme.style.accentColor }}
                        />
                        <span className="text-xs font-semibold text-neutral-text truncate flex-1">
                          {theme.name}
                        </span>
                        {selected && (
                          <span className="text-[10px] font-semibold text-primary shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                    </button>
                    );
                  })}
                </div>
              </DesignSection>

              <DesignSection
                title="Background"
                open={designOpen.background}
                onToggle={() =>
                  setDesignOpen((s) => ({ ...s, background: !s.background }))
                }
              >
                <div className="flex gap-2">
                  {(["gradient", "solid"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={!interactive}
                      onClick={() => updateStyle({ backgroundStyle: opt })}
                      className={cn(
                        "h-9 px-3 rounded-xl text-xs font-semibold border capitalize",
                        config.style.backgroundStyle === opt
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-neutral-border bg-white text-neutral-muted"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <ColorPickerWithInput
                  label="Background color"
                  value={config.style.backgroundColor}
                  onChange={(backgroundColor) =>
                    updateStyle({ backgroundColor })
                  }
                  disabled={!interactive}
                />
                {config.style.backgroundStyle === "gradient" && (
                  <ColorPickerWithInput
                    label="Gradient end"
                    value={
                      config.style.gradientEnd || config.style.accentColor
                    }
                    onChange={(gradientEnd) => updateStyle({ gradientEnd })}
                    disabled={!interactive}
                  />
                )}
              </DesignSection>

              <DesignSection
                title="Colors"
                open={designOpen.colors}
                onToggle={() =>
                  setDesignOpen((s) => ({ ...s, colors: !s.colors }))
                }
              >
                <ColorPickerWithInput
                  label="Accent"
                  value={config.style.accentColor}
                  onChange={(accentColor) => updateStyle({ accentColor })}
                  disabled={!interactive}
                />
                <ColorPickerWithInput
                  label="Text"
                  value={config.style.textColor}
                  onChange={(textColor) => updateStyle({ textColor })}
                  disabled={!interactive}
                />
                <ColorPickerWithInput
                  label="Card"
                  value={config.style.cardBackground}
                  onChange={(cardBackground) =>
                    updateStyle({ cardBackground })
                  }
                  disabled={!interactive}
                />
                <ColorPickerWithInput
                  label="Button text"
                  value={config.style.buttonTextColor}
                  onChange={(buttonTextColor) =>
                    updateStyle({ buttonTextColor })
                  }
                  disabled={!interactive}
                />
              </DesignSection>

              <DesignSection
                title="Button"
                open={designOpen.button}
                onToggle={() =>
                  setDesignOpen((s) => ({ ...s, button: !s.button }))
                }
              >
                <div className="flex gap-2">
                  {(["filled", "soft"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={!interactive}
                      onClick={() => updateStyle({ buttonVariant: opt })}
                      className={cn(
                        "h-9 px-3 rounded-xl text-xs font-semibold border capitalize",
                        config.style.buttonVariant === opt
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-neutral-border bg-white text-neutral-muted"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <SliderWithInput
                  label="Border radius"
                  value={config.style.buttonBorderRadius}
                  onChange={(buttonBorderRadius) =>
                    updateStyle({ buttonBorderRadius })
                  }
                  min={0}
                  max={48}
                />
              </DesignSection>

              <DesignSection
                title="Typography"
                open={designOpen.type}
                onToggle={() =>
                  setDesignOpen((s) => ({ ...s, type: !s.type }))
                }
              >
                <FontSelector
                  value={config.style.fontFamily}
                  onChange={(fontFamily) => updateStyle({ fontFamily })}
                />
              </DesignSection>

              <DesignSection
                title="Card"
                open={designOpen.card}
                onToggle={() =>
                  setDesignOpen((s) => ({ ...s, card: !s.card }))
                }
              >
                <div className="flex flex-wrap gap-2">
                  {(["elevated", "flat", "bordered"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={!interactive}
                      onClick={() => updateStyle({ cardStyle: opt })}
                      className={cn(
                        "h-9 px-3 rounded-xl text-xs font-semibold border capitalize",
                        config.style.cardStyle === opt
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-neutral-border bg-white text-neutral-muted"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </DesignSection>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div className="rounded-xl border border-neutral-border bg-white p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-text">
                        Lead gate
                      </p>
                      <p className="text-xs text-neutral-muted">
                        Collect info before redirect
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={enabled && isPremium}
                    onChange={handleEnable}
                    disabled={locked}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-neutral-border/80 bg-neutral-bg/60 p-4 text-xs text-neutral-muted leading-relaxed space-y-2">
                <p className="font-semibold text-neutral-text">How it works</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Visitor opens your short link</li>
                  <li>Password gate runs first (if enabled)</li>
                  <li>Lead form appears; responses are saved</li>
                  <li>Visitor is redirected to the destination</li>
                </ol>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        <div className="p-4 pb-6 border-t border-neutral-border/70 bg-white/90 shrink-0">
          {footer}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0 bg-[#F3F5FA]">
        <div className="shrink-0 px-5 py-3.5 border-b border-neutral-border/70 bg-white/80 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Eye className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-text tracking-tight">
                Live gate preview
              </h2>
              <p className="text-[11px] text-neutral-muted">
                {enabled
                  ? "Updates as you edit"
                  : "Enable the gate to preview"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-full bg-white border border-neutral-border/80 shadow-soft">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={cn(
                "p-2 rounded-full transition-colors",
                previewDevice === "desktop"
                  ? "bg-primary text-white shadow-button"
                  : "text-neutral-muted hover:text-neutral-text"
              )}
              aria-label="Desktop preview"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={cn(
                "p-2 rounded-full transition-colors",
                previewDevice === "mobile"
                  ? "bg-primary text-white shadow-button"
                  : "text-neutral-muted hover:text-neutral-text"
              )}
              aria-label="Mobile preview"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className={cn(
            "flex-1 min-h-0 overflow-hidden",
            previewDevice === "mobile"
              ? "flex justify-center items-stretch p-5 sm:p-8"
              : "flex flex-col"
          )}
        >
          {!enabled ? (
            <div className="m-auto max-w-sm text-center rounded-2xl border border-dashed border-neutral-border bg-white/60 px-6 py-12">
              <Mail className="h-8 w-8 text-neutral-muted mx-auto mb-3" />
              <p className="text-sm font-semibold text-neutral-text mb-1">
                Lead gate is off
              </p>
              <p className="text-xs text-neutral-muted">
                Turn it on in Settings to design the form visitors see before
                redirect.
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "overflow-hidden bg-white shadow-premium flex flex-col",
                previewDevice === "mobile"
                  ? "w-full max-w-[390px] h-full max-h-full rounded-[1.75rem] border border-neutral-border/80 ring-4 ring-black/5"
                  : "w-full h-full min-h-0 rounded-none border-0"
              )}
            >
              <LeadGateForm
                config={config}
                linkTitle={linkTitle || null}
                mode="preview"
                className="h-full min-h-full flex-1"
              />
            </div>
          )}
        </div>
      </div>
      </div>
    </motion.div>
  );
}
