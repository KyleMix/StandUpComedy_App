const FALLBACK = "the-funny";

const sanitizeSeed = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function avatarFor(name: string, avatarUrl?: string): string {
  if (avatarUrl && avatarUrl.trim().length > 0) {
    return avatarUrl;
  }

  const seed = sanitizeSeed(name);
  const finalSeed = seed.length > 0 ? seed : FALLBACK;

  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(finalSeed)}`;
}
