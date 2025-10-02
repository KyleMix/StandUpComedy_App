export type AssetProvider =
  | "Unsplash"
  | "Pexels"
  | "Pixabay"
  | "unDraw"
  | "Heroicons"
  | "Lucide"
  | "Tabler"
  | "Phosphor"
  | "DiceBear"
  | "OpenMoji"
  | "Google Fonts"
  | "Hero Patterns"
  | "Haikei";

type LicenseEntry = {
  name: AssetProvider;
  license: string;
  url: string;
  attributionRequired: boolean;
  notes: string;
};

export const LICENSE_DIRECTORY: Record<AssetProvider, LicenseEntry> = {
  Unsplash: {
    name: "Unsplash",
    license: "Unsplash License",
    url: "https://unsplash.com/license",
    attributionRequired: false,
    notes: "Free photos for commercial and non-commercial use; attribution appreciated but optional."
  },
  Pexels: {
    name: "Pexels",
    license: "Pexels License",
    url: "https://www.pexels.com/license/",
    attributionRequired: false,
    notes: "Free stock photos and videos for commercial use with some prohibited use cases."
  },
  Pixabay: {
    name: "Pixabay",
    license: "Pixabay License",
    url: "https://pixabay.com/service/license/",
    attributionRequired: false,
    notes: "Free content for commercial use; cannot resell unaltered copies or portray identifiable people poorly."
  },
  unDraw: {
    name: "unDraw",
    license: "unDraw License",
    url: "https://undraw.co/license",
    attributionRequired: false,
    notes: "Open-source illustrations for personal and commercial use without attribution."
  },
  Heroicons: {
    name: "Heroicons",
    license: "MIT License",
    url: "https://github.com/tailwindlabs/heroicons/blob/master/LICENSE",
    attributionRequired: false,
    notes: "Free MIT-licensed icons from Tailwind Labs."
  },
  Lucide: {
    name: "Lucide",
    license: "ISC License (MIT-compatible)",
    url: "https://github.com/lucide-icons/lucide/blob/main/LICENSE",
    attributionRequired: false,
    notes: "Open-source icon set forked from Feather icons."
  },
  Tabler: {
    name: "Tabler",
    license: "MIT License",
    url: "https://github.com/tabler/tabler-icons/blob/master/LICENSE",
    attributionRequired: false,
    notes: "Extensive MIT-licensed icon set."
  },
  Phosphor: {
    name: "Phosphor",
    license: "MIT License",
    url: "https://github.com/phosphor-icons/phosphor-home/blob/master/LICENSE",
    attributionRequired: false,
    notes: "Flexible icon family for interfaces, diagrams, and presentations."
  },
  DiceBear: {
    name: "DiceBear",
    license: "DiceBear License",
    url: "https://www.dicebear.com/licenses",
    attributionRequired: false,
    notes: "Code is MIT; check each sprite style for specific attribution needs."
  },
  OpenMoji: {
    name: "OpenMoji",
    license: "CC BY-SA 4.0",
    url: "https://openmoji.org/license/",
    attributionRequired: true,
    notes: "Attribution required when using OpenMoji emoji."
  },
  "Google Fonts": {
    name: "Google Fonts",
    license: "Multiple OSS licenses",
    url: "https://developers.google.com/fonts/licensing",
    attributionRequired: false,
    notes: "Open-source font families for personal and commercial projects."
  },
  "Hero Patterns": {
    name: "Hero Patterns",
    license: "MIT License",
    url: "https://www.heropatterns.com/",
    attributionRequired: false,
    notes: "SVG background patterns generator served locally."
  },
  Haikei: {
    name: "Haikei",
    license: "Haikei License",
    url: "https://app.haikei.app/",
    attributionRequired: false,
    notes: "Generated organic SVG backgrounds exported and served locally."
  }
};

export function requiresAttribution(provider: AssetProvider) {
  return LICENSE_DIRECTORY[provider].attributionRequired;
}

export function getLicenseEntry(provider: AssetProvider) {
  return LICENSE_DIRECTORY[provider];
}
