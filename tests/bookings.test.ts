import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@/lib/prismaEnums";

const authMock = vi.fn();
const rateLimitMock = vi.fn();
const createBookingMock = vi.fn();
const listBookingsForComedianMock = vi.fn();
const listBookingsForPromoterMock = vi.fn();
const getBookingByIdMock = vi.fn();
const updateBookingMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/rateLimit", () => ({
  rateLimit: rateLimitMock,
}));

vi.mock("@/lib/dataStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/dataStore")>();
  return {
    ...actual,
    createBooking: createBookingMock,
    listBookingsForComedian: listBookingsForComedianMock,
    listBookingsForPromoter: listBookingsForPromoterMock,
    getBookingById: getBookingByIdMock,
    updateBooking: updateBookingMock,
  };
});

describe("bookings API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMock.mockReturnValue(true);
  });

  it("allows promoters to create bookings for themselves", async () => {
    const { POST: createBookingRoute } = await import("@/app/api/bookings/route");

    authMock.mockResolvedValue({
      user: { id: "promoter-1", role: Role.PROMOTER },
    });
    createBookingMock.mockResolvedValue({
      id: "booking-1",
      gigId: "gig-1",
      comedianId: "comedian-1",
      promoterId: "promoter-1",
      offerId: "offer-1",
      status: "PENDING",
      payoutProtection: true,
      cancellationPolicy: "STANDARD",
      paymentIntentId: null,
      createdAt: new Date("2024-01-05T00:00:00.000Z"),
    });

    const response = await createBookingRoute(
      new Request("https://example.com/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gigId: "gig-1",
          comedianId: "comedian-1",
          promoterId: "promoter-1",
          offerId: "offer-1",
        }),
      })
    );

    expect(response.status).toBe(201);
    expect(createBookingMock).toHaveBeenCalledWith({
      gigId: "gig-1",
      comedianId: "comedian-1",
      promoterId: "promoter-1",
      offerId: "offer-1",
    });
  });

  it("lets booking participants update the status", async () => {
    const { PATCH: updateBookingRoute } = await import(
      "@/app/api/bookings/[id]/route"
    );

    authMock.mockResolvedValue({
      user: { id: "comedian-1", role: Role.COMEDIAN },
    });
    getBookingByIdMock.mockResolvedValue({
      id: "booking-1",
      gigId: "gig-1",
      comedianId: "comedian-1",
      promoterId: "promoter-1",
      offerId: "offer-1",
      status: "PENDING",
      payoutProtection: true,
      cancellationPolicy: "STANDARD",
      paymentIntentId: null,
      createdAt: new Date("2024-01-05T00:00:00.000Z"),
    });
    updateBookingMock.mockResolvedValue({
      id: "booking-1",
      gigId: "gig-1",
      comedianId: "comedian-1",
      promoterId: "promoter-1",
      offerId: "offer-1",
      status: "COMPLETED",
      payoutProtection: true,
      cancellationPolicy: "STANDARD",
      paymentIntentId: null,
      createdAt: new Date("2024-01-05T00:00:00.000Z"),
    });

    const response = await updateBookingRoute(
      new Request("https://example.com/api/bookings/booking-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      }),
      { params: { id: "booking-1" } }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(updateBookingMock).toHaveBeenCalledWith("booking-1", {
      status: "COMPLETED",
    });
    expect(payload.booking.status).toBe("COMPLETED");
  });

  it("prevents unrelated users from reading a booking", async () => {
    const { GET: getBookingRoute } = await import("@/app/api/bookings/[id]/route");

    authMock.mockResolvedValue({
      user: { id: "fan-1", role: Role.FAN },
    });
    getBookingByIdMock.mockResolvedValue({
      id: "booking-1",
      gigId: "gig-1",
      comedianId: "comedian-2",
      promoterId: "promoter-2",
      offerId: "offer-1",
      status: "PENDING",
      payoutProtection: true,
      cancellationPolicy: "STANDARD",
      paymentIntentId: null,
      createdAt: new Date("2024-01-05T00:00:00.000Z"),
    });

    const response = await getBookingRoute(
      new Request("https://example.com/api/bookings/booking-1"),
      { params: { id: "booking-1" } }
    );

    expect(response.status).toBe(403);
    expect(listBookingsForComedianMock).not.toHaveBeenCalled();
  });
});
