import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createMessage,
  getBookingById,
  getOfferById,
  updateBooking
} from "@/lib/dataStore";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const booking = await getBookingById(params.id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (![booking.comedianId, booking.promoterId].includes(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const paymentIntentId = `pi_mock_${booking.id}`;
  const updated = await updateBooking(booking.id, { status: "PAID", paymentIntentId });

  const offer = await getOfferById(booking.offerId);
  if (offer) {
    await createMessage({
      threadId: offer.threadId,
      senderId: session.user.id,
      kind: "SYSTEM",
      body: "Payment confirmed. You're protected under platform payout coverage."
    });
  }

  return NextResponse.json({ booking: updated, paymentIntentId });
}
