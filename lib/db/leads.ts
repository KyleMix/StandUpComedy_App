import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { LeadStatus } from "@prisma/client";
import { getPrismaClient, isDatabaseEnabled } from "./client";

export interface LeadInput {
  source: string;
  url: string;
  title?: string | null;
  raw?: unknown;
  normalized?: unknown;
  status?: LeadStatus;
}

export interface LeadRecord {
  id: string;
  source: string;
  url: string;
  title?: string | null;
  raw?: unknown;
  normalized?: unknown;
  seenHash?: string | null;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

const FALLBACK_FILE = path.join(process.cwd(), "data", "leads.json");

async function ensureFallbackFile(): Promise<void> {
  await fs.mkdir(path.dirname(FALLBACK_FILE), { recursive: true });
  try {
    await fs.access(FALLBACK_FILE);
  } catch {
    await fs.writeFile(FALLBACK_FILE, "[]", "utf8");
  }
}

async function readFallback(): Promise<LeadRecord[]> {
  await ensureFallbackFile();
  const raw = await fs.readFile(FALLBACK_FILE, "utf8");
  const parsed = JSON.parse(raw) as LeadRecord[];
  return parsed.map((lead) => ({
    ...lead,
    createdAt: new Date(lead.createdAt),
    updatedAt: new Date(lead.updatedAt),
  }));
}

async function writeFallback(leads: LeadRecord[]): Promise<void> {
  await fs.writeFile(
    FALLBACK_FILE,
    JSON.stringify(
      leads.map((lead) => ({
        ...lead,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
      })),
      null,
      2,
    ),
    "utf8",
  );
}

function hashUrl(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex");
}

export async function upsertLead(input: LeadInput): Promise<LeadRecord> {
  if (isDatabaseEnabled()) {
    const prisma = getPrismaClient();
    const seenHash = hashUrl(input.url);
    const now = new Date();
    const lead = await prisma.lead.upsert({
      where: { url: input.url },
      create: {
        source: input.source,
        url: input.url,
        title: input.title ?? null,
        raw: input.raw ?? null,
        normalized: input.normalized ?? null,
        seenHash,
        status: input.status ?? LeadStatus.NEW,
      },
      update: {
        title: input.title ?? null,
        raw: input.raw ?? null,
        normalized: input.normalized ?? null,
        status: input.status ?? LeadStatus.NEW,
        seenHash,
        updatedAt: now,
      },
    });
    return {
      ...lead,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };
  }

  const leads = await readFallback();
  const existingIndex = leads.findIndex((lead) => lead.url === input.url);
  const now = new Date();
  const record: LeadRecord = {
    id: existingIndex >= 0 ? leads[existingIndex].id : crypto.randomUUID(),
    source: input.source,
    url: input.url,
    title: input.title ?? null,
    raw: input.raw ?? null,
    normalized: input.normalized ?? null,
    seenHash: hashUrl(input.url),
    status: input.status ?? LeadStatus.NEW,
    createdAt: existingIndex >= 0 ? leads[existingIndex].createdAt : now,
    updatedAt: now,
  };
  if (existingIndex >= 0) {
    leads[existingIndex] = record;
  } else {
    leads.push(record);
  }
  await writeFallback(leads);
  return record;
}

export async function listLeads(status?: LeadStatus): Promise<LeadRecord[]> {
  if (isDatabaseEnabled()) {
    const prisma = getPrismaClient();
    const leads = await prisma.lead.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return leads.map((lead) => ({
      ...lead,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    }));
  }
  const leads = await readFallback();
  return status ? leads.filter((lead) => lead.status === status) : leads;
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  if (isDatabaseEnabled()) {
    const prisma = getPrismaClient();
    await prisma.lead.update({
      where: { id },
      data: { status },
    });
    return;
  }
  const leads = await readFallback();
  const index = leads.findIndex((lead) => lead.id === id);
  if (index >= 0) {
    leads[index].status = status;
    leads[index].updatedAt = new Date();
    await writeFallback(leads);
  }
}
