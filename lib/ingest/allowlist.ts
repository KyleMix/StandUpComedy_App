import type { AllowlistSource } from "@prisma/client";

export interface AllowlistEntry {
  domain: string;
  label: string;
  enabled: boolean;
}

export const STARTER_ALLOWLIST: AllowlistEntry[] = [
  { domain: "badslava.com", label: "BadSlava", enabled: true },
  { domain: "openmic.us", label: "OpenMic.US", enabled: true },
  { domain: "openmikes.org", label: "OpenMikes.org", enabled: true },
  { domain: "nwstandup.com", label: "Northwest Standup", enabled: true },
  { domain: "seattlesoundcomedy.com", label: "Seattle Sound Comedy", enabled: true },
  { domain: "comedylistings.com", label: "Comedy Listings (PDX/SEA)", enabled: true },
  { domain: "comedyunderground.com", label: "Comedy Underground (SEA)", enabled: true },
  { domain: "lacomedyguide.com", label: "LA Comedy Guide", enabled: true },
  {
    domain: "reddit.com/r/Standup/wiki/local_groups",
    label: "r/Standup wiki",
    enabled: true,
  },
];

export type AllowlistSourceRecord = Pick<AllowlistSource, "id" | "domain" | "label" | "enabled" | "lastCheckedAt">;

export const ALLOWLIST_DOC = `The Funny ingestion allowlist only queries public gig calendars. Respect each site's robots.txt and honor request rate limits. Private or paid platforms like Eventbrite or Ticketmaster are excluded.`;
