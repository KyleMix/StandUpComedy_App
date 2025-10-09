import axios from "axios";
import { load as loadHtml } from "cheerio/slim";
import { NormalizedMic, NormalizedMicT } from "../types";
import { Allowlist, isAllowedUrl, looksLikeOpenMicPath } from "../allowlist";
import { isComedyMic, parseDayOfWeek } from "../utils";

export type FetchArgs = {
  cities: { city: string; state?: string }[];
  radiusMiles: number;
  windowDays: number;
  now: Date;
};

const CSE_ENDPOINT = "https://www.googleapis.com/customsearch/v1";

export async function fetchOpenMics(args: FetchArgs): Promise<NormalizedMicT[]> {
  const out: NormalizedMicT[] = [];
  const key = process.env.GOOGLE_CSE_KEY;
  const cx  = process.env.GOOGLE_CSE_ID;
  if (!key || !cx) return out;

  const cities = args.cities.length ? args.cities : Allowlist.seedCities;
  for (const { city, state } of cities) {
    for (const kw of Allowlist.cseKeywords) {
      for (const domain of Allowlist.domains) {
        const q = `${kw} ${city} ${state ?? ""} site:${domain}`;
        try {
          const { data } = await axios.get(CSE_ENDPOINT, { params: { key, cx, q, num: 5 }});
          const items = data?.items ?? [];
          for (const it of items) {
            const link: string = it?.link;
            if (!link || !isAllowedUrl(link)) continue;

            const preferred = looksLikeOpenMicPath(new URL(link).pathname);

            const text = `${it?.title ?? ""} ${it?.snippet ?? ""}`;
            const hasTime = /\b(\d{1,2}(:\d{2})?\s?(am|pm)|\b\d{2}:\d{2}\b)/i.test(text);
            const dow = parseDayOfWeek(text);

            if (!preferred && !hasTime && dow === undefined) continue;

            let title = it?.title ?? "Open Mic";
            let venue: string|undefined;
            let address: string|undefined;
            let signupUrl: string|undefined;
            let recurrence: string|undefined;
            let startUtc: Date|undefined;

            try {
              const html = await axios.get(link, { timeout: 10000 }).then(r => r.data);
              const $ = loadHtml(html);
              const t = $("h1").first().text().trim() || $("title").text().trim() || title;
              if (t) title = t;

              const bodyText = $("body").text().replace(/\s+/g," ");
              const timeMatch = bodyText.match(/\b(\d{1,2}(:\d{2})?\s?(AM|PM))\b/i);
              const dow2 = parseDayOfWeek(bodyText) ?? dow;

              venue = $('[itemprop="name"]').first().text().trim() || venue;
              if (!venue) {
                const vGuess = bodyText.match(/(at|@)\s+([A-Z][\w'&\s\-]{3,60})/i);
                venue = vGuess?.[2];
              }
              const addressNode = $('[itemprop="streetAddress"]').first().text().trim();
              if (addressNode) address = addressNode;

              if (dow2 !== undefined && timeMatch) {
                recurrence = `Weekly-ish ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dow2]} ${timeMatch[0].toUpperCase()}`;
              }

              const signSel = $('a:contains("sign")').first().attr("href") || $('a:contains("signup")').first().attr("href");
              if (signSel) signupUrl = new URL(signSel, link).toString();
            } catch { /* ignore page parse errors */ }

            if (!isComedyMic(`${title}`)) continue;

            const mic = NormalizedMic.parse({
              source: "cse",
              sourceId: link,
              title,
              description: it?.snippet,
              url: link,
              signupUrl,
              dayOfWeek: undefined,
              startUtc,
              recurrence,
              venueName: venue,
              address,
              city, state,
              isFree: true,
              tags: ["open-mic","comedy"],
            });
            out.push(mic);
          }
        } catch { /* keep going */ }
      }
    }
  }
  return out;
}
