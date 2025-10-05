"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

type ThemeOption = "thefunny" | "dark";

const STORAGE_KEY = "thefunny.theme";

function applyTheme(theme: ThemeOption) {
  if (typeof document === "undefined") return;

  const html = document.documentElement;
  const body = document.body;

  if (theme === "dark") {
    html.classList.add("dark");
    body.classList.add("dark");
    body.dataset.theme = "dark";
  } else {
    html.classList.remove("dark");
    body.classList.remove("dark");
    body.dataset.theme = "thefunny";
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeOption>("thefunny");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeOption | null;
    const prefersDark = window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;
    const initial: ThemeOption = stored ?? (prefersDark ? "dark" : "thefunny");

    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeOption = theme === "dark" ? "thefunny" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    }
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn-ghost btn-sm btn-square focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/60"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
    >
      {isDark ? <SunIcon className="h-5 w-5" aria-hidden /> : <MoonIcon className="h-5 w-5" aria-hidden />}
    </button>
  );
}
