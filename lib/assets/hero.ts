export type HeroAssetSource = "Unsplash" | "Pexels" | "Pixabay" | "Generated";

type HeroAsset = {
  filename: string;
  source: HeroAssetSource;
  alt: string;
  credit?: { author: string; url: string };
};

type HeroVideo = {
  filename: string;
  source: Exclude<HeroAssetSource, "Generated">;
  credit: { author: string; url: string };
};

export const HERO_IMAGE_MANIFEST: HeroAsset[] = [
  {
    filename: "stage-lights.svg",
    source: "Generated",
    alt: "Spotlights shining onto a comedy stage backdrop"
  }
];

export const HERO_VIDEO_MANIFEST: HeroVideo[] = [
  {
    filename: "crowd-pan-pexels.mp4",
    source: "Pexels",
    credit: {
      author: "To be added",
      url: "https://www.pexels.com/videos/"
    }
  }
];
