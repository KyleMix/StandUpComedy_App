import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createMessage,
  createOffer,
  getThreadById,
  listMessagesForThread,
  listOffersForThread,
  markThreadState
} from "@/lib/dataStore";
import { rateLimit } from "@/lib/rateLimit";
import { threadMessageSchema } from "@/lib/zodSchemas";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thread = await getThreadById(params.id);
  if (!thread || !thread.participantIds.includes(session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [messages, offers] = await Promise.all([
    listMessagesForThread(thread.id),
    listOffersForThread(thread.id)
  ]);

  return NextResponse.json({ thread, messages, offers });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`threads:message:${session.user.id}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const thread = await getThreadById(params.id);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  if (!thread.participantIds.includes(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json();
  const parsed = threadMessageSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let offerId: string | null = null;
  if (parsed.data.kind === "OFFER") {
    const offer = await createOffer({
      threadId: thread.id,
      fromUserId: session.user.id,
      amount: parsed.data.offer.amount,
      currency: parsed.data.offer.currency,
      terms: parsed.data.offer.terms,
      eventDate: new Date(parsed.data.offer.eventDate),
      expiresAt: parsed.data.offer.expiresAt ? new Date(parsed.data.offer.expiresAt) : null
    });
    offerId = offer.id;
    await markThreadState(thread.id, "QUOTE");
  }

  const message = await createMessage({
    threadId: thread.id,
    senderId: session.user.id,
    kind: parsed.data.kind,
    body: "body" in parsed.data ? parsed.data.body ?? null : null,
    fileUrl: "fileUrl" in parsed.data ? parsed.data.fileUrl ?? null : null,
    offerId
  });

  return NextResponse.json({ message, offerId }, { status: 201 });
}
