"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { Laptop2, MoonStar, SunMedium } from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ThemeValue = "light" | "dark" | "system";

const themeOptions: { label: string; value: ThemeValue; icon: ComponentType<{ className?: string }> }[] = [
  { label: "Light", value: "light", icon: SunMedium },
  { label: "Dark", value: "dark", icon: MoonStar },
  { label: "System", value: "system", icon: Laptop2 }
];

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedValue = useMemo<ThemeValue>(() => {
    if (!mounted) return "system";
    if (theme === "system") {
      return (resolvedTheme as ThemeValue | undefined) ?? "system";
    }
    return (theme as ThemeValue) ?? "system";
  }, [mounted, resolvedTheme, theme]);

  const currentTheme = mounted ? (theme ?? "system") : "system";
  const activeValue = currentTheme === "system" ? resolvedValue : currentTheme;
  const ActiveIcon = themeOptions.find((option) => option.value === activeValue)?.icon ?? SunMedium;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-9 w-9 rounded-full border border-border/70 bg-background/80 shadow-sm backdrop-blur",
            className
          )}
          aria-label="Toggle theme"
        >
          <ActiveIcon className="h-4 w-4" aria-hidden />
          <span className="sr-only">Change theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-44">
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={currentTheme}
          onValueChange={(value) => setTheme(value as ThemeValue)}
          aria-label="Select color theme"
        >
          {themeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuRadioItem key={option.value} value={option.value} className="gap-2">
                <Icon className="h-4 w-4" aria-hidden />
                <span>{option.label}</span>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
