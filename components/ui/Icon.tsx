"use client";

import { type ComponentProps, type ComponentType } from "react";
import * as Lucide from "lucide-react";
import { Star, MapPin, ChatsCircle } from "phosphor-react";

type IconSet = "lucide" | "phosphor";

type IconName = keyof typeof Lucide | "Star" | "MapPin" | "ChatsCircle";

export function Icon({ name, set = "lucide", ...props }: { name: IconName; set?: IconSet } & ComponentProps<"svg">) {
  if (set === "lucide") {
    const Cmp = (Lucide as Record<string, ComponentType<ComponentProps<"svg">>>)[name as string] ?? Lucide.HelpCircle;
    return <Cmp aria-hidden {...props} />;
  }
  const map: Record<string, any> = { Star, MapPin, ChatsCircle };
  const Cmp = map[name as string] ?? Star;
  return <Cmp aria-hidden {...props} />;
}
