import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOffer, getThreadById, listOffersForThread } from "@/lib/dataStore";
import { rateLimit } from "@/lib/rateLimit";
import { Role } from "@/lib/prismaEnums";
import { offerCreateSchema } from "@/lib/zodSchemas";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const threadId = url.searchParams.get("threadId");
  if (!threadId) {
    return NextResponse.json({ error: "threadId is required" }, { status: 400 });
  }

  const thread = await getThreadById(threadId);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  if (
    session.user.role !== Role.ADMIN &&
    !thread.participantIds.includes(session.user.id)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const offers = await listOffersForThread(thread.id);
  return NextResponse.json({ offers });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    session.user.role !== Role.PROMOTER &&
    session.user.role !== Role.VENUE &&
    session.user.role !== Role.ADMIN
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!rateLimit(`offers:create:${session.user.id}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await request.json();
  const parsed = offerCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const thread = await getThreadById(parsed.data.threadId);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  if (
    session.user.role !== Role.ADMIN &&
    !thread.participantIds.includes(session.user.id)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const offer = await createOffer({
    threadId: thread.id,
    fromUserId: session.user.id,
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    terms: parsed.data.terms,
    eventDate: new Date(parsed.data.eventDateISO),
    expiresAt: parsed.data.expiresAtISO ? new Date(parsed.data.expiresAtISO) : null,
  });

  return NextResponse.json({ offer }, { status: 201 });
}
