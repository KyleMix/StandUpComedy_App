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

  const isAdmin = session.user.role === Role.ADMIN;
  const isParticipant = thread.participantIds.includes(session.user.id);

  if (!isAdmin && !isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isOfferSender = offer.fromUserId === session.user.id;
  if (!isAdmin && isOfferSender) {
    return NextResponse.json({ error: "Only the receiving comedian can update this offer" }, { status: 403 });
  }

  if (!isAdmin && session.user.role !== Role.COMEDIAN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json();
  const normalizedPayload: Record<string, unknown> = { ...json };
  if (normalizedPayload.status === "ACCEPTED") {
    normalizedPayload.gigId ??= thread.gigId;
    if (!isAdmin) {
      normalizedPayload.comedianId ??= session.user.id;
    }
    normalizedPayload.promoterId ??= offer.fromUserId;
  }

  const parsed = offerStatusSchema.safeParse(normalizedPayload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!isAdmin) {
    if (!["ACCEPTED", "DECLINED"].includes(parsed.data.status)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (parsed.data.comedianId && parsed.data.comedianId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      parsed.data.status === "ACCEPTED" &&
      parsed.data.promoterId &&
      parsed.data.promoterId !== offer.fromUserId
    ) {
      return NextResponse.json({ error: "Invalid promoter for offer" }, { status: 400 });
    }
  }

  if (
    parsed.data.status === "ACCEPTED" &&
    parsed.data.gigId &&
    parsed.data.gigId !== thread.gigId
  ) {
    return NextResponse.json({ error: "gigId must match the thread's gig" }, { status: 400 });
  }

  if (
    parsed.data.status === "ACCEPTED" &&
    parsed.data.comedianId &&
    !thread.participantIds.includes(parsed.data.comedianId)
  ) {
    return NextResponse.json({ error: "Comedian is not part of this thread" }, { status: 403 });
  }

  if (
    parsed.data.status === "ACCEPTED" &&
    parsed.data.promoterId &&
    !thread.participantIds.includes(parsed.data.promoterId) &&
    parsed.data.promoterId !== offer.fromUserId
  ) {
    return NextResponse.json({ error: "Promoter is not part of this thread" }, { status: 403 });
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
