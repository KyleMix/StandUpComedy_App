"use client";

import { type ComponentProps, type ComponentType } from "react";
import * as Lucide from "lucide-react";
import * as HeroOutline from "@heroicons/react/24/outline";
import * as HeroSolid from "@heroicons/react/24/solid";
import { Star, MapPin, ChatsCircle } from "phosphor-react";

type IconSet = "lucide" | "hero-outline" | "hero-solid" | "phosphor";

type LucideModule = typeof Lucide;
type HeroOutlineModule = typeof HeroOutline;
type HeroSolidModule = typeof HeroSolid;

const lucideIcons = Lucide as unknown as Record<string, ComponentType<ComponentProps<"svg">>>;
const heroOutlineIcons = HeroOutline as Record<string, ComponentType<ComponentProps<"svg">>>;
const heroSolidIcons = HeroSolid as Record<string, ComponentType<ComponentProps<"svg">>>;
const phosphorIcons = { Star, MapPin, ChatsCircle } satisfies Record<string, ComponentType<ComponentProps<"svg">>>;

type IconName =
  | keyof LucideModule
  | keyof HeroOutlineModule
  | keyof HeroSolidModule
  | keyof typeof phosphorIcons;

const FALLBACKS: Record<IconSet, ComponentType<ComponentProps<"svg">>> = {
  lucide: Lucide.HelpCircle,
  "hero-outline": HeroOutline.QuestionMarkCircleIcon,
  "hero-solid": HeroSolid.QuestionMarkCircleIcon,
  phosphor: Star,
};

const ICON_MAP: Record<IconSet, Record<string, ComponentType<ComponentProps<"svg">>>> = {
  lucide: lucideIcons,
  "hero-outline": heroOutlineIcons,
  "hero-solid": heroSolidIcons,
  phosphor: phosphorIcons,
};

export function Icon({ name, set = "lucide", ...props }: { name: IconName; set?: IconSet } & ComponentProps<"svg">) {
  const icons = ICON_MAP[set];
  const Cmp = icons[name as string] ?? FALLBACKS[set];
  return <Cmp aria-hidden {...props} />;
}
