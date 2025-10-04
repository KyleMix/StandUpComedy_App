import crypto from "crypto";

export function isComedyMic(text?: string) {
  if (!text) return false;
  const t = text.toLowerCase();
  return ["open mic","open-mic","comedy","stand up","stand-up"].some(k => t.includes(k));
}

export function hashForDedupe(title: string, whenKey: string, venue?: string) {
  const base = `${title.toLowerCase()}|${whenKey}|${(venue||"").toLowerCase()}`;
  return crypto.createHash("sha1").update(base).digest("hex");
}

export function whenKeyFrom(item: {startUtc?: Date; dayOfWeek?: number; recurrence?: string}) {
  if (item.startUtc) return new Date(item.startUtc).toISOString();
  if (typeof item.dayOfWeek === "number") return `DOW:${item.dayOfWeek}`;
  return `REC:${(item.recurrence||"").slice(0,64)}`;
}

export function parseDayOfWeek(text: string): number | undefined {
  const map: Record<string, number> = { sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6 };
  const m = text.toLowerCase().match(/\b(sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)(?:day)?\b/);
  if (!m) return undefined;
  const key = (m[1].replace("tues","tue").replace("thur","thu").replace("thurs","thu"));
  return map[key];
}
