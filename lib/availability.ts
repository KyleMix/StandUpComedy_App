import { getPrismaClient, isDatabaseEnabled } from "@/lib/db/client";
import { getGigById, listAvailabilityForUser, listBookingsForComedian } from "@/lib/dataStore";
import type { Availability, Booking, Gig } from "@/lib/dataStore";

export interface CalendarAvailabilityEntry {
  date: Date;
  status: Availability["status"];
}

export interface CalendarBookingEntry {
  gigId: string;
  date: Date;
  title: string | null;
}

interface PrismaBookingWithGig {
  id: string;
  gigId: string;
  createdAt: Date;
  gig: { id: string; title: string | null; dateStart: Date | null } | null;
}

function normalizeAvailability(records: Availability[]): CalendarAvailabilityEntry[] {
  return records.map((record) => ({
    date: record.date,
    status: record.status
  }));
}

function normalizeBookings(
  bookings: Booking[],
  gigs: (Gig | null)[]
): CalendarBookingEntry[] {
  return bookings.map((booking, index) => {
    const gig = gigs[index];
    const eventDate = gig?.dateStart ?? booking.createdAt;
    return {
      gigId: booking.gigId,
      date: eventDate,
      title: gig?.title ?? null
    } satisfies CalendarBookingEntry;
  });
}

function normalizePrismaBookings(bookings: PrismaBookingWithGig[]): CalendarBookingEntry[] {
  return bookings
    .map((booking) => ({
      gigId: booking.gigId,
      date: booking.gig?.dateStart ?? booking.createdAt,
      title: booking.gig?.title ?? null
    }))
    .filter((entry): entry is CalendarBookingEntry => Boolean(entry.date));
}

export async function getComedianAvailabilityData(userId: string) {
  if (isDatabaseEnabled()) {
    const client = getPrismaClient();
    const bookings = await client.booking.findMany({
      where: { comedianId: userId },
      include: { gig: { select: { id: true, title: true, dateStart: true } } }
    });

    const bookingEntries = normalizePrismaBookings(
      bookings as unknown as PrismaBookingWithGig[]
    );

    return {
      availability: [] as CalendarAvailabilityEntry[],
      bookings: bookingEntries
    };
  }

  const [availabilityRecords, bookings] = await Promise.all([
    listAvailabilityForUser(userId),
    listBookingsForComedian(userId)
  ]);

  const gigs = await Promise.all(bookings.map((booking) => getGigById(booking.gigId)));

  return {
    availability: normalizeAvailability(availabilityRecords),
    bookings: normalizeBookings(bookings, gigs)
  };
}
