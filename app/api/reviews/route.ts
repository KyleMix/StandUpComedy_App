import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  createConversationReview,
  getBookingById,
  listConversationReviewsForBooking
} from "@/lib/dataStore";

const reviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(10)
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const booking = await getBookingById(parsed.data.bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (![booking.comedianId, booking.promoterId].includes(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!["PAID", "COMPLETED"].includes(booking.status)) {
    return NextResponse.json({ error: "Reviews available after the show" }, { status: 400 });
  }

  const existing = await listConversationReviewsForBooking(booking.id);
  if (existing.some((review) => review.fromUserId === session.user.id)) {
    return NextResponse.json({ error: "Review already submitted" }, { status: 409 });
  }

  const toUserId = session.user.id === booking.comedianId ? booking.promoterId : booking.comedianId;
  const review = await createConversationReview({
    bookingId: booking.id,
    fromUserId: session.user.id,
    toUserId,
    rating: parsed.data.rating,
    body: parsed.data.body
  });

  return NextResponse.json({ review }, { status: 201 });
}
