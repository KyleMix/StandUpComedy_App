import { Queue, Worker, QueueScheduler, JobsOptions } from "bullmq";
import { URL } from "node:url";
import { LeadStatus } from "@/lib/prismaEnums";
import { STARTER_ALLOWLIST } from "./allowlist";
import { searchGoogleCse } from "./sources/googleCSE";
import { normalizeLeadFromSnippet } from "./normalize";
import { upsertLead } from "../db/leads";

const connection = process.env.REDIS_URL
  ? new URL(process.env.REDIS_URL)
  : null;

const queueName = "ingestion:run";

let queue: Queue | null = null;
let scheduler: QueueScheduler | null = null;
let worker: Worker | null = null;

function createConnectionConfig() {
  if (!connection) return undefined;
  return {
    connection: {
      host: connection.hostname,
      port: Number(connection.port || 6379),
      password: connection.password || undefined,
    },
  };
}

async function fetchRobotsTxt(domain: string): Promise<boolean> {
  try {
    const url = new URL(`https://${domain}`);
    url.pathname = "/robots.txt";
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) return true;
    const body = await res.text();
    if (/disallow:\s*\//i.test(body) && /user-agent:\s*\*/i.test(body)) {
      return false;
    }
    return true;
  } catch (error) {
    console.warn(`robots.txt fetch failed for ${domain}`, error);
    return false;
  }
}

async function runJob(): Promise<void> {
  for (const entry of STARTER_ALLOWLIST) {
    if (!entry.enabled) continue;
    const canCrawl = await fetchRobotsTxt(entry.domain);
    if (!canCrawl) {
      continue;
    }
    const query = `site:${entry.domain} comedy open mic signup`;
    const { results } = await searchGoogleCse({ entry, query });
    for (const result of results) {
      const normalized = normalizeLeadFromSnippet(result.snippet);
      await upsertLead({
        source: entry.domain,
        url: result.url,
        title: result.title,
        raw: result,
        normalized: { ...normalized, externalUrl: result.url },
        status: LeadStatus.REVIEW,
      });
    }
  }
}

export async function ensureIngestionQueue(): Promise<void> {
  if (!connection) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Redis not configured; ingestion queue disabled");
    }
    return;
  }
  if (!queue) {
    const config = createConnectionConfig();
    queue = new Queue(queueName, config);
    scheduler = new QueueScheduler(queueName, config);
    worker = new Worker(queueName, runJob, config);
    const repeat: JobsOptions["repeat"] = {
      every: 10 * 60 * 1000,
    };
    await queue.add(queueName, {}, { repeat, removeOnComplete: true, removeOnFail: true });
  }
}

export async function runIngestionNow(): Promise<void> {
  if (queue) {
    await queue.add(queueName, {}, { removeOnComplete: true, removeOnFail: true });
    return;
  }
  await runJob();
}
