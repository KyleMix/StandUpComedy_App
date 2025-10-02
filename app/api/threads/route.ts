import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  createMessage,
  createThread,
  getGigById,
  getUserById,
  listMessagesForThread,
  listThreadsForUser
} from "@/lib/dataStore";
import { rateLimit } from "@/lib/rateLimit";

const createThreadSchema = z.object({
  gigId: z.string().min(1),
  participantIds: z.array(z.string().min(1)).min(1),
  initialMessage: z.string().min(1).optional()
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const threads = await listThreadsForUser(session.user.id);
  const hydrated = await Promise.all(
    threads.map(async (thread) => {
      const gig = await getGigById(thread.gigId);
      const participants = await Promise.all(thread.participantIds.map((id) => getUserById(id)));
      const messages = await listMessagesForThread(thread.id);
      return {
        thread,
        gig,
        participants: participants.filter((value): value is NonNullable<typeof value> => Boolean(value)),
        lastMessage: messages.length ? messages[messages.length - 1] : null
      };
    })
  );

  return NextResponse.json({ threads: hydrated });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`threads:create:${session.user.id}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await request.json();
  const parsed = createThreadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const gig = await getGigById(parsed.data.gigId);
  if (!gig) {
    return NextResponse.json({ error: "Gig not found" }, { status: 404 });
  }

  const thread = await createThread({
    gigId: parsed.data.gigId,
    createdById: session.user.id,
    participantIds: parsed.data.participantIds
  });

  if (parsed.data.initialMessage) {
    await createMessage({
      threadId: thread.id,
      senderId: session.user.id,
      kind: "TEXT",
      body: parsed.data.initialMessage
    });
  }

  return NextResponse.json({ thread }, { status: 201 });
}
