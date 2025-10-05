import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import animatePlugin from "tailwindcss-animate";
import daisyui from "daisyui";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        display: ["var(--font-display)", ...defaultTheme.fontFamily.sans]
      },
      colors: {
        brand: {
          DEFAULT: "#0f172a",
          dark: "#0b1120",
          light: "#1e293b"
        }
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      }
    }
  },
  daisyui: {
    themes: [
      {
        standup: {
          primary: "#0f172a",
          "primary-content": "#f8fafc",
          secondary: "#1e293b",
          accent: "#f97316",
          neutral: "#0b1120",
          "base-100": "#ffffff",
          "base-200": "#f1f5f9",
          "base-300": "#e2e8f0",
          info: "#0ea5e9",
          success: "#22c55e",
          warning: "#facc15",
          error: "#ef4444"
        }
      },
      "light",
      "dark"
    ]
  },
  plugins: [animatePlugin, daisyui]
};

export default config;
