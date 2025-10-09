import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createBooking,
  listBookingsForComedian,
  listBookingsForPromoter,
} from "@/lib/dataStore";
import { rateLimit } from "@/lib/rateLimit";
import { Role } from "@/lib/prismaEnums";
import { bookingCreateSchema } from "@/lib/zodSchemas";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let bookings = [];
  if (session.user.role === Role.COMEDIAN) {
    bookings = await listBookingsForComedian(session.user.id);
  } else if (
    session.user.role === Role.PROMOTER ||
    session.user.role === Role.VENUE
  ) {
    bookings = await listBookingsForPromoter(session.user.id);
  } else if (session.user.role === Role.ADMIN) {
    const [asComedian, asPromoter] = await Promise.all([
      listBookingsForComedian(session.user.id),
      listBookingsForPromoter(session.user.id),
    ]);
    const unique = new Map(
      [...asComedian, ...asPromoter].map((booking) => [booking.id, booking])
    );
    bookings = Array.from(unique.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  return NextResponse.json({ bookings });
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

  if (!rateLimit(`bookings:create:${session.user.id}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await request.json();
  const parsed = bookingCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (
    session.user.role !== Role.ADMIN &&
    parsed.data.promoterId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const booking = await createBooking({
    gigId: parsed.data.gigId,
    comedianId: parsed.data.comedianId,
    promoterId: parsed.data.promoterId,
    offerId: parsed.data.offerId,
  });

  return NextResponse.json({ booking }, { status: 201 });
}
