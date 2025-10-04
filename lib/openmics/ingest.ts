import pLimit from "p-limit";
import { prisma } from "@/lib/prisma";
import { whenKeyFrom, hashForDedupe, isComedyMic } from "./utils";
import * as meetup from "./sources/meetup";
import * as cse from "./sources/cse";
import * as reddit from "./sources/reddit";

export async function runOpenMicIngestion() {
  const cities = (process.env.DEFAULT_CITIES ?? "")
    .split(";").map(s => { const [city,state] = s.split(",").map(x=>x.trim()); return { city, state }; })
    .filter(c => c.city);

  const args = {
    cities,
    radiusMiles: Number(process.env.DEFAULT_RADIUS_MILES ?? 50),
    windowDays: Number(process.env.INGEST_WINDOW_DAYS ?? 60),
    now: new Date(),
  };

  const sources = [
    { name: "meetup", fn: meetup.fetchOpenMics },
    { name: "cse", fn: cse.fetchOpenMics },
  ];

  if (process.env.ENABLE_REDDIT_OPENMICS === "true") {
    sources.push({ name: "reddit", fn: reddit.fetchOpenMics });
  }

  const limit = pLimit(1);
  for (const src of sources) {
    await limit(async () => {
      try {
        const items = await src.fn(args);
        let upserts = 0;
        for (const e of items) {
          if (!isComedyMic(`${e.title} ${e.description||""}`)) continue;
          const whenKey = whenKeyFrom(e);
          const scrapedHash = e.scrapedHash ?? hashForDedupe(e.title, whenKey, e.venueName);
          const where = e.sourceId ? { source_sourceId: { source: e.source, sourceId: e.sourceId } } : undefined;

          if (where) {
            await prisma.openMic.upsert({ where, update: { ...e, scrapedHash }, create: { ...e, scrapedHash } });
            upserts++;
          } else {
            const dup = await prisma.openMic.findFirst({ where: { scrapedHash } });
            if (!dup) { await prisma.openMic.create({ data: { ...e, scrapedHash } }); upserts++; }
          }
        }
        await prisma.ingestLog.create({ data: { source: src.name, succeeded: true, message: `ingested ${upserts}` } });
      } catch (err:any) {
        await prisma.ingestLog.create({ data: { source: src.name, succeeded: false, message: err?.message?.slice(0,512) } });
      }
    });
  }
}
