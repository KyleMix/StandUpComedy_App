import { NormalizedMicT } from "../types";

export type FetchArgs = {
  cities: { city: string; state?: string }[];
  radiusMiles: number;
  windowDays: number;
  now: Date;
};

export async function fetchOpenMics(_args: FetchArgs): Promise<NormalizedMicT[]> {
  if (process.env.ENABLE_REDDIT_OPENMICS === "true") {
    // TODO: Implement Reddit ingestion respecting API terms.
  }
  return [];
}
