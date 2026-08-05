import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand accents — use sparingly (CTAs, focus, highlights)
        "neon-pink": "#f72585",
        "raspberry-plum": "#b5179e",
        "indigo-bloom": "#7209b7",
        "ultrasonic-blue": "#560bad",
        "true-azure": "#480ca8",
        "vivid-royal": "#3a0ca3",
        "bright-indigo": "#3f37c9",
        "electric-sapphire": "#4361ee",
        "blue-energy": "#4895ef",
        "sky-aqua": "#4cc9f0",
        primary: {
          DEFAULT: "#4361ee", // electric-sapphire
          dark: "#3a0ca3",
          light: "#4895ef",
        },
        accent: {
          DEFAULT: "#f72585",
          dark: "#b5179e",
        },
        // Soft product canvas
        neutral: {
          bg: "#F3F5FA",
          surface: "#EEF1F8",
          border: "#E6EAF2",
          text: "#111827",
          muted: "#6B7280",
          zebra: "#F3F5FA",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.03em", fontWeight: "650" }],
        title: ["1.75rem", { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["0.8125rem", { lineHeight: "1.4", fontWeight: "400" }],
      },
      spacing: {
        "8pt": "8px",
        "16pt": "16px",
        "24pt": "24px",
        "32pt": "32px",
      },
      borderRadius: {
        input: "14px",
        card: "20px",
        special: "24px",
      },
      animation: {
        "slide-reveal": "slideReveal 200ms ease-out",
        "scale-down": "scaleDown 150ms ease-out",
        "fade-in": "fadeIn 200ms ease-out",
        "scale-in": "scaleIn 200ms ease-out",
      },
      keyframes: {
        slideReveal: {
          "0%": { transform: "translateY(-4px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleDown: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(0.98)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      // Fluid elevation — soft depth without harsh multi-layer stacks
      boxShadow: {
        soft: "0 1px 2px rgba(17, 24, 39, 0.04), 0 8px 24px rgba(67, 97, 238, 0.06)",
        hover: "0 4px 12px rgba(17, 24, 39, 0.06), 0 16px 40px rgba(67, 97, 238, 0.10)",
        button: "0 4px 14px rgba(67, 97, 238, 0.28)",
        premium: "0 12px 40px rgba(67, 97, 238, 0.12)",
        float: "0 20px 50px rgba(17, 24, 39, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
