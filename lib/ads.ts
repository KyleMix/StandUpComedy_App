import { getPrismaClient, isDatabaseEnabled } from "@/lib/db/client";
import {
  createAdSlot as createStoreAdSlot,
  deleteAdSlot as deleteStoreAdSlot,
  listAdSlots as listStoreAdSlots,
  listAllAdSlots as listStoreAllAdSlots,
  updateAdSlot as updateStoreAdSlot,
  type AdSlot as StoreAdSlot,
  isFeatureFlagEnabled,
} from "@/lib/dataStore";
import type { AdSlotPage, AdSlotPlacement } from "@/types/database";

type PrismaAdSlot = {
  id: string;
  page: string;
  placement: string;
  html: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  active: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface AdSlot {
  id: string;
  page: AdSlotPage;
  placement: AdSlotPlacement;
  html: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  active: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdSlotInput {
  page: AdSlotPage;
  placement: AdSlotPlacement;
  html?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  active?: boolean;
  priority?: number;
}

export interface UpdateAdSlotInput {
  page?: AdSlotPage;
  placement?: AdSlotPlacement;
  html?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  active?: boolean;
  priority?: number;
}

function normalizeSlot(slot: StoreAdSlot | PrismaAdSlot): AdSlot {
  return {
    id: slot.id,
    page: slot.page as AdSlotPage,
    placement: slot.placement as AdSlotPlacement,
    html: slot.html ?? null,
    imageUrl: slot.imageUrl ?? null,
    linkUrl: slot.linkUrl ?? null,
    active: slot.active,
    priority: slot.priority,
    createdAt: slot.createdAt instanceof Date ? slot.createdAt : new Date(slot.createdAt),
    updatedAt: slot.updatedAt instanceof Date ? slot.updatedAt : new Date(slot.updatedAt),
  } satisfies AdSlot;
}

function buildPrismaUpdateData(input: UpdateAdSlotInput) {
  const data: Record<string, unknown> = {};
  if (input.page) {
    data.page = input.page;
  }
  if (input.placement) {
    data.placement = input.placement;
  }
  if (input.html !== undefined) {
    data.html = input.html;
  }
  if (input.imageUrl !== undefined) {
    data.imageUrl = input.imageUrl;
  }
  if (input.linkUrl !== undefined) {
    data.linkUrl = input.linkUrl;
  }
  if (typeof input.active === "boolean") {
    data.active = input.active;
  }
  if (typeof input.priority === "number" && Number.isFinite(input.priority)) {
    data.priority = input.priority;
  }
  return data;
}

export async function listActiveAdSlots(page: AdSlotPage, placement: AdSlotPlacement): Promise<AdSlot[]> {
  const adsEnabled = await isFeatureFlagEnabled("adsEnabled");
  if (!adsEnabled) {
    return [];
  }

  if (isDatabaseEnabled()) {
    const client = getPrismaClient();
    const slots = await client.adSlot.findMany({
      where: { page, placement, active: true },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }, { createdAt: "desc" }],
    });
    return slots.map(normalizeSlot);
  }

  const slots = await listStoreAdSlots(page, placement);
  return slots.map(normalizeSlot);
}

export async function listAllAdSlots(): Promise<AdSlot[]> {
  if (isDatabaseEnabled()) {
    const client = getPrismaClient();
    const slots = await client.adSlot.findMany({
      orderBy: [{ page: "asc" }, { placement: "asc" }, { priority: "desc" }, { updatedAt: "desc" }],
    });
    return slots.map(normalizeSlot);
  }

  const slots = await listStoreAllAdSlots();
  return slots.map(normalizeSlot);
}

export async function createAdSlot(input: AdSlotInput): Promise<AdSlot> {
  if (isDatabaseEnabled()) {
    const client = getPrismaClient();
    const slot = await client.adSlot.create({
      data: {
        page: input.page,
        placement: input.placement,
        html: input.html ?? null,
        imageUrl: input.imageUrl ?? null,
        linkUrl: input.linkUrl ?? null,
        active: input.active ?? true,
        priority: input.priority ?? 0,
      },
    });
    return normalizeSlot(slot);
  }

  const slot = await createStoreAdSlot(input);
  return normalizeSlot(slot);
}

export async function updateAdSlot(id: string, input: UpdateAdSlotInput): Promise<AdSlot | null> {
  if (isDatabaseEnabled()) {
    const client = getPrismaClient();
    const data = buildPrismaUpdateData(input);
    if (Object.keys(data).length === 0) {
      const existing = await client.adSlot.findUnique({ where: { id } });
      return existing ? normalizeSlot(existing) : null;
    }
    const slot = await client.adSlot.update({ where: { id }, data });
    return normalizeSlot(slot);
  }

  const slot = await updateStoreAdSlot(id, input);
  return slot ? normalizeSlot(slot) : null;
}

export async function deleteAdSlot(id: string): Promise<boolean> {
  if (isDatabaseEnabled()) {
    const client = getPrismaClient();
    try {
      await client.adSlot.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  return deleteStoreAdSlot(id);
}
