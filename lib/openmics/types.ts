import { z } from "zod";

export const NormalizedMic = z.object({
  source: z.string(),
  sourceId: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  url: z.string().url(),
  signupUrl: z.string().url().optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  startUtc: z.coerce.date().optional(),
  endUtc: z.coerce.date().optional(),
  recurrence: z.string().optional(),
  venueName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  isFree: z.boolean().optional(),
  tags: z.array(z.string()).default([]),
  imageUrl: z.string().url().optional(),
  scrapedHash: z.string().optional(),
});
export type NormalizedMicT = z.infer<typeof NormalizedMic>;

export const COMEDY_KEYWORDS = [
  "open mic","open-mic","comedy open mic","stand up","stand-up","mic list","lottery","premic","workshop"
];
