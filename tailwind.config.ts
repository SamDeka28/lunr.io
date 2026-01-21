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
        // Premium Purple-Blue Gradient Palette
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
        // Semantic color mappings
        primary: {
          DEFAULT: "#4361ee", // electric-sapphire - Primary actions
          dark: "#3a0ca3", // vivid-royal - Darker variant
          light: "#4895ef", // blue-energy - Lighter variant
        },
        accent: {
          DEFAULT: "#f72585", // neon-pink - Accent highlights
          dark: "#b5179e", // raspberry-plum - Darker accent
        },
        neutral: {
          bg: "#FAFBFC", // Very light background
          border: "#E5E7EB", // Light border
          text: "#111827", // Dark text
          muted: "#6B7280", // Muted text
          "zebra": "#F9FAFB", // Zebra stripe
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        "8pt": "8px",
        "16pt": "16px",
        "24pt": "24px",
        "32pt": "32px",
      },
      borderRadius: {
        "input": "8px",
        "card": "12px",
        "special": "16px",
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
      boxShadow: {
        "soft": "0 2px 8px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)",
        "hover": "0 8px 16px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.06)",
        "button": "0 2px 4px rgba(67, 97, 238, 0.2)",
        "premium": "0 4px 20px rgba(67, 97, 238, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
