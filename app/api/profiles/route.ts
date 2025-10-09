import { NextResponse } from "next/server";
import { searchComedians } from "@/lib/dataStore";
import { comedianSearchFiltersSchema } from "@/lib/zodSchemas";

function parseStyles(values: string[]) {
  return values
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;

  const styles = parseStyles(params.getAll("styles"));
  const raw = {
    search: params.get("search") ?? undefined,
    city: params.get("city") ?? undefined,
    state: params.get("state") ?? undefined,
    cleanRating: params.get("cleanRating") ?? undefined,
    rateMin: params.get("rateMin") ?? undefined,
    rateMax: params.get("rateMax") ?? undefined,
    minExperience: params.get("minExperience") ?? undefined,
    sort: params.get("sort") ?? undefined,
    page: params.get("page") ?? undefined,
    styles: styles.length > 0 ? styles : undefined,
  } as Record<string, unknown>;

  const parsed = comedianSearchFiltersSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
  }

  const filters = parsed.data;
  const result = await searchComedians({
    search: filters.search,
    city: filters.city,
    state: filters.state,
    styles: filters.styles,
    cleanRating: filters.cleanRating,
    rateMin: filters.rateMin,
    rateMax: filters.rateMax,
    minExperienceYears: filters.minExperience,
    sort: filters.sort,
    page: filters.page,
  });

  const items = result.items.map((item) => ({
    profile: {
      userId: item.profile.userId,
      stageName: item.profile.stageName,
      bio: item.profile.bio,
      credits: item.profile.credits,
      website: item.profile.website,
      reelUrl: item.profile.reelUrl,
      instagram: item.profile.instagram,
      tiktokHandle: item.profile.tiktokHandle,
      youtubeChannel: item.profile.youtubeChannel,
      travelRadiusMiles: item.profile.travelRadiusMiles,
      homeCity: item.profile.homeCity,
      homeState: item.profile.homeState,
      styles: item.profile.styles,
      cleanRating: item.profile.cleanRating,
      rateMin: item.profile.rateMin,
      rateMax: item.profile.rateMax,
      reelUrls: item.profile.reelUrls,
      photoUrls: item.profile.photoUrls,
      notableClubs: item.profile.notableClubs,
      createdAt: item.profile.createdAt.toISOString(),
      updatedAt: item.profile.updatedAt.toISOString(),
    },
    user: item.user,
    averageRating: item.averageRating,
    reviewCount: item.reviewCount,
    responsivenessScore: item.responsivenessScore,
    responseCount: item.responseCount,
    experienceYears: item.experienceYears,
    distanceRank: Number.isFinite(item.distanceRank) ? item.distanceRank : null,
  }));

  return NextResponse.json({
    items,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  });
}

