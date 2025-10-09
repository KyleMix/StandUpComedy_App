import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createBooking,
  getOfferById,
  getThreadById,
  updateOfferStatus,
} from "@/lib/dataStore";
import { rateLimit } from "@/lib/rateLimit";
import { Role } from "@/lib/prismaEnums";
import { offerStatusSchema } from "@/lib/zodSchemas";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`offers:update:${session.user.id}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const offer = await getOfferById(params.id);
  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  const thread = await getThreadById(offer.threadId);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  if (
    session.user.role !== Role.ADMIN &&
    !thread.participantIds.includes(session.user.id)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json();
  const parsed = offerStatusSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updatedOffer = await updateOfferStatus(offer.id, parsed.data.status);
  if (!updatedOffer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  let booking = null;
  if (
    parsed.data.status === "ACCEPTED" &&
    parsed.data.gigId &&
    parsed.data.comedianId &&
    parsed.data.promoterId
  ) {
    booking = await createBooking({
      gigId: parsed.data.gigId,
      comedianId: parsed.data.comedianId,
      promoterId: parsed.data.promoterId,
      offerId: updatedOffer.id,
      status: "PENDING",
    });
  }

  return NextResponse.json({ offer: updatedOffer, booking });
}
