export type LeadFieldType =
  | "email"
  | "text"
  | "phone"
  | "textarea"
  | "select"
  | "checkbox";

export type LeadCaptureField = {
  id: string;
  type: LeadFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
};

export type LeadButtonVariant = "filled" | "soft";

export type LeadCaptureStyle = {
  accentColor: string;
  backgroundColor: string;
  backgroundStyle: "solid" | "gradient";
  cardStyle: "elevated" | "flat" | "bordered";
  textColor: string;
  buttonTextColor: string;
  cardBackground: string;
  fontFamily: string;
  buttonBorderRadius: number;
  buttonVariant: LeadButtonVariant;
  gradientEnd?: string;
  logoUrl?: string;
  showLinkTitle: boolean;
};

export type LeadCaptureConfig = {
  heading: string;
  description: string;
  buttonText: string;
  fields: LeadCaptureField[];
  style: LeadCaptureStyle;
  /** Active theme preset id, if any */
  themeId?: string | null;
};

export type LeadFieldResponses = Record<string, string | boolean>;

export type LeadGateTheme = {
  id: string;
  name: string;
  style: Partial<LeadCaptureStyle> &
    Pick<
      LeadCaptureStyle,
      | "accentColor"
      | "backgroundColor"
      | "backgroundStyle"
      | "cardStyle"
      | "textColor"
      | "buttonTextColor"
      | "cardBackground"
      | "fontFamily"
    >;
};

const DEFAULT_ACCENT = "#4F46E5";

const FIELD_TYPES: LeadFieldType[] = [
  "email",
  "text",
  "phone",
  "textarea",
  "select",
  "checkbox",
];

export function createLeadFieldId(type: LeadFieldType): string {
  return `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function defaultLeadCaptureStyle(): LeadCaptureStyle {
  return {
    accentColor: DEFAULT_ACCENT,
    backgroundColor: "#EEF2FF",
    backgroundStyle: "gradient",
    cardStyle: "elevated",
    textColor: "#171717",
    buttonTextColor: "#FFFFFF",
    cardBackground: "#FFFFFF",
    fontFamily: "Inter",
    buttonBorderRadius: 12,
    buttonVariant: "filled",
    gradientEnd: "#C7D2FE",
    logoUrl: undefined,
    showLinkTitle: true,
  };
}

export function defaultLeadCaptureConfig(): LeadCaptureConfig {
  return {
    heading: "Enter your email to continue",
    description: "Share your email to unlock this link.",
    buttonText: "Continue",
    fields: [
      {
        id: "email",
        type: "email",
        label: "Email",
        placeholder: "you@example.com",
        required: true,
      },
      {
        id: "name",
        type: "text",
        label: "Name",
        placeholder: "Your name",
        required: false,
      },
    ],
    style: defaultLeadCaptureStyle(),
    themeId: "indigo",
  };
}

export const LEAD_GATE_THEMES: LeadGateTheme[] = [
  {
    id: "indigo",
    name: "Indigo",
    style: {
      accentColor: "#4F46E5",
      backgroundColor: "#EEF2FF",
      backgroundStyle: "gradient",
      cardStyle: "elevated",
      textColor: "#171717",
      buttonTextColor: "#FFFFFF",
      cardBackground: "#FFFFFF",
      fontFamily: "Inter",
      buttonBorderRadius: 12,
      buttonVariant: "filled",
      gradientEnd: "#C7D2FE",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    style: {
      accentColor: "#38BDF8",
      backgroundColor: "#0F172A",
      backgroundStyle: "solid",
      cardStyle: "elevated",
      textColor: "#F8FAFC",
      buttonTextColor: "#0F172A",
      cardBackground: "#1E293B",
      fontFamily: "Inter",
      buttonBorderRadius: 10,
      buttonVariant: "filled",
      gradientEnd: undefined,
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    style: {
      accentColor: "#171717",
      backgroundColor: "#FAFAFA",
      backgroundStyle: "solid",
      cardStyle: "bordered",
      textColor: "#171717",
      buttonTextColor: "#FFFFFF",
      cardBackground: "#FFFFFF",
      fontFamily: "Inter",
      buttonBorderRadius: 8,
      buttonVariant: "filled",
      gradientEnd: undefined,
    },
  },
  {
    id: "coral",
    name: "Coral",
    style: {
      accentColor: "#F43F5E",
      backgroundColor: "#FFF1F2",
      backgroundStyle: "gradient",
      cardStyle: "elevated",
      textColor: "#1C1917",
      buttonTextColor: "#FFFFFF",
      cardBackground: "#FFFFFF",
      fontFamily: "Poppins",
      buttonBorderRadius: 999,
      buttonVariant: "filled",
      gradientEnd: "#FFE4E6",
    },
  },
  {
    id: "forest",
    name: "Forest",
    style: {
      accentColor: "#059669",
      backgroundColor: "#ECFDF5",
      backgroundStyle: "gradient",
      cardStyle: "elevated",
      textColor: "#064E3B",
      buttonTextColor: "#FFFFFF",
      cardBackground: "#FFFFFF",
      fontFamily: "Nunito",
      buttonBorderRadius: 14,
      buttonVariant: "soft",
      gradientEnd: "#A7F3D0",
    },
  },
  {
    id: "serif",
    name: "Editorial",
    style: {
      accentColor: "#B45309",
      backgroundColor: "#FFFBEB",
      backgroundStyle: "solid",
      cardStyle: "flat",
      textColor: "#1C1917",
      buttonTextColor: "#FFFBEB",
      cardBackground: "#FFFFFF",
      fontFamily: "Playfair Display",
      buttonBorderRadius: 4,
      buttonVariant: "filled",
      gradientEnd: undefined,
    },
  },
];

function isFieldType(value: unknown): value is LeadFieldType {
  return typeof value === "string" && FIELD_TYPES.includes(value as LeadFieldType);
}

function normalizeField(raw: unknown, index: number): LeadCaptureField | null {
  if (!raw || typeof raw !== "object") return null;
  const f = raw as Record<string, unknown>;
  if (!isFieldType(f.type)) return null;

  const id =
    typeof f.id === "string" && f.id.trim()
      ? f.id.trim()
      : `${f.type}-${index}`;

  const label =
    typeof f.label === "string" && f.label.trim()
      ? f.label.trim()
      : f.type === "email"
        ? "Email"
        : "Field";

  const field: LeadCaptureField = {
    id,
    type: f.type,
    label,
    required: f.type === "email" ? true : Boolean(f.required),
  };

  if (typeof f.placeholder === "string") {
    field.placeholder = f.placeholder;
  }

  if (f.type === "select") {
    const options = Array.isArray(f.options)
      ? f.options.map((o) => String(o).trim()).filter(Boolean)
      : typeof f.options === "string"
        ? String(f.options)
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean)
        : [];
    field.options = options.length > 0 ? options : ["Option 1", "Option 2"];
  }

  return field;
}

export function normalizeLeadCaptureConfig(raw: unknown): LeadCaptureConfig {
  const defaults = defaultLeadCaptureConfig();
  if (!raw || typeof raw !== "object") return defaults;

  const c = raw as Record<string, unknown>;
  const styleRaw =
    c.style && typeof c.style === "object"
      ? (c.style as Record<string, unknown>)
      : {};

  let fields = Array.isArray(c.fields)
    ? c.fields
        .map((f, i) => normalizeField(f, i))
        .filter((f): f is LeadCaptureField => !!f)
    : [];

  const emailFields = fields.filter((f) => f.type === "email");
  if (emailFields.length === 0) {
    fields = [defaults.fields[0], ...fields];
  } else if (emailFields.length > 1) {
    const keep = emailFields[0];
    keep.required = true;
    fields = [keep, ...fields.filter((f) => f.type !== "email")];
  } else {
    emailFields[0].required = true;
  }

  const seen = new Set<string>();
  fields = fields.map((f, i) => {
    let id = f.id;
    if (seen.has(id)) {
      id = `${f.type}-${i}-${Math.random().toString(36).slice(2, 5)}`;
    }
    seen.add(id);
    return { ...f, id };
  });

  const ds = defaults.style;
  const radius =
    typeof styleRaw.buttonBorderRadius === "number"
      ? Math.min(48, Math.max(0, styleRaw.buttonBorderRadius))
      : ds.buttonBorderRadius;

  return {
    heading:
      typeof c.heading === "string" && c.heading.trim()
        ? c.heading.trim()
        : defaults.heading,
    description:
      typeof c.description === "string" ? c.description : defaults.description,
    buttonText:
      typeof c.buttonText === "string" && c.buttonText.trim()
        ? c.buttonText.trim()
        : defaults.buttonText,
    fields,
    style: {
      accentColor:
        typeof styleRaw.accentColor === "string" && styleRaw.accentColor
          ? styleRaw.accentColor
          : ds.accentColor,
      backgroundColor:
        typeof styleRaw.backgroundColor === "string" && styleRaw.backgroundColor
          ? styleRaw.backgroundColor
          : ds.backgroundColor,
      backgroundStyle:
        styleRaw.backgroundStyle === "solid" ? "solid" : "gradient",
      cardStyle:
        styleRaw.cardStyle === "flat" || styleRaw.cardStyle === "bordered"
          ? styleRaw.cardStyle
          : "elevated",
      textColor:
        typeof styleRaw.textColor === "string" && styleRaw.textColor
          ? styleRaw.textColor
          : ds.textColor,
      buttonTextColor:
        typeof styleRaw.buttonTextColor === "string" && styleRaw.buttonTextColor
          ? styleRaw.buttonTextColor
          : ds.buttonTextColor,
      cardBackground:
        typeof styleRaw.cardBackground === "string" && styleRaw.cardBackground
          ? styleRaw.cardBackground
          : ds.cardBackground,
      fontFamily:
        typeof styleRaw.fontFamily === "string" && styleRaw.fontFamily
          ? styleRaw.fontFamily
          : ds.fontFamily,
      buttonBorderRadius: radius,
      buttonVariant:
        styleRaw.buttonVariant === "soft" ? "soft" : "filled",
      gradientEnd:
        typeof styleRaw.gradientEnd === "string" && styleRaw.gradientEnd
          ? styleRaw.gradientEnd
          : undefined,
      logoUrl:
        typeof styleRaw.logoUrl === "string" && styleRaw.logoUrl
          ? styleRaw.logoUrl
          : undefined,
      showLinkTitle:
        typeof styleRaw.showLinkTitle === "boolean"
          ? styleRaw.showLinkTitle
          : true,
    },
    themeId:
      typeof c.themeId === "string" && c.themeId
        ? c.themeId
        : c.themeId === null
          ? null
          : defaults.themeId ?? null,
  };
}

export function getEmailField(config: LeadCaptureConfig): LeadCaptureField {
  return (
    config.fields.find((f) => f.type === "email") ||
    defaultLeadCaptureConfig().fields[0]
  );
}

export function getEmailFieldId(config: LeadCaptureConfig): string {
  return getEmailField(config).id;
}

export function extractNameFromResponses(
  config: LeadCaptureConfig,
  responses: LeadFieldResponses
): string | null {
  const nameField = config.fields.find(
    (f) => f.type === "text" && /^(full\s*)?name$/i.test(f.label.trim())
  );
  if (nameField) {
    const v = responses[nameField.id];
    return typeof v === "string" && v.trim() ? v.trim() : null;
  }
  const firstText = config.fields.find((f) => f.type === "text");
  if (firstText) {
    const v = responses[firstText.id];
    return typeof v === "string" && v.trim() ? v.trim() : null;
  }
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLeadResponses(
  config: LeadCaptureConfig,
  responses: LeadFieldResponses
):
  | { ok: true; email: string; name: string | null; responses: LeadFieldResponses }
  | { ok: false; error: string } {
  const normalized: LeadFieldResponses = {};

  for (const field of config.fields) {
    const raw = responses[field.id];

    if (field.type === "checkbox") {
      const checked = Boolean(raw);
      if (field.required && !checked) {
        return { ok: false, error: `${field.label} is required` };
      }
      normalized[field.id] = checked;
      continue;
    }

    const value =
      typeof raw === "string" ? raw.trim() : raw == null ? "" : String(raw).trim();

    if (field.required && !value) {
      return { ok: false, error: `${field.label} is required` };
    }

    if (!value) {
      normalized[field.id] = "";
      continue;
    }

    if (field.type === "email") {
      if (!EMAIL_RE.test(value)) {
        return { ok: false, error: "Invalid email address" };
      }
      normalized[field.id] = value.toLowerCase();
      continue;
    }

    if (field.type === "select") {
      const options = field.options || [];
      if (options.length > 0 && !options.includes(value)) {
        return { ok: false, error: `Invalid value for ${field.label}` };
      }
    }

    if (field.type === "phone" && value.length > 40) {
      return { ok: false, error: `${field.label} is too long` };
    }

    if (value.length > 2000) {
      return { ok: false, error: `${field.label} is too long` };
    }

    normalized[field.id] = value;
  }

  const emailField = getEmailField(config);
  const email = String(normalized[emailField.id] || "").toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Invalid email address" };
  }

  return {
    ok: true,
    email,
    name: extractNameFromResponses(config, normalized),
    responses: normalized,
  };
}

export function pageBackgroundCss(style: LeadCaptureStyle): string {
  if (style.backgroundStyle === "solid") {
    return style.backgroundColor;
  }
  const end = style.gradientEnd || `${style.accentColor}22`;
  return `linear-gradient(135deg, ${style.backgroundColor} 0%, ${end} 100%)`;
}

export function applyLeadGateTheme(
  config: LeadCaptureConfig,
  theme: LeadGateTheme
): LeadCaptureConfig {
  // Replace style from defaults + theme so prior theme keys (e.g. coral gradientEnd)
  // never bleed into the next preset.
  return normalizeLeadCaptureConfig({
    ...config,
    themeId: theme.id,
    style: {
      ...defaultLeadCaptureStyle(),
      ...theme.style,
      logoUrl: config.style.logoUrl,
      showLinkTitle: config.style.showLinkTitle,
      // Explicitly clear when theme omits gradientEnd
      gradientEnd: theme.style.gradientEnd,
    },
  });
}
