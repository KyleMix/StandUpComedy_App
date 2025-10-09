import { promises as fs } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DatabaseSnapshot } from "@/types/database";

const DATA_DIR = path.join(process.cwd(), "data");
const DATABASE_PATH = path.join(DATA_DIR, "database.json");

const emptySnapshot = (): DatabaseSnapshot => ({
  users: [],
  comedianProfiles: [],
  comedianVideos: [],
  comedianAppearances: [],
  promoterProfiles: [],
  venueProfiles: [],
  gigs: [],
  applications: [],
  verificationRequests: [],
  favorites: [],
  threads: [],
  messages: [],
  offers: [],
  bookings: [],
  conversationReviews: [],
  reviews: [],
  reviewReminders: [],
  availability: [],
  reports: [],
  communityBoardMessages: [],
  communityPosts: [],
  communityReplies: [],
  communityVotes: [],
  adSlots: [],
  featureFlags: [],
});

async function seedDatabase(snapshot: DatabaseSnapshot) {
  await fs.rm(DATA_DIR, { recursive: true, force: true });
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATABASE_PATH, JSON.stringify(snapshot, null, 2));
  vi.resetModules();
}

describe("searchComedians", () => {
  beforeEach(async () => {
    await fs.rm(DATA_DIR, { recursive: true, force: true }).catch(() => undefined);
    vi.resetModules();
  });

  it("applies filters for location, style, rate, and experience", async () => {
    const now = new Date("2024-01-01T00:00:00.000Z");
    const fiveYearsAgo = new Date("2019-01-01T00:00:00.000Z");
    const twoYearsAgo = new Date("2022-01-01T00:00:00.000Z");

    const snapshot = emptySnapshot();
    snapshot.users = [
      {
        id: "comedian-premium",
        name: "Zed Premium",
        email: "zed@example.com",
        hashedPassword: null,
        role: "COMEDIAN",
        createdAt: now.toISOString(),
        isPremium: true,
        premiumSince: now.toISOString(),
      },
      {
        id: "comedian-basic",
        name: "Aaron Basic",
        email: "aaron@example.com",
        hashedPassword: null,
        role: "COMEDIAN",
        createdAt: now.toISOString(),
        isPremium: false,
        premiumSince: null,
      },
      {
        id: "comedian-remote",
        name: "Remote Comic",
        email: "remote@example.com",
        hashedPassword: null,
        role: "COMEDIAN",
        createdAt: now.toISOString(),
        isPremium: false,
        premiumSince: null,
      },
    ];

    snapshot.comedianProfiles = [
      {
        userId: "comedian-premium",
        stageName: "Zed Premium",
        bio: "Clean storyteller",
        credits: null,
        website: null,
        reelUrl: null,
        instagram: null,
        tiktokHandle: null,
        youtubeChannel: null,
        travelRadiusMiles: 50,
        homeCity: "New York",
        homeState: "NY",
        styles: ["Clean", "Storytelling"],
        cleanRating: "CLEAN",
        rateMin: 150,
        rateMax: 300,
        reelUrls: [],
        photoUrls: [],
        notableClubs: [],
        availability: [],
        createdAt: fiveYearsAgo.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        userId: "comedian-basic",
        stageName: "Aaron Basic",
        bio: "Edgy comic",
        credits: null,
        website: null,
        reelUrl: null,
        instagram: null,
        tiktokHandle: null,
        youtubeChannel: null,
        travelRadiusMiles: 25,
        homeCity: "Boston",
        homeState: "MA",
        styles: ["Dark", "Storytelling"],
        cleanRating: "R",
        rateMin: 50,
        rateMax: 150,
        reelUrls: [],
        photoUrls: [],
        notableClubs: [],
        availability: [],
        createdAt: twoYearsAgo.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        userId: "comedian-remote",
        stageName: "Remote Comic",
        bio: "Virtual shows only",
        credits: null,
        website: null,
        reelUrl: null,
        instagram: null,
        tiktokHandle: null,
        youtubeChannel: null,
        travelRadiusMiles: 10,
        homeCity: "Chicago",
        homeState: "IL",
        styles: ["Improv"],
        cleanRating: "PG13",
        rateMin: 80,
        rateMax: 120,
        reelUrls: [],
        photoUrls: [],
        notableClubs: [],
        availability: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    snapshot.comedianAppearances = [
      {
        id: "appearance-1",
        comedianUserId: "comedian-premium",
        showName: "Showcase",
        venueName: "Big Club",
        city: "New York",
        state: "NY",
        performedAt: fiveYearsAgo.toISOString(),
        gigId: null,
      },
      {
        id: "appearance-2",
        comedianUserId: "comedian-basic",
        showName: "Showcase",
        venueName: "Club",
        city: "Boston",
        state: "MA",
        performedAt: twoYearsAgo.toISOString(),
        gigId: null,
      },
    ];

    snapshot.reviews = [
      {
        id: "review-1",
        authorUserId: "promoter-1",
        subjectUserId: "comedian-premium",
        gigId: "gig-1",
        rating: 5,
        comment: "Amazing",
        visible: true,
        createdAt: now.toISOString(),
      },
      {
        id: "review-2",
        authorUserId: "promoter-1",
        subjectUserId: "comedian-basic",
        gigId: "gig-2",
        rating: 3,
        comment: "Average",
        visible: true,
        createdAt: now.toISOString(),
      },
    ];

    snapshot.featureFlags = [
      { key: "premiumBoost", enabled: true, updatedAt: now.toISOString() },
    ];

    await seedDatabase(snapshot);
    const { searchComedians } = await import("@/lib/dataStore");

    const result = await searchComedians({
      search: "premium",
      city: "New",
      state: "NY",
      styles: ["Clean"],
      rateMin: 100,
      rateMax: 400,
      minExperienceYears: 2,
    });

    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].profile.userId).toBe("comedian-premium");
  });

  it("boosts premium comedians ahead of similar peers", async () => {
    const now = new Date("2024-01-01T00:00:00.000Z");
    const fiveYearsAgo = new Date("2019-01-01T00:00:00.000Z");

    const snapshot = emptySnapshot();
    snapshot.users = [
      {
        id: "premium-comic",
        name: "Zed Premium",
        email: "zed@example.com",
        hashedPassword: null,
        role: "COMEDIAN",
        createdAt: now.toISOString(),
        isPremium: true,
        premiumSince: now.toISOString(),
      },
      {
        id: "standard-comic",
        name: "Aaron Standard",
        email: "aaron@example.com",
        hashedPassword: null,
        role: "COMEDIAN",
        createdAt: now.toISOString(),
        isPremium: false,
        premiumSince: null,
      },
    ];

    snapshot.comedianProfiles = [
      {
        userId: "premium-comic",
        stageName: "Zed Premium",
        bio: null,
        credits: null,
        website: null,
        reelUrl: null,
        instagram: null,
        tiktokHandle: null,
        youtubeChannel: null,
        travelRadiusMiles: 50,
        homeCity: "New York",
        homeState: "NY",
        styles: ["Clean"],
        cleanRating: "CLEAN",
        rateMin: 200,
        rateMax: 400,
        reelUrls: [],
        photoUrls: [],
        notableClubs: [],
        availability: [],
        createdAt: fiveYearsAgo.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        userId: "standard-comic",
        stageName: "Aaron Standard",
        bio: null,
        credits: null,
        website: null,
        reelUrl: null,
        instagram: null,
        tiktokHandle: null,
        youtubeChannel: null,
        travelRadiusMiles: 50,
        homeCity: "New York",
        homeState: "NY",
        styles: ["Clean"],
        cleanRating: "CLEAN",
        rateMin: 200,
        rateMax: 400,
        reelUrls: [],
        photoUrls: [],
        notableClubs: [],
        availability: [],
        createdAt: fiveYearsAgo.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    snapshot.reviews = [
      {
        id: "review-1",
        authorUserId: "promoter-1",
        subjectUserId: "premium-comic",
        gigId: "gig-1",
        rating: 5,
        comment: "Great",
        visible: true,
        createdAt: now.toISOString(),
      },
      {
        id: "review-2",
        authorUserId: "promoter-1",
        subjectUserId: "standard-comic",
        gigId: "gig-2",
        rating: 5,
        comment: "Great",
        visible: true,
        createdAt: now.toISOString(),
      },
    ];

    snapshot.featureFlags = [
      { key: "premiumBoost", enabled: true, updatedAt: now.toISOString() },
    ];

    await seedDatabase(snapshot);
    const { searchComedians } = await import("@/lib/dataStore");

    const result = await searchComedians({ pageSize: 10 });

    expect(result.items.map((item) => item.profile.stageName)).toEqual([
      "Zed Premium",
      "Aaron Standard",
    ]);
  });

  it("keeps free comedians visible while prioritising premium", async () => {
    const now = new Date("2024-01-01T00:00:00.000Z");
    const fiveYearsAgo = new Date("2019-01-01T00:00:00.000Z");

    const snapshot = emptySnapshot();
    snapshot.users = [
      {
        id: "free-first",
        name: "Free One",
        email: "free.one@example.com",
        hashedPassword: null,
        role: "COMEDIAN",
        createdAt: now.toISOString(),
        isPremium: false,
        premiumSince: null,
      },
      {
        id: "free-second",
        name: "Free Two",
        email: "free.two@example.com",
        hashedPassword: null,
        role: "COMEDIAN",
        createdAt: now.toISOString(),
        isPremium: false,
        premiumSince: null,
      },
      {
        id: "premium-middle",
        name: "Premium Star",
        email: "premium@example.com",
        hashedPassword: null,
        role: "COMEDIAN",
        createdAt: now.toISOString(),
        isPremium: true,
        premiumSince: now.toISOString(),
      },
      {
        id: "free-third",
        name: "Free Three",
        email: "free.three@example.com",
        hashedPassword: null,
        role: "COMEDIAN",
        createdAt: now.toISOString(),
        isPremium: false,
        premiumSince: null,
      },
    ];

    snapshot.comedianProfiles = snapshot.users.map((user) => ({
      userId: user.id,
      stageName: user.name ?? "Comic",
      bio: null,
      credits: null,
      website: null,
      reelUrl: null,
      instagram: null,
      tiktokHandle: null,
      youtubeChannel: null,
      travelRadiusMiles: 50,
      homeCity: "Seattle",
      homeState: "WA",
      styles: ["Observational"],
      cleanRating: "PG13",
      rateMin: 100,
      rateMax: 200,
      reelUrls: [],
      photoUrls: [],
      notableClubs: [],
      availability: [],
      createdAt: fiveYearsAgo.toISOString(),
      updatedAt: now.toISOString(),
    }));

    snapshot.featureFlags = [
      { key: "premiumBoost", enabled: true, updatedAt: now.toISOString() },
    ];

    await seedDatabase(snapshot);
    const { searchComedians } = await import("@/lib/dataStore");

    const result = await searchComedians({ pageSize: 4 });

    expect(result.items.map((item) => item.profile.stageName)).toEqual([
      "Premium Star",
      "Free One",
      "Free Three",
      "Free Two",
    ]);
  });
});
