import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createBooking,
  createMessage,
  getOfferById,
  getThreadById,
  getUserById,
  markThreadState,
  updateOfferStatus
} from "@/lib/dataStore";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const offer = await getOfferById(params.id);
  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  if (offer.status !== "PENDING") {
    return NextResponse.json({ error: "Offer already resolved" }, { status: 400 });
  }

  const thread = await getThreadById(offer.threadId);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  if (!thread.participantIds.includes(session.user.id) || session.user.id === offer.fromUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const fromUser = await getUserById(offer.fromUserId);
  const acceptingUser = await getUserById(session.user.id);
  if (!fromUser || !acceptingUser) {
    return NextResponse.json({ error: "Participants missing" }, { status: 400 });
  }

  const promoterId = fromUser.role === "COMEDIAN" ? acceptingUser.id : fromUser.id;
  const comedianId = fromUser.role === "COMEDIAN" ? fromUser.id : acceptingUser.id;

  await updateOfferStatus(offer.id, "ACCEPTED");
  const booking = await createBooking({
    gigId: thread.gigId,
    comedianId,
    promoterId,
    offerId: offer.id
  });

  await markThreadState(thread.id, "BOOKED");
  await createMessage({
    threadId: thread.id,
    senderId: session.user.id,
    kind: "SYSTEM",
    body: `Offer accepted. Booking created: ${booking.id}`
  });

  return NextResponse.json({ booking }, { status: 201 });
}
