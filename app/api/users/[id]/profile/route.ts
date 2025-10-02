import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getComedianProfile,
  getPromoterProfile,
  getUserById,
  getVenueProfile,
  listConversationReviewsForUser
} from "@/lib/dataStore";

function computeProfileStrength(values: Array<string | number | null | undefined>) {
  if (!values.length) return 0;
  const completed = values.filter((value) => value !== null && value !== undefined && `${value}`.trim().length > 0).length;
  return Math.round((completed / values.length) * 100);
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.id !== params.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await getUserById(params.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [comedian, promoter, venue, reviews] = await Promise.all([
    getComedianProfile(user.id),
    getPromoterProfile(user.id),
    getVenueProfile(user.id),
    listConversationReviewsForUser(user.id)
  ]);

  const ratingAvg = reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0;
  const profileStrength = computeProfileStrength(
    user.role === "COMEDIAN"
      ? [
          comedian?.stageName,
          comedian?.bio,
          comedian?.website,
          comedian?.reelUrl,
          comedian?.instagram,
          comedian?.travelRadiusMiles,
          comedian?.homeCity,
          comedian?.homeState
        ]
      : user.role === "PROMOTER"
      ? [promoter?.organization, promoter?.contactName, promoter?.website, promoter?.phone]
      : user.role === "VENUE"
      ? [venue?.venueName, venue?.address1, venue?.city, venue?.state, venue?.capacity]
      : []
  );

  const badges: string[] = [];
  if (reviews.length >= 10 && ratingAvg >= 4.7) {
    badges.push("Top Rated");
  }
  if (user.role === "VENUE" && venue?.verificationStatus === "APPROVED") {
    badges.push("Venue Verified");
  }

  return NextResponse.json({
    user,
    profile: comedian ?? promoter ?? venue ?? null,
    reviews,
    ratingAvg,
    ratingCount: reviews.length,
    profileStrength,
    badges
  });
}
