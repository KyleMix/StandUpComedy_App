import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canPublishGig } from "@/lib/rbac";
import { gigFiltersSchema, gigFormSchema } from "@/lib/zodSchemas";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const parsed = gigFiltersSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
  }
  const { page, minPayout, ...filters } = parsed.data;
  const take = 10;
  const skip = (page - 1) * take;
  const gigs = await prisma.gig.findMany({
    where: {
      isPublished: true,
      title: filters.search ? { contains: filters.search, mode: "insensitive" } : undefined,
      city: filters.city ? { contains: filters.city, mode: "insensitive" } : undefined,
      state: filters.state ?? undefined,
      compensationType: filters.compensationType ?? undefined,
      status: filters.status ?? undefined,
      payoutUsd:
        typeof minPayout === "number"
          ? {
              gte: minPayout
            }
          : undefined
    },
    orderBy: { dateStart: "asc" },
    skip,
    take
  });
  return NextResponse.json({ gigs });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`gig:${session.user.id}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const data = await request.json();
  const parsed = gigFormSchema.safeParse({
    ...data,
    payoutUsd: data.payoutUsd ?? undefined,
    minAge: data.minAge ?? undefined,
    dateEnd: data.dateEnd ?? undefined
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const profile = await prisma.promoterProfile.findUnique({ where: { userId: session.user.id } });
  const venueProfile = await prisma.venueProfile.findUnique({ where: { userId: session.user.id } });
  const verificationStatus = profile?.verificationStatus ?? venueProfile?.verificationStatus ?? null;

  if (!canPublishGig(session.user.role, verificationStatus) && parsed.data.isPublished) {
    return NextResponse.json({ error: "Verification required to publish" }, { status: 403 });
  }

  const gig = await prisma.gig.create({
    data: {
      createdByUserId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      compensationType: parsed.data.compensationType,
      payoutUsd: parsed.data.payoutUsd ?? null,
      dateStart: parsed.data.dateStart,
      dateEnd: parsed.data.dateEnd ?? null,
      timezone: parsed.data.timezone,
      city: parsed.data.city,
      state: parsed.data.state,
      minAge: parsed.data.minAge ?? null,
      isPublished: parsed.data.isPublished ?? false,
      status: "OPEN"
    }
  });

  return NextResponse.json({ gig }, { status: 201 });
}
