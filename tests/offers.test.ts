import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@/lib/prismaEnums";

const authMock = vi.fn();
const rateLimitMock = vi.fn();
const createOfferMock = vi.fn();
const getThreadByIdMock = vi.fn();
const getOfferByIdMock = vi.fn();
const updateOfferStatusMock = vi.fn();
const createBookingMock = vi.fn();
const getUserByIdMock = vi.fn();
const markThreadStateMock = vi.fn();
const createMessageMock = vi.fn();

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
    COMMUNITY_BOARD_CATEGORIES: actual.COMMUNITY_BOARD_CATEGORIES,
    createOffer: createOfferMock,
    getThreadById: getThreadByIdMock,
    getOfferById: getOfferByIdMock,
    updateOfferStatus: updateOfferStatusMock,
    createBooking: createBookingMock,
    getUserById: getUserByIdMock,
    markThreadState: markThreadStateMock,
    createMessage: createMessageMock,
  };
});

describe("offers API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMock.mockReturnValue(true);
  });

  it("creates an offer when a promoter posts to a thread they participate in", async () => {
    const eventDate = new Date("2024-02-01T19:00:00.000Z");
    const { POST: createOfferRoute } = await import("@/app/api/offers/route");

    authMock.mockResolvedValue({
      user: { id: "promoter-1", role: Role.PROMOTER },
    });
    getThreadByIdMock.mockResolvedValue({
      id: "thread-1",
      gigId: "gig-1",
      participantIds: ["promoter-1", "comedian-1"],
    });
    createOfferMock.mockResolvedValue({
      id: "offer-1",
      threadId: "thread-1",
      fromUserId: "promoter-1",
      amount: 500,
      currency: "USD",
      terms: "Clean show",
      status: "PENDING",
      eventDate,
      expiresAt: null,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    const request = new Request("https://example.com/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId: "thread-1",
        amount: 500,
        terms: "Clean show",
        currency: "usd",
        eventDateISO: eventDate.toISOString(),
      }),
    });

    const response = await createOfferRoute(request);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(createOfferMock).toHaveBeenCalledTimes(1);
    const createArgs = createOfferMock.mock.calls[0][0];
    expect(createArgs).toMatchObject({
      threadId: "thread-1",
      fromUserId: "promoter-1",
      amount: 500,
      currency: "USD",
      terms: "Clean show",
    });
    expect(createArgs.eventDate).toBeInstanceOf(Date);
    expect(payload.offer.id).toBe("offer-1");
  });

  it("accepts an offer and creates a booking for the participants", async () => {
    const { POST: acceptOfferRoute } = await import(
      "@/app/api/offers/[id]/accept/route"
    );

    authMock.mockResolvedValue({
      user: { id: "comedian-1", role: Role.COMEDIAN },
    });
    getOfferByIdMock.mockResolvedValue({
      id: "offer-1",
      threadId: "thread-1",
      fromUserId: "promoter-1",
      status: "PENDING",
    });
    getThreadByIdMock.mockResolvedValue({
      id: "thread-1",
      gigId: "gig-1",
      participantIds: ["promoter-1", "comedian-1"],
    });
    getUserByIdMock.mockImplementation(async (id: string) => {
      if (id === "promoter-1") {
        return { id, role: Role.PROMOTER };
      }
      return { id, role: Role.COMEDIAN };
    });
    updateOfferStatusMock.mockResolvedValue({ status: "ACCEPTED" });
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
      createdAt: new Date("2024-01-02T00:00:00.000Z"),
    });
    markThreadStateMock.mockResolvedValue(undefined);
    createMessageMock.mockResolvedValue(undefined);

    const response = await acceptOfferRoute(new Request("https://example.com"), {
      params: { id: "offer-1" },
    });
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(updateOfferStatusMock).toHaveBeenCalledWith("offer-1", "ACCEPTED");
    expect(createBookingMock).toHaveBeenCalledWith({
      gigId: "gig-1",
      comedianId: "comedian-1",
      promoterId: "promoter-1",
      offerId: "offer-1",
    });
    expect(markThreadStateMock).toHaveBeenCalledWith("thread-1", "BOOKED");
    expect(createMessageMock).toHaveBeenCalledWith({
      threadId: "thread-1",
      senderId: "comedian-1",
      kind: "SYSTEM",
      body: "Offer accepted. Booking created: booking-1",
    });
    expect(payload.booking.id).toBe("booking-1");
  });

  it("declines an offer and emits a system message", async () => {
    const { POST: declineOfferRoute } = await import(
      "@/app/api/offers/[id]/decline/route"
    );

    authMock.mockResolvedValue({
      user: { id: "comedian-1", role: Role.COMEDIAN },
    });
    getOfferByIdMock.mockResolvedValue({
      id: "offer-1",
      threadId: "thread-1",
      fromUserId: "promoter-1",
      status: "PENDING",
    });
    getThreadByIdMock.mockResolvedValue({
      id: "thread-1",
      participantIds: ["promoter-1", "comedian-1"],
    });

    const response = await declineOfferRoute(new Request("https://example.com"), {
      params: { id: "offer-1" },
    });

    expect(response.status).toBe(200);
    expect(updateOfferStatusMock).toHaveBeenCalledWith("offer-1", "DECLINED");
    expect(createMessageMock).toHaveBeenCalledWith({
      threadId: "thread-1",
      senderId: "comedian-1",
      kind: "SYSTEM",
      body: "Offer declined.",
    });
  });

  it("rejects offer creation for unauthorized roles", async () => {
    const { POST: createOfferRoute } = await import("@/app/api/offers/route");

    authMock.mockResolvedValue({
      user: { id: "fan-1", role: Role.FAN },
    });

    const response = await createOfferRoute(
      new Request("https://example.com/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: "thread-1",
          amount: 100,
          terms: "Offer",
          eventDateISO: new Date().toISOString(),
        }),
      })
    );

    expect(response.status).toBe(403);
    expect(createOfferMock).not.toHaveBeenCalled();
  });
});
