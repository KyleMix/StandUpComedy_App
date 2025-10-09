"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect, type ReactNode } from "react";

type ThemeProviderProps = {
  children: ReactNode;
};

function ThemeSync() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const activeTheme = (theme === "system" ? resolvedTheme : theme) ?? "light";
    document.body.dataset.theme = activeTheme === "dark" ? "dark" : "thefunny";
  }, [theme, resolvedTheme]);

  return null;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      value={{ light: "light", dark: "dark" }}
    >
      <ThemeSync />
      {children}
    </NextThemesProvider>
  );
}
