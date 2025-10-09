import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createReview,
  getGigById,
  listBookingsForGig,
  listReviewsForGig,
  listReviewsForUser,
} from "@/lib/dataStore";
import { rateLimit } from "@/lib/rateLimit";
import { reviewCreateSchema } from "@/lib/zodSchemas";

function serializeReview(
  review:
    | Awaited<ReturnType<typeof createReview>>
    | Awaited<ReturnType<typeof listReviewsForUser>>[number],
) {
  return {
    id: review.id,
    authorUserId: review.authorUserId,
    subjectUserId: review.subjectUserId,
    gigId: review.gigId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const subjectUserId = url.searchParams.get("subjectUserId");
  const gigId = url.searchParams.get("gigId");

  if (!subjectUserId && !gigId) {
    return NextResponse.json(
      { error: "Provide subjectUserId or gigId to list reviews" },
      { status: 400 },
    );
  }

  if (subjectUserId && gigId) {
    return NextResponse.json(
      { error: "Specify only one of subjectUserId or gigId" },
      { status: 400 },
    );
  }

  const reviews = subjectUserId
    ? await listReviewsForUser(subjectUserId)
    : await listReviewsForGig(gigId!);

  return NextResponse.json({ reviews: reviews.map(serializeReview) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`reviews:create:${session.user.id}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = reviewCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { subjectUserId, gigId, rating, comment } = parsed.data;

  if (subjectUserId === session.user.id) {
    return NextResponse.json({ error: "You cannot review yourself" }, { status: 400 });
  }

  const gig = await getGigById(gigId);
  if (!gig) {
    return NextResponse.json({ error: "Gig not found" }, { status: 404 });
  }

  const bookings = await listBookingsForGig(gigId);
  const matchingBooking = bookings.find(
    (booking) =>
      (booking.comedianId === session.user.id && booking.promoterId === subjectUserId) ||
      (booking.promoterId === session.user.id && booking.comedianId === subjectUserId),
  );

  if (!matchingBooking) {
    return NextResponse.json(
      { error: "A completed booking is required before leaving a review" },
      { status: 403 },
    );
  }

  if (!matchingBooking.status || !["PAID", "COMPLETED"].includes(matchingBooking.status)) {
    return NextResponse.json({ error: "Booking must be completed before review" }, { status: 403 });
  }

  const eventTime = gig.dateStart.getTime();
  if (!Number.isFinite(eventTime) || eventTime > Date.now()) {
    return NextResponse.json({ error: "Reviews are available after the show" }, { status: 400 });
  }

  const existingReviews = await listReviewsForGig(gigId);
  if (existingReviews.some((review) => review.authorUserId === session.user.id)) {
    return NextResponse.json({ error: "Review already submitted" }, { status: 409 });
  }

  const review = await createReview({
    authorUserId: session.user.id,
    subjectUserId,
    gigId,
    rating,
    comment,
  });

  return NextResponse.json({ review: serializeReview(review) }, { status: 201 });
}
