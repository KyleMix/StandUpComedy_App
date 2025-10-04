import {
  ALLOWED_DOMAINS, PREFERRED_PATH_HINTS, CSE_KEYWORDS, MEETUP_KEYWORDS, SEED_CITIES
} from "@/config/openmic.allowlist";

const envDomains = (process.env.OPENMIC_ALLOWED_SITES ?? "")
  .split(";")
  .map((d) => d.trim())
  .filter(Boolean);

export const Allowlist = {
  domains: new Set<string>([...ALLOWED_DOMAINS, ...envDomains]),
  preferredPathHints: PREFERRED_PATH_HINTS,
  cseKeywords: CSE_KEYWORDS,
  meetupKeywords: MEETUP_KEYWORDS,
  seedCities: SEED_CITIES,
};

export function isAllowedUrl(url: string): boolean {
  try { const u = new URL(url); return Array.from(Allowlist.domains).some(d => u.hostname.endsWith(d)); }
  catch { return false; }
}
export function looksLikeOpenMicPath(pathname: string): boolean {
  const p = pathname.toLowerCase();
  return Allowlist.preferredPathHints.some(h => p.includes(h));
}
