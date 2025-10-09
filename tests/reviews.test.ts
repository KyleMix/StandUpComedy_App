import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@/lib/prismaEnums";

const authMock = vi.fn();
const rateLimitMock = vi.fn();
const createReviewMock = vi.fn();
const getGigByIdMock = vi.fn();
const listBookingsForGigMock = vi.fn();
const listReviewsForGigMock = vi.fn();
const listReviewsForUserMock = vi.fn();

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
    createReview: createReviewMock,
    getGigById: getGigByIdMock,
    listBookingsForGig: listBookingsForGigMock,
    listReviewsForGig: listReviewsForGigMock,
    listReviewsForUser: listReviewsForUserMock,
  };
});

describe("reviews API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMock.mockReturnValue(true);
  });

  it("lists reviews for a subject user", async () => {
    const { GET: reviewsGetRoute } = await import("@/app/api/reviews/route");

    listReviewsForUserMock.mockResolvedValue([
      {
        id: "review-1",
        authorUserId: "promoter-1",
        subjectUserId: "comedian-1",
        gigId: "gig-1",
        rating: 5,
        comment: "Fantastic performance",
        visible: true,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      },
    ]);

    const response = await reviewsGetRoute(
      new Request("https://example.com/api/reviews?subjectUserId=comedian-1")
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(listReviewsForUserMock).toHaveBeenCalledWith("comedian-1");
    expect(payload.reviews).toHaveLength(1);
    expect(payload.reviews[0]).toMatchObject({
      id: "review-1",
      authorUserId: "promoter-1",
      createdAt: expect.any(String),
    });
  });

  it("allows eligible participants to create a review", async () => {
    const { POST: reviewsPostRoute } = await import("@/app/api/reviews/route");

    authMock.mockResolvedValue({
      user: { id: "promoter-1", role: Role.PROMOTER },
    });
    getGigByIdMock.mockResolvedValue({
      id: "gig-1",
      dateStart: new Date("2024-01-01T20:00:00.000Z"),
    });
    listBookingsForGigMock.mockResolvedValue([
      {
        id: "booking-1",
        gigId: "gig-1",
        comedianId: "comedian-1",
        promoterId: "promoter-1",
        offerId: "offer-1",
        status: "COMPLETED",
        payoutProtection: true,
        cancellationPolicy: "STANDARD",
        paymentIntentId: null,
        createdAt: new Date("2023-12-01T00:00:00.000Z"),
      },
    ]);
    listReviewsForGigMock.mockResolvedValue([]);
    createReviewMock.mockResolvedValue({
      id: "review-1",
      authorUserId: "promoter-1",
      subjectUserId: "comedian-1",
      gigId: "gig-1",
      rating: 5,
      comment: "Great work",
      visible: true,
      createdAt: new Date("2024-01-02T00:00:00.000Z"),
    });

    const response = await reviewsPostRoute(
      new Request("https://example.com/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectUserId: "comedian-1",
          gigId: "gig-1",
          rating: 5,
          comment: "Amazing comedian!",
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(createReviewMock).toHaveBeenCalledWith({
      authorUserId: "promoter-1",
      subjectUserId: "comedian-1",
      gigId: "gig-1",
      rating: 5,
      comment: "Amazing comedian!",
    });
    expect(payload.review).toMatchObject({ id: "review-1" });
  });

  it("blocks reviews when the booking is not completed", async () => {
    const { POST: reviewsPostRoute } = await import("@/app/api/reviews/route");

    authMock.mockResolvedValue({
      user: { id: "promoter-1", role: Role.PROMOTER },
    });
    getGigByIdMock.mockResolvedValue({
      id: "gig-1",
      dateStart: new Date("2024-01-01T20:00:00.000Z"),
    });
    listBookingsForGigMock.mockResolvedValue([
      {
        id: "booking-1",
        gigId: "gig-1",
        comedianId: "comedian-1",
        promoterId: "promoter-1",
        offerId: "offer-1",
        status: "PENDING",
        payoutProtection: true,
        cancellationPolicy: "STANDARD",
        paymentIntentId: null,
        createdAt: new Date("2023-12-01T00:00:00.000Z"),
      },
    ]);

    const response = await reviewsPostRoute(
      new Request("https://example.com/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectUserId: "comedian-1",
          gigId: "gig-1",
          rating: 4,
          comment: "Solid set overall",
        }),
      })
    );

    expect(response.status).toBe(403);
    expect(createReviewMock).not.toHaveBeenCalled();
  });
});
