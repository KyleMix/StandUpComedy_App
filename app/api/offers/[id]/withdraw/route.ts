import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createMessage,
  getOfferById,
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

  if (offer.fromUserId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (offer.status !== "PENDING") {
    return NextResponse.json({ error: "Offer already resolved" }, { status: 400 });
  }

  await updateOfferStatus(offer.id, "WITHDRAWN");
  await createMessage({
    threadId: offer.threadId,
    senderId: session.user.id,
    kind: "SYSTEM",
    body: "Offer withdrawn by sender."
  });

  return NextResponse.json({ ok: true });
}
