import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import animatePlugin from "tailwindcss-animate";
import daisyui from "daisyui";

const spacingScale = {
  px: "1px",
  0: "0px",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  4.5: "1.125rem",
  5: "1.25rem",
  5.5: "1.375rem",
  6: "1.5rem",
  6.5: "1.625rem",
  7: "1.75rem",
  7.5: "1.875rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  18: "4.5rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  44: "11rem",
  48: "12rem",
  52: "13rem",
  56: "14rem",
  60: "15rem",
  64: "16rem",
  72: "18rem",
  80: "20rem",
  96: "24rem"
} as const;

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1200px"
      }
    },
    spacing: spacingScale,
    extend: {
      colors: {
        brand: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          muted: "hsl(var(--primary) / 0.14)",
          dark: "hsl(var(--primary) / 0.7)"
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        display: ["var(--font-display)", ...defaultTheme.fontFamily.sans]
      },
      backgroundImage: {
        "grid-dots": "radial-gradient(currentColor 1px, transparent 1px)",
        "subtle-radial":
          "radial-gradient(120% 120% at 50% -20%, hsl(var(--accent) / 0.18), transparent 60%)"
      },
      boxShadow: {
        glow: "0 1px 2px hsl(var(--shadow-color) / 0.12), 0 16px 48px -12px hsl(var(--shadow-color) / 0.28)"
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
