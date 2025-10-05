import crypto from "node:crypto";
import { URL } from "node:url";
import type { AllowlistEntry } from "../allowlist";

export interface GoogleCseResult {
  url: string;
  title?: string;
  snippet?: string;
}

export interface GoogleCseSearchParams {
  entry: AllowlistEntry;
  query: string;
  geoContext?: string;
}

export interface GoogleCseSearchResult {
  results: GoogleCseResult[];
  nextPage?: string;
}

const GOOGLE_ENDPOINT = "https://www.googleapis.com/customsearch/v1";

function buildQuery(entry: AllowlistEntry, geoContext?: string): string {
  const base = `site:${entry.domain} ("open mic" OR "comedy" OR "standup") (signup OR "sign up" OR "booked show" OR "open mic")`;
  return geoContext ? `${base} ${geoContext}` : base;
}

export async function searchGoogleCse({ entry, query, geoContext }: GoogleCseSearchParams): Promise<GoogleCseSearchResult> {
  const apiKey = process.env.GOOGLE_CSE_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  if (!apiKey || !cx) {
    return { results: [] };
  }
  const url = new URL(GOOGLE_ENDPOINT);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", query || buildQuery(entry, geoContext));
  url.searchParams.set("num", "10");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "TheFunnyLeadFetcher/1.0 (+https://thefunny.app)",
    },
  });
  if (!response.ok) {
    const body = await response.text();
    console.error(`Google CSE error ${response.status}: ${body}`);
    return { results: [] };
  }
  const data = (await response.json()) as {
    items?: Array<{ link: string; title?: string; snippet?: string }>;
    queries?: { nextPage?: Array<{ startIndex: number }> };
  };
  const results: GoogleCseResult[] = (data.items ?? []).map((item) => ({
    url: item.link,
    title: item.title,
    snippet: item.snippet,
  }));
  const nextPageIndex = data.queries?.nextPage?.[0]?.startIndex;
  return {
    results,
    nextPage: nextPageIndex ? `${url.toString()}&start=${nextPageIndex}` : undefined,
  };
}

export function hashResult(result: GoogleCseResult): string {
  return crypto.createHash("sha1").update(result.url).digest("hex");
}
