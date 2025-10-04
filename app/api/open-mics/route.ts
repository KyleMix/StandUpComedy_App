import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || undefined;
  const state = searchParams.get("state") || undefined;
  const q = searchParams.get("q")?.toLowerCase() || undefined;
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Math.min(Number(searchParams.get("pageSize") || 25), 100);

  const where:any = { status: "published" };
  if (city) where.city = { equals: city };
  if (state) where.state = { equals: state };
  if (q) where.title = { contains: q, mode: "insensitive" };

  where.OR = [
    { startUtc: { gte: new Date() } },
    { recurrence: { not: null } }
  ];

  const [total, data] = await Promise.all([
    prisma.openMic.count({ where }),
    prisma.openMic.findMany({
      where,
      orderBy: [{ startUtc: "asc" }],
      skip: (page-1)*pageSize,
      take: pageSize
    })
  ]);

  return NextResponse.json({ data, pagination: { page, pageSize, total } });
}
