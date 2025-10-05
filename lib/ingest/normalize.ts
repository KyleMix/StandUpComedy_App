import { parseISO } from "date-fns";

export interface NormalizedLead {
  title?: string;
  startsAt?: string;
  venue?: {
    name?: string;
    address?: string;
  };
  signUpHint?: string;
  externalUrl?: string;
}

function extractDate(text?: string): string | undefined {
  if (!text) return undefined;
  const match = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (match) {
    const date = parseISO(match[1]);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return undefined;
}

export function normalizeLeadFromSnippet(snippet?: string): NormalizedLead {
  if (!snippet) return {};
  const startsAt = extractDate(snippet);
  return {
    startsAt,
    signUpHint: snippet,
  };
}
