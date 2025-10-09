import { GigStatus, GigType, SignUpMethod } from "@/lib/prismaEnums";
import { listGigs as listJsonGigs } from "@/lib/dataStore";
import type { Gig as JsonGig } from "@/lib/dataStore";
import { getPrismaClient, isDatabaseEnabled } from "./client";

type MaybeDate = string | Date | null | undefined;

type GigWhereInput = Record<string, unknown> & {
  AND?: GigWhereInput[];
  OR?: GigWhereInput[];
  startsAt?: { gte?: Date; lte?: Date };
};

export interface GigFilters {
  query?: string;
  type?: GigType;
  city?: string;
  startDate?: MaybeDate;
  endDate?: MaybeDate;
  bringer?: boolean;
  signUpMethod?: SignUpMethod;
  payMin?: number;
  payMax?: number;
  status?: GigStatus;
  take?: number;
  skip?: number;
}

export interface GigSummary {
  id: string;
  title: string;
  description: string;
  type: GigType;
  status: GigStatus;
  startsAt: Date;
  endsAt: Date | null;
  venueName?: string | null;
  city?: string | null;
  promoterName?: string | null;
  signUpMethod: SignUpMethod;
  bringer: boolean;
  payMin?: number | null;
  payMax?: number | null;
  externalUrl?: string | null;
}

function coerceDate(value: MaybeDate): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

function mapJsonGig(gig: JsonGig): GigSummary {
  return {
    id: gig.id,
    title: gig.title,
    description: gig.description,
    type: GigType.OPEN_MIC,
    status: gig.isPublished ? GigStatus.PUBLISHED : GigStatus.DRAFT,
    startsAt: gig.dateStart,
    endsAt: gig.dateEnd,
    venueName: gig.city,
    city: gig.city,
    promoterName: undefined,
    signUpMethod: SignUpMethod.WALKUP,
    bringer: false,
    payMin: gig.payoutUsd ?? null,
    payMax: gig.payoutUsd ?? null,
    externalUrl: undefined,
  };
}

export async function listPublishedGigs(filters: GigFilters = {}): Promise<GigSummary[]> {
  if (isDatabaseEnabled()) {
    const prisma = getPrismaClient();
    const where: GigWhereInput = {
      status: filters.status ?? GigStatus.PUBLISHED,
    };
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.bringer !== undefined) {
      where.bringer = filters.bringer;
    }
    if (filters.signUpMethod) {
      where.signUpMethod = filters.signUpMethod;
    }
    if (filters.payMin !== undefined || filters.payMax !== undefined) {
      where.AND = where.AND ?? [];
      const range: GigWhereInput = {};
      if (filters.payMin !== undefined) {
        range.OR = [
          { payMin: { gte: filters.payMin } },
          { payMax: { gte: filters.payMin } },
        ];
      }
      if (filters.payMax !== undefined) {
        range.OR = [
          ...(range.OR ?? []),
          { payMin: { lte: filters.payMax } },
          { payMax: { lte: filters.payMax } },
        ];
      }
      (where.AND ??= []).push(range);
    }
    if (filters.query) {
      where.OR = [
        ...(where.OR ?? []),
        { title: { contains: filters.query, mode: "insensitive" } },
        { description: { contains: filters.query, mode: "insensitive" } },
      ];
    }
    const start = coerceDate(filters.startDate);
    const end = coerceDate(filters.endDate);
    if (start || end) {
      where.startsAt = where.startsAt ?? {};
      if (start) where.startsAt.gte = start;
      if (end) where.startsAt.lte = end;
    }
    if (filters.city) {
      where.OR = [
        ...(where.OR ?? []),
        { venue: { address: { contains: filters.city, mode: "insensitive" } } },
        { venue: { name: { contains: filters.city, mode: "insensitive" } } },
      ];
    }
    const gigs = (await prisma.gig.findMany({
      where,
      include: {
        venue: true,
        promoter: { include: { user: true } },
      },
      orderBy: { startsAt: "asc" },
      take: filters.take ?? 50,
      skip: filters.skip ?? 0,
    })) as Array<Record<string, any>>;
    return gigs.map((gig) => ({
      id: gig.id,
      title: gig.title,
      description: gig.description,
      type: gig.type,
      status: gig.status,
      startsAt: gig.startsAt,
      endsAt: gig.endsAt,
      venueName: gig.venue?.name,
      city: gig.venue?.address ?? undefined,
      promoterName: gig.promoter?.orgName ?? gig.promoter?.user?.email ?? undefined,
      signUpMethod: gig.signUpMethod,
      bringer: gig.bringer,
      payMin: gig.payMin,
      payMax: gig.payMax,
      externalUrl: gig.externalUrl,
    }));
  }

  const gigs = await listJsonGigs({
    isPublished: filters.status ? filters.status === GigStatus.PUBLISHED : true,
    titleContains: filters.query
      ? { value: filters.query, mode: "insensitive" }
      : undefined,
    cityContains: filters.city ? { value: filters.city, mode: "insensitive" } : undefined,
    minPayout: filters.payMin,
    orderByDateStart: "asc",
  });
  return gigs.map(mapJsonGig);
}
