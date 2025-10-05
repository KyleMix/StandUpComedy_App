import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import animatePlugin from "tailwindcss-animate";
import daisyui from "daisyui";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        manrope: ["var(--font-manrope)", ...defaultTheme.fontFamily.sans],
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans]
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          lg: "2rem",
          xl: "3rem"
        }
      },
      backgroundImage: {
        "grid-dots": "radial-gradient(currentColor 1px, transparent 1px)"
      }
    }
  },
  daisyui: {
    themes: [
      {
        thefunny: {
          primary: "#FFD166",
          "primary-content": "#1F2937",
          secondary: "#6C63FF",
          "secondary-content": "#F9FAFB",
          accent: "#06D6A0",
          "accent-content": "#0B0F15",
          neutral: "#1F2937",
          "neutral-content": "#F9FAFB",
          "base-100": "#0B0F15",
          "base-200": "#131A24",
          "base-300": "#1B2430",
          "base-content": "#E5E7EB",
          info: "#38BDF8",
          success: "#22C55E",
          warning: "#F59E0B",
          error: "#EF4444"
        }
      },
      "dark"
    ]
  },
  plugins: [animatePlugin, daisyui]
};

export default config;
