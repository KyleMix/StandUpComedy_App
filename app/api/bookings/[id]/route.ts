import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBookingById, updateBooking } from "@/lib/dataStore";
import { rateLimit } from "@/lib/rateLimit";
import { Role } from "@/lib/prismaEnums";
import { bookingUpdateSchema } from "@/lib/zodSchemas";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const booking = await getBookingById(params.id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isParticipant =
    session.user.role === Role.ADMIN ||
    booking.comedianId === session.user.id ||
    booking.promoterId === session.user.id;
  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ booking });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`bookings:update:${session.user.id}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const booking = await getBookingById(params.id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isParticipant =
    session.user.role === Role.ADMIN ||
    booking.comedianId === session.user.id ||
    booking.promoterId === session.user.id;
  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json();
  const parsed = bookingUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateBooking(booking.id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking: updated });
}
