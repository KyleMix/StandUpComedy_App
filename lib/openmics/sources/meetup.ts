import axios from "axios";
import { NormalizedMic, NormalizedMicT } from "../types";
import { Allowlist } from "../allowlist";
import { isComedyMic } from "../utils";

export type FetchArgs = {
  cities: { city: string; state?: string }[];
  radiusMiles: number;
  windowDays: number;
  now: Date;
};

export async function fetchOpenMics(args: FetchArgs): Promise<NormalizedMicT[]> {
  const out: NormalizedMicT[] = [];
  if (!process.env.MEETUP_TOKEN) return out;

  const headers = { Authorization: `Bearer ${process.env.MEETUP_TOKEN}` };

  const cities = args.cities.length ? args.cities : Allowlist.seedCities;
  for (const { city, state } of cities) {
    for (const kw of Allowlist.meetupKeywords) {
      try {
        const url = `https://api.meetup.com/find/upcoming_events?text=${encodeURIComponent(kw)}&radius=${args.radiusMiles}&fields=featured_photo&end_date_range=${new Date(args.now.getTime()+args.windowDays*864e5).toISOString()}&page=20&city=${encodeURIComponent(city)}${state?`&country=us&state=${encodeURIComponent(state)}`:""}`;
        const { data } = await axios.get(url, { headers });
        const events = data?.events ?? [];
        for (const ev of events) {
          const title = ev?.name ?? "";
          const desc  = ev?.description ?? "";
          if (!isComedyMic(`${title} ${desc}`)) continue;

          const startUtc = ev?.time ? new Date(ev.time) : undefined;
          const venue = ev?.venue?.name ?? ev?.group?.name;
          const mic = NormalizedMic.parse({
            source: "meetup",
            sourceId: String(ev?.id ?? ""),
            title,
            description: desc,
            url: ev?.link,
            startUtc,
            venueName: venue,
            city,
            state,
            isFree: ev?.fee ? false : true,
            tags: ["open-mic","comedy"],
            imageUrl: ev?.featured_photo?.highres_link,
          });
          out.push(mic);
        }
      } catch (_e) { /* swallow per-city errors, continue */ }
    }
  }
  return out;
}
