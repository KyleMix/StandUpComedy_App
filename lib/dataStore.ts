import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  AdSlotPage,
  AdSlotPlacement,
  AdSlotRecord,
  FeatureFlagRecord,
  ApplicationRecord,
  AvailabilityRecord,
  BookingRecord,
  ComedianAppearanceRecord,
  ComedianCleanRating,
  ComedianProfileRecord,
  ComedianVideoRecord,
  CommunityBoardMessageRecord,
  CommunityBoardCategory,
  CommunityPostRecord,
  CommunityReplyRecord,
  CommunityVoteRecord,
  CommunityVoteTarget,
  ConversationReviewRecord,
  DatabaseSnapshot,
  FavoriteRecord,
  GigRecord,
  MessageRecord,
  OfferRecord,
  PromoterProfileRecord,
  ReportRecord,
  ReviewRecord,
  ReviewReminderRecord,
  ThreadRecord,
  UserRecord,
  VenueProfileRecord,
  VerificationRequestRecord
} from "@/types/database";
import type {
  ApplicationStatus,
  BookingStatus,
  CancellationPolicy,
  GigCompensationType,
  GigStatus,
  MessageKind,
  OfferStatus,
  Role,
  ThreadState,
  VerificationStatus
} from "@/lib/prismaEnums";
import { sanitizeHtml } from "@/lib/sanitize";
import { FeatureFlagKey, getDefaultFeatureFlags } from "@/lib/config/flags";

const DATA_DIR = path.join(process.cwd(), "data");
const DATABASE_PATH = path.join(DATA_DIR, "database.json");

async function ensureDataStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATABASE_PATH);
  } catch (error) {
    const emptySnapshot: DatabaseSnapshot = {
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
      featureFlags: []
    };
    await fs.writeFile(DATABASE_PATH, JSON.stringify(emptySnapshot, null, 2));
  }
}

export interface User
  extends Omit<UserRecord, "createdAt" | "premiumSince" | "avatarUrl"> {
  createdAt: Date;
  premiumSince: Date | null;
  avatarUrl: string | null;
}

export interface ComedianProfile
  extends Omit<ComedianProfileRecord, "createdAt" | "updatedAt" | "availability"> {
  createdAt: Date;
  updatedAt: Date;
  availability: Availability[];
}

export type ComedianSortOption = "rating" | "distance" | "responsiveness" | "premium";

export interface ComedianSearchFilters {
  search?: string;
  city?: string;
  state?: string;
  styles?: string[];
  cleanRating?: ComedianCleanRating;
  rateMin?: number;
  rateMax?: number;
  minExperienceYears?: number;
  sort?: ComedianSortOption;
  page?: number;
  pageSize?: number;
}

export interface ComedianSearchListItem {
  profile: ComedianProfile;
  user: Pick<User, "id" | "name" | "isPremium"> | null;
  averageRating: number | null;
  reviewCount: number;
  responsivenessScore: number | null;
  responseCount: number;
  experienceYears: number | null;
  distanceRank: number;
}

export interface ComedianSearchResult {
  items: ComedianSearchListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ComedianVideo extends Omit<ComedianVideoRecord, "postedAt"> {
  postedAt: Date;
}

export interface ComedianAppearance extends Omit<ComedianAppearanceRecord, "performedAt"> {
  performedAt: Date;
}

export interface PromoterProfile extends Omit<PromoterProfileRecord, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface VenueProfile extends Omit<VenueProfileRecord, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface Gig extends Omit<GigRecord, "dateStart" | "dateEnd" | "createdAt" | "updatedAt"> {
  dateStart: Date;
  dateEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GigMetrics {
  gigId: string;
  totalApplications: number;
  pendingApplications: number;
  favorites: number;
  bookings: number;
  threads: number;
  messages: number;
  lastActivityAt: Date | null;
}

export interface Application extends Omit<ApplicationRecord, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationRequest extends Omit<VerificationRequestRecord, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface Favorite extends Omit<FavoriteRecord, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface Thread extends Omit<ThreadRecord, "createdAt" | "updatedAt" | "lastMessageAt"> {
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

export interface Message extends Omit<MessageRecord, "createdAt"> {
  createdAt: Date;
}

export interface Offer extends Omit<OfferRecord, "createdAt" | "eventDate" | "expiresAt"> {
  createdAt: Date;
  eventDate: Date;
  expiresAt: Date | null;
}

export interface CommunityBoardMessage
  extends Omit<CommunityBoardMessageRecord, "createdAt" | "updatedAt" | "content"> {
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityPost extends Omit<CommunityPostRecord, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityReply extends Omit<CommunityReplyRecord, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityVote extends Omit<CommunityVoteRecord, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

export const COMMUNITY_BOARD_CATEGORIES: CommunityBoardCategory[] = ["ASK", "OFFER", "ANNOUNCEMENT"];

export interface Booking extends Omit<BookingRecord, "createdAt"> {
  createdAt: Date;
}

export interface ConversationReview extends Omit<ConversationReviewRecord, "createdAt"> {
  createdAt: Date;
}

export interface Availability extends Omit<AvailabilityRecord, "date"> {
  date: Date;
}

export interface Review extends Omit<ReviewRecord, "createdAt"> {
  createdAt: Date;
}

export interface ReviewReminder extends Omit<ReviewReminderRecord, "sendAt" | "createdAt" | "sentAt"> {
  sendAt: Date;
  createdAt: Date;
  sentAt: Date | null;
}

export interface AdSlot extends Omit<AdSlotRecord, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlag extends Omit<FeatureFlagRecord, "updatedAt"> {
  updatedAt: Date;
}

export interface Report extends Omit<ReportRecord, "createdAt" | "resolvedAt"> {
  createdAt: Date;
  resolvedAt: Date | null;
}

function withDefaults(snapshot: Partial<DatabaseSnapshot>): DatabaseSnapshot {
  return {
    users: snapshot.users ?? [],
    comedianProfiles: snapshot.comedianProfiles ?? [],
    comedianVideos: snapshot.comedianVideos ?? [],
    comedianAppearances: snapshot.comedianAppearances ?? [],
    promoterProfiles: snapshot.promoterProfiles ?? [],
    venueProfiles: snapshot.venueProfiles ?? [],
    gigs: snapshot.gigs ?? [],
    applications: snapshot.applications ?? [],
    verificationRequests: snapshot.verificationRequests ?? [],
    favorites: snapshot.favorites ?? [],
    threads: snapshot.threads ?? [],
    messages: snapshot.messages ?? [],
    offers: snapshot.offers ?? [],
    bookings: snapshot.bookings ?? [],
    conversationReviews: snapshot.conversationReviews ?? [],
    reviews: snapshot.reviews ?? [],
    reviewReminders: snapshot.reviewReminders ?? [],
    availability: snapshot.availability ?? [],
    reports: snapshot.reports ?? [],
    communityBoardMessages: snapshot.communityBoardMessages ?? [],
    communityPosts: snapshot.communityPosts ?? [],
    communityReplies: snapshot.communityReplies ?? [],
    communityVotes: snapshot.communityVotes ?? [],
    adSlots: snapshot.adSlots ?? [],
    featureFlags: snapshot.featureFlags ?? []
  };
}

let cache: DatabaseSnapshot | null = null;

async function loadSnapshot(): Promise<DatabaseSnapshot> {
  if (!cache) {
    await ensureDataStore();
    const raw = await fs.readFile(DATABASE_PATH, "utf-8");
    try {
      cache = withDefaults(JSON.parse(raw) as Partial<DatabaseSnapshot>);
    } catch (error) {
      cache = withDefaults({});
    }
  }
  return cache;
}

async function persist(snapshot: DatabaseSnapshot) {
  cache = snapshot;
  await ensureDataStore();
  await fs.writeFile(DATABASE_PATH, JSON.stringify(snapshot, null, 2));
}

function toDate(value: string | null): Date | null {
  return value ? new Date(value) : null;
}

function mapUser(record: UserRecord): User {
  return {
    id: record.id,
    name: record.name ?? null,
    email: record.email,
    hashedPassword: record.hashedPassword ?? null,
    role: record.role,
    createdAt: new Date(record.createdAt),
    isPremium: record.isPremium ?? false,
    premiumSince: record.premiumSince ? new Date(record.premiumSince) : null,
    avatarUrl:
      ("avatarUrl" in record && record.avatarUrl != null && record.avatarUrl !== "")
        ? record.avatarUrl
        : null
  };
}

const CLEAN_RATINGS: ComedianCleanRating[] = ["CLEAN", "PG13", "R"];

function coerceCleanRating(value: ComedianCleanRating | string | undefined): ComedianCleanRating {
  if (value && CLEAN_RATINGS.includes(value as ComedianCleanRating)) {
    return value as ComedianCleanRating;
  }
  return "PG13";
}

function sanitizeStringArray(values: string[] | null | undefined): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => sanitizeHtml(value))
    .filter((value) => value.length > 0);
}

function sanitizeAvailabilityStatus(status: string | undefined): "free" | "busy" {
  return status === "busy" ? "busy" : "free";
}

function toIsoString(value: string | Date | null | undefined): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) {
    return value.toISOString();
  }
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function sanitizeProfileAvailability(
  userId: string,
  entries: AvailabilityRecord[] | undefined
): AvailabilityRecord[] {
  if (!Array.isArray(entries)) return [];
  return entries.map((entry) => ({
    id: entry.id ?? randomUUID(),
    userId: entry.userId ?? userId,
    date: toIsoString(entry.date),
    status: sanitizeAvailabilityStatus(entry.status)
  }));
}

function mapComedian(record: ComedianProfileRecord): ComedianProfile {
  return {
    userId: record.userId,
    stageName: record.stageName,
    bio: record.bio ?? null,
    credits: record.credits ?? null,
    website: record.website ?? null,
    reelUrl: record.reelUrl ?? null,
    instagram: record.instagram ?? null,
    tiktokHandle: record.tiktokHandle ?? null,
    youtubeChannel: record.youtubeChannel ?? null,
    travelRadiusMiles: record.travelRadiusMiles ?? null,
    homeCity: record.homeCity ?? null,
    homeState: record.homeState ?? null,
    styles: sanitizeStringArray(record.styles),
    cleanRating: coerceCleanRating(record.cleanRating),
    rateMin: typeof record.rateMin === "number" ? record.rateMin : null,
    rateMax: typeof record.rateMax === "number" ? record.rateMax : null,
    reelUrls: sanitizeStringArray(record.reelUrls),
    photoUrls: sanitizeStringArray(record.photoUrls),
    notableClubs: sanitizeStringArray(record.notableClubs),
    availability: Array.isArray(record.availability)
      ? record.availability.map(mapAvailability)
      : [],
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt)
  };
}

function mapComedianVideo(record: ComedianVideoRecord): ComedianVideo {
  return {
    ...record,
    postedAt: new Date(record.postedAt)
  };
}

function mapComedianAppearance(record: ComedianAppearanceRecord): ComedianAppearance {
  return {
    ...record,
    gigId: record.gigId ?? null,
    performedAt: new Date(record.performedAt)
  };
}

function mapPromoter(record: PromoterProfileRecord): PromoterProfile {
  return {
    ...record,
    phone: record.phone ?? null,
    website: record.website ?? null,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt)
  };
}

function mapVenue(record: VenueProfileRecord): VenueProfile {
  return {
    ...record,
    address2: record.address2 ?? null,
    capacity: record.capacity ?? null,
    phone: record.phone ?? null,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt)
  };
}

function mapGig(record: GigRecord): Gig {
  return {
    ...record,
    payoutUsd: record.payoutUsd ?? null,
    minAge: record.minAge ?? null,
    format: record.format ?? null,
    setLengthMinutes: record.setLengthMinutes ?? null,
    audienceDescription: record.audienceDescription ?? null,
    totalSpots: record.totalSpots ?? null,
    perks: record.perks ?? [],
    dateStart: new Date(record.dateStart),
    dateEnd: toDate(record.dateEnd),
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt)
  };
}

function mapApplication(record: ApplicationRecord): Application {
  return {
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt)
  };
}

function mapVerification(record: VerificationRequestRecord): VerificationRequest {
  return {
    ...record,
    reviewedBy: record.reviewedBy ?? null,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt)
  };
}

function mapFavorite(record: FavoriteRecord): Favorite {
  return {
    ...record,
    gigId: record.gigId ?? null,
    venueId: record.venueId ?? null,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt)
  };
}

function mapThread(record: ThreadRecord): Thread {
  return {
    ...record,
    lastMessageAt: new Date(record.lastMessageAt),
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt)
  };
}

function mapMessage(record: MessageRecord): Message {
  return {
    ...record,
    body: record.body ?? null,
    fileUrl: record.fileUrl ?? null,
    offerId: record.offerId ?? null,
    createdAt: new Date(record.createdAt)
  };
}

function mapOffer(record: OfferRecord): Offer {
  return {
    ...record,
    currency: record.currency ?? "USD",
    createdAt: new Date(record.createdAt),
    eventDate: new Date(record.eventDate),
    expiresAt: record.expiresAt ? new Date(record.expiresAt) : null
  };
}

function mapCommunityBoardMessage(record: CommunityBoardMessageRecord): CommunityBoardMessage {
  return {
    ...record,
    gigTitle: record.gigTitle ?? null,
    gigAddress: record.gigAddress ?? null,
    gigCity: record.gigCity ?? null,
    gigState: record.gigState ?? null,
    gigContactName: record.gigContactName ?? null,
    gigContactEmail: record.gigContactEmail ?? null,
    gigSlotsAvailable: record.gigSlotsAvailable ?? null,
    content: record.content,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt)
  };
}

function mapCommunityPost(record: CommunityPostRecord): CommunityPost {
  return {
    ...record,
    title: record.title,
    content: record.content,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt)
  };
}

function mapCommunityReply(record: CommunityReplyRecord): CommunityReply {
  return {
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt)
  };
}

function mapCommunityVote(record: CommunityVoteRecord): CommunityVote {
  return {
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt)
  };
}

function mapBooking(record: BookingRecord): Booking {
  return {
    ...record,
    createdAt: new Date(record.createdAt)
  };
}

function mapConversationReview(record: ConversationReviewRecord): ConversationReview {
  return {
    ...record,
    createdAt: new Date(record.createdAt)
  };
}

function mapAvailability(record: AvailabilityRecord): Availability {
  return {
    ...record,
    date: new Date(record.date)
  };
}

function mapReport(record: ReportRecord): Report {
  return {
    ...record,
    details: record.details ?? null,
    createdAt: new Date(record.createdAt),
    resolvedAt: record.resolvedAt ? new Date(record.resolvedAt) : null
  };
}

function mapReview(record: ReviewRecord): Review {
  return {
    ...record,
    comment: record.comment ?? "",
    visible: record.visible ?? true,
    createdAt: new Date(record.createdAt)
  };
}

function mapFeatureFlag(record: FeatureFlagRecord): FeatureFlag {
  return {
    ...record,
    updatedAt: new Date(record.updatedAt)
  };
}

const FEATURE_FLAG_DEFAULTS = getDefaultFeatureFlags();

function getFeatureFlagValue(snapshot: DatabaseSnapshot, key: FeatureFlagKey): boolean {
  const override = snapshot.featureFlags.find((flag) => flag.key === key);
  if (override) {
    return Boolean(override.enabled);
  }
  return FEATURE_FLAG_DEFAULTS[key];
}

function mapAdSlot(record: AdSlotRecord): AdSlot {
  return {
    ...record,
    html: record.html,
    imageUrl: record.imageUrl,
    linkUrl: record.linkUrl,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt ?? record.createdAt)
  };
}

function normalizeReviewRating(value: number): 1 | 2 | 3 | 4 | 5 {
  const rounded = Math.round(value);
  if (rounded <= 1) return 1;
  if (rounded >= 5) return 5;
  return (rounded as 2 | 3 | 4);
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeText(value: string | null | undefined) {
  return value ? value.toLowerCase() : "";
}

function computeAverage(total: number, count: number): number | null {
  if (count === 0) return null;
  return Number((total / count).toFixed(2));
}

function computeExperienceYears(profile: ComedianProfile, appearances: ComedianAppearanceRecord[]): number | null {
  const timestamps = appearances
    .filter((appearance) => appearance.comedianUserId === profile.userId)
    .map((appearance) => new Date(appearance.performedAt).getTime())
    .filter((value) => Number.isFinite(value));

  const earliestTimestamp = timestamps.length > 0 ? Math.min(...timestamps) : profile.createdAt.getTime();
  if (!Number.isFinite(earliestTimestamp)) {
    return null;
  }
  const now = Date.now();
  if (now <= earliestTimestamp) {
    return 0;
  }
  const millisecondsPerYear = 1000 * 60 * 60 * 24 * 365;
  return Math.max(0, Math.floor((now - earliestTimestamp) / millisecondsPerYear));
}

function computeDistanceRank(
  profile: ComedianProfile,
  cityFilter: string | undefined,
  stateFilter: string | undefined
) {
  if (!cityFilter && !stateFilter) {
    return Number.POSITIVE_INFINITY;
  }
  const city = normalizeText(profile.homeCity);
  const state = profile.homeState ? profile.homeState.toUpperCase() : "";

  if (cityFilter && stateFilter) {
    if (city === cityFilter && state === stateFilter) {
      return 0;
    }
  }
  if (cityFilter && !stateFilter && city === cityFilter) {
    return 0;
  }
  if (stateFilter && state === stateFilter) {
    return 1;
  }
  if (cityFilter && city.includes(cityFilter)) {
    return 2;
  }
  return 3;
}

function compareByRating(a: ComedianSearchListItem, b: ComedianSearchListItem) {
  const aRating = a.averageRating ?? 0;
  const bRating = b.averageRating ?? 0;
  if (aRating !== bRating) {
    return bRating - aRating;
  }
  if (a.reviewCount !== b.reviewCount) {
    return b.reviewCount - a.reviewCount;
  }
  return a.profile.stageName.localeCompare(b.profile.stageName);
}

function applyPremiumBoost(items: ComedianSearchListItem[], enabled: boolean): ComedianSearchListItem[] {
  if (!enabled) {
    return items;
  }

  const premium: ComedianSearchListItem[] = [];
  const standard: ComedianSearchListItem[] = [];

  for (const item of items) {
    if (item.user?.isPremium) {
      premium.push(item);
    } else {
      standard.push(item);
    }
  }

  return [...premium, ...standard];
}

export async function searchComedians(filters: ComedianSearchFilters = {}): Promise<ComedianSearchResult> {
  const snapshot = await loadSnapshot();
  const premiumBoostEnabled = getFeatureFlagValue(snapshot, "premiumBoost");
  const pageSize = Math.max(filters.pageSize ?? 12, 1);
  const page = Math.max(filters.page ?? 1, 1);
  const searchTerm = filters.search?.trim().toLowerCase() ?? "";
  const cityFilter = filters.city?.trim().toLowerCase() || undefined;
  const stateFilter = filters.state?.trim().toUpperCase() || undefined;
  const normalizedStyles = (filters.styles ?? [])
    .map((style) => style.trim())
    .filter((style) => style.length > 0)
    .map((style) => style.toLowerCase());

  const reviewTotals = new Map<string, { total: number; count: number }>();
  for (const review of snapshot.reviews) {
    const existing = reviewTotals.get(review.subjectUserId) ?? { total: 0, count: 0 };
    existing.total += review.rating;
    existing.count += 1;
    reviewTotals.set(review.subjectUserId, existing);
  }

  const conversationTotals = new Map<string, { total: number; count: number }>();
  for (const conversationReview of snapshot.conversationReviews) {
    const existing = conversationTotals.get(conversationReview.toUserId) ?? { total: 0, count: 0 };
    existing.total += conversationReview.rating;
    existing.count += 1;
    conversationTotals.set(conversationReview.toUserId, existing);
  }

  const usersById = new Map(snapshot.users.map((record) => [record.id, mapUser(record)]));

  const profiles = snapshot.comedianProfiles.map(mapComedian);

  const items: ComedianSearchListItem[] = profiles.map((profile) => {
    const reviewStats = reviewTotals.get(profile.userId) ?? { total: 0, count: 0 };
    const conversationStats = conversationTotals.get(profile.userId) ?? { total: 0, count: 0 };
    const experienceYears = computeExperienceYears(profile, snapshot.comedianAppearances);
    const distanceRank = computeDistanceRank(profile, cityFilter, stateFilter);
    const user = usersById.get(profile.userId);
    return {
      profile,
      user: user ? { id: user.id, name: user.name, isPremium: user.isPremium } : null,
      averageRating: computeAverage(reviewStats.total, reviewStats.count),
      reviewCount: reviewStats.count,
      responsivenessScore: computeAverage(conversationStats.total, conversationStats.count),
      responseCount: conversationStats.count,
      experienceYears,
      distanceRank,
    };
  });

  const filtered = items.filter((item) => {
    const { profile } = item;
    if (searchTerm) {
      const haystack = [
        profile.stageName,
        profile.bio ?? "",
        profile.credits ?? "",
        profile.homeCity ?? "",
        profile.homeState ?? "",
        profile.styles.join(" "),
        item.user?.name ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(searchTerm)) {
        return false;
      }
    }

    if (cityFilter) {
      const profileCity = profile.homeCity ? profile.homeCity.toLowerCase() : "";
      if (!profileCity.includes(cityFilter)) {
        return false;
      }
    }

    if (stateFilter) {
      if (!profile.homeState || profile.homeState.toUpperCase() !== stateFilter) {
        return false;
      }
    }

    if (filters.cleanRating && profile.cleanRating !== filters.cleanRating) {
      return false;
    }

    if (normalizedStyles.length > 0) {
      const profileStyles = new Set(profile.styles.map((style) => style.toLowerCase()));
      for (const style of normalizedStyles) {
        if (!profileStyles.has(style)) {
          return false;
        }
      }
    }

    if (filters.rateMin !== undefined) {
      const maxRate = profile.rateMax ?? profile.rateMin;
      if (maxRate == null || maxRate < filters.rateMin) {
        return false;
      }
    }

    if (filters.rateMax !== undefined) {
      const minRate = profile.rateMin ?? profile.rateMax;
      if (minRate == null || minRate > filters.rateMax) {
        return false;
      }
    }

    if (filters.minExperienceYears !== undefined) {
      if (item.experienceYears == null || item.experienceYears < filters.minExperienceYears) {
        return false;
      }
    }

    return true;
  });

  const sortOption = filters.sort ?? "rating";
  const sorted = filtered.sort((a, b) => {
    switch (sortOption) {
      case "distance": {
        const aRank = a.distanceRank;
        const bRank = b.distanceRank;
        if (Number.isFinite(aRank) || Number.isFinite(bRank)) {
          if (aRank !== bRank) {
            return aRank - bRank;
          }
        }
        return compareByRating(a, b);
      }
      case "responsiveness": {
        const aScore = a.responsivenessScore ?? 0;
        const bScore = b.responsivenessScore ?? 0;
        if (aScore !== bScore) {
          return bScore - aScore;
        }
        if (a.responseCount !== b.responseCount) {
          return b.responseCount - a.responseCount;
        }
        return compareByRating(a, b);
      }
      case "premium": {
        const aPremium = a.user?.isPremium ? 1 : 0;
        const bPremium = b.user?.isPremium ? 1 : 0;
        if (aPremium !== bPremium) {
          return bPremium - aPremium;
        }
        return compareByRating(a, b);
      }
      case "rating":
      default:
        return compareByRating(a, b);
    }
  });

  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);
  const paginated = applyPremiumBoost(pageItems, premiumBoostEnabled);

  return {
    items: paginated,
    total,
    page,
    pageSize,
  };
}

export async function listComedianProfiles(): Promise<ComedianProfile[]> {
  const snapshot = await loadSnapshot();
  return snapshot.comedianProfiles.map(mapComedian);
}

export async function listComedianVideosForUser(userId: string): Promise<ComedianVideo[]> {
  const snapshot = await loadSnapshot();
  return snapshot.comedianVideos
    .filter((video) => video.comedianUserId === userId)
    .map(mapComedianVideo)
    .sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime());
}

export async function listComedianAppearancesForUser(userId: string): Promise<ComedianAppearance[]> {
  const snapshot = await loadSnapshot();
  return snapshot.comedianAppearances
    .filter((appearance) => appearance.comedianUserId === userId)
    .map(mapComedianAppearance)
    .sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime());
}

export async function getUserById(id: string): Promise<User | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.users.find((user) => user.id === id);
  return record ? mapUser(record) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  return record ? mapUser(record) : null;
}

export async function listUsers(): Promise<User[]> {
  const snapshot = await loadSnapshot();
  return snapshot.users.map(mapUser);
}

interface CreateUserInput {
  name?: string | null;
  email: string;
  hashedPassword?: string | null;
  role: Role;
  isPremium?: boolean;
  premiumSince?: Date | string | null;
  avatarUrl?: string | null;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const snapshot = await loadSnapshot();
  const now = nowIso();
  const isPremium = input.isPremium ?? false;
  const user: UserRecord = {
    id: randomUUID(),
    name: input.name ?? null,
    email: input.email,
    hashedPassword: input.hashedPassword ?? null,
    role: input.role,
    createdAt: now,
    isPremium,
    premiumSince: isPremium ? toIsoString(input.premiumSince ?? now) : null,
    avatarUrl: input.avatarUrl ?? null
  };
  snapshot.users.push(user);
  await persist(snapshot);
  return mapUser(user);
}

export async function updateUser(id: string, data: Partial<Omit<UserRecord, "id" | "createdAt">>): Promise<User | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.users.find((user) => user.id === id);
  if (!record) return null;
  if (data.name !== undefined) record.name = data.name;
  if (data.email !== undefined) record.email = data.email;
  if (data.hashedPassword !== undefined) record.hashedPassword = data.hashedPassword;
  if (data.role !== undefined) record.role = data.role;
  if (data.isPremium !== undefined) record.isPremium = data.isPremium;
  if (data.premiumSince !== undefined) {
    record.premiumSince = data.premiumSince ? toIsoString(data.premiumSince) : null;
  }
  if (data.avatarUrl !== undefined) {
    record.avatarUrl = data.avatarUrl && data.avatarUrl.length > 0 ? data.avatarUrl : null;
  }
  await persist(snapshot);
  return mapUser(record);
}

export async function setUserPremium(userId: string, isPremium: boolean): Promise<User | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.users.find((user) => user.id === userId);
  if (!record) return null;
  record.isPremium = isPremium;
  if (isPremium) {
    record.premiumSince = record.premiumSince ?? nowIso();
  } else {
    record.premiumSince = null;
  }
  await persist(snapshot);
  return mapUser(record);
}

export async function getComedianProfile(userId: string): Promise<ComedianProfile | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.comedianProfiles.find((profile) => profile.userId === userId);
  return record ? mapComedian(record) : null;
}

interface CreateComedianProfileInput {
  userId: string;
  stageName: string;
  bio?: string | null;
  credits?: string | null;
  website?: string | null;
  reelUrl?: string | null;
  instagram?: string | null;
  tiktokHandle?: string | null;
  youtubeChannel?: string | null;
  travelRadiusMiles?: number | null;
  homeCity?: string | null;
  homeState?: string | null;
  styles?: string[];
  cleanRating?: ComedianCleanRating | string;
  rateMin?: number | null;
  rateMax?: number | null;
  reelUrls?: string[];
  photoUrls?: string[];
  notableClubs?: string[];
  availability?: AvailabilityRecord[];
}

export async function createComedianProfile(input: CreateComedianProfileInput): Promise<ComedianProfile> {
  const snapshot = await loadSnapshot();
  const now = nowIso();
  const record: ComedianProfileRecord = {
    userId: input.userId,
    stageName: sanitizeHtml(input.stageName),
    bio: input.bio ? sanitizeHtml(input.bio) : null,
    credits: input.credits ? sanitizeHtml(input.credits) : null,
    website: input.website ? sanitizeHtml(input.website) : null,
    reelUrl: input.reelUrl ? sanitizeHtml(input.reelUrl) : null,
    instagram: input.instagram ? sanitizeHtml(input.instagram) : null,
    tiktokHandle: input.tiktokHandle ? sanitizeHtml(input.tiktokHandle) : null,
    youtubeChannel: input.youtubeChannel ? sanitizeHtml(input.youtubeChannel) : null,
    travelRadiusMiles: input.travelRadiusMiles ?? null,
    homeCity: input.homeCity ? sanitizeHtml(input.homeCity) : null,
    homeState: input.homeState ? sanitizeHtml(input.homeState) : null,
    styles: sanitizeStringArray(input.styles),
    cleanRating: coerceCleanRating(input.cleanRating as ComedianCleanRating | undefined),
    rateMin: typeof input.rateMin === "number" ? input.rateMin : null,
    rateMax: typeof input.rateMax === "number" ? input.rateMax : null,
    reelUrls: sanitizeStringArray(input.reelUrls),
    photoUrls: sanitizeStringArray(input.photoUrls),
    notableClubs: sanitizeStringArray(input.notableClubs),
    availability: sanitizeProfileAvailability(input.userId, input.availability),
    createdAt: now,
    updatedAt: now
  };
  const index = snapshot.comedianProfiles.findIndex((profile) => profile.userId === input.userId);
  if (index >= 0) {
    snapshot.comedianProfiles[index] = record;
  } else {
    snapshot.comedianProfiles.push(record);
  }
  await persist(snapshot);
  return mapComedian(record);
}

interface UpdateComedianProfileMediaInput {
  reelUrl?: string | null;
  reelUrls?: string[];
  photoUrls?: string[];
  notableClubs?: string[];
}

export async function updateComedianProfileMedia(
  userId: string,
  data: UpdateComedianProfileMediaInput
): Promise<ComedianProfile | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.comedianProfiles.find((profile) => profile.userId === userId);
  if (!record) return null;
  if (data.reelUrl !== undefined) {
    record.reelUrl = data.reelUrl ? sanitizeHtml(data.reelUrl) : null;
  }
  if (data.reelUrls !== undefined) {
    record.reelUrls = sanitizeStringArray(data.reelUrls);
  }
  if (data.photoUrls !== undefined) {
    record.photoUrls = sanitizeStringArray(data.photoUrls);
  }
  if (data.notableClubs !== undefined) {
    record.notableClubs = sanitizeStringArray(data.notableClubs);
  }
  record.updatedAt = nowIso();
  await persist(snapshot);
  return mapComedian(record);
}

interface UpdateComedianProfileRatesInput {
  rateMin?: number | null;
  rateMax?: number | null;
  availability?: AvailabilityRecord[];
}

export async function updateComedianProfileRates(
  userId: string,
  data: UpdateComedianProfileRatesInput
): Promise<ComedianProfile | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.comedianProfiles.find((profile) => profile.userId === userId);
  if (!record) return null;
  if (data.rateMin !== undefined) {
    record.rateMin = typeof data.rateMin === "number" ? data.rateMin : null;
  }
  if (data.rateMax !== undefined) {
    record.rateMax = typeof data.rateMax === "number" ? data.rateMax : null;
  }
  if (data.availability !== undefined) {
    record.availability = sanitizeProfileAvailability(userId, data.availability);
  }
  record.updatedAt = nowIso();
  await persist(snapshot);
  return mapComedian(record);
}

interface UpdateComedianProfileStylesInput {
  styles?: string[];
  cleanRating?: ComedianCleanRating | string | null;
}

export async function updateComedianProfileStyles(
  userId: string,
  data: UpdateComedianProfileStylesInput
): Promise<ComedianProfile | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.comedianProfiles.find((profile) => profile.userId === userId);
  if (!record) return null;
  if (data.styles !== undefined) {
    record.styles = sanitizeStringArray(data.styles);
  }
  if (data.cleanRating !== undefined) {
    record.cleanRating = coerceCleanRating(data.cleanRating ?? undefined);
  }
  record.updatedAt = nowIso();
  await persist(snapshot);
  return mapComedian(record);
}

export async function getPromoterProfile(userId: string): Promise<PromoterProfile | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.promoterProfiles.find((profile) => profile.userId === userId);
  return record ? mapPromoter(record) : null;
}

export async function updatePromoterProfile(
  userId: string,
  data: Partial<Omit<PromoterProfileRecord, "userId" | "createdAt" | "updatedAt">> & { verificationStatus?: VerificationStatus }
): Promise<PromoterProfile | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.promoterProfiles.find((profile) => profile.userId === userId);
  if (!record) return null;
  if (data.organization !== undefined) record.organization = sanitizeHtml(data.organization);
  if (data.contactName !== undefined) record.contactName = sanitizeHtml(data.contactName);
  if (data.phone !== undefined) record.phone = data.phone ? sanitizeHtml(data.phone) : null;
  if (data.website !== undefined) record.website = data.website ? sanitizeHtml(data.website) : null;
  if (data.verificationStatus !== undefined) record.verificationStatus = data.verificationStatus;
  record.updatedAt = nowIso();
  await persist(snapshot);
  return mapPromoter(record);
}

interface UpsertPromoterProfileInput {
  userId: string;
  organization: string;
  contactName: string;
  phone?: string | null;
  website?: string | null;
}

export async function upsertPromoterProfile(input: UpsertPromoterProfileInput): Promise<PromoterProfile> {
  const snapshot = await loadSnapshot();
  const record = snapshot.promoterProfiles.find((profile) => profile.userId === input.userId);
  const now = nowIso();
  if (record) {
    record.organization = sanitizeHtml(input.organization);
    record.contactName = sanitizeHtml(input.contactName);
    record.phone = input.phone ? sanitizeHtml(input.phone) : null;
    record.website = input.website ? sanitizeHtml(input.website) : null;
    record.updatedAt = now;
    await persist(snapshot);
    return mapPromoter(record);
  }

  const created: PromoterProfileRecord = {
    userId: input.userId,
    organization: sanitizeHtml(input.organization),
    contactName: sanitizeHtml(input.contactName),
    phone: input.phone ? sanitizeHtml(input.phone) : null,
    website: input.website ? sanitizeHtml(input.website) : null,
    verificationStatus: "PENDING",
    createdAt: now,
    updatedAt: now
  };
  snapshot.promoterProfiles.push(created);
  await persist(snapshot);
  return mapPromoter(created);
}

export async function getVenueProfile(userId: string): Promise<VenueProfile | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.venueProfiles.find((profile) => profile.userId === userId);
  return record ? mapVenue(record) : null;
}

export async function updateVenueProfile(
  userId: string,
  data: Partial<Omit<VenueProfileRecord, "userId" | "createdAt" | "updatedAt">> & { verificationStatus?: VerificationStatus }
): Promise<VenueProfile | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.venueProfiles.find((profile) => profile.userId === userId);
  if (!record) return null;
  if (data.venueName !== undefined) record.venueName = sanitizeHtml(data.venueName);
  if (data.address1 !== undefined) record.address1 = sanitizeHtml(data.address1);
  if (data.address2 !== undefined) record.address2 = data.address2 ? sanitizeHtml(data.address2) : null;
  if (data.city !== undefined) record.city = sanitizeHtml(data.city);
  if (data.state !== undefined) record.state = sanitizeHtml(data.state);
  if (data.postalCode !== undefined) record.postalCode = sanitizeHtml(data.postalCode);
  if (data.capacity !== undefined) record.capacity = data.capacity;
  if (data.contactEmail !== undefined) record.contactEmail = sanitizeHtml(data.contactEmail);
  if (data.phone !== undefined) record.phone = data.phone ? sanitizeHtml(data.phone) : null;
  if (data.verificationStatus !== undefined) record.verificationStatus = data.verificationStatus;
  record.updatedAt = nowIso();
  await persist(snapshot);
  return mapVenue(record);
}

interface UpsertVenueProfileInput {
  userId: string;
  venueName: string;
  address1: string;
  address2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  capacity?: number | null;
  contactEmail: string;
  phone?: string | null;
}

export async function upsertVenueProfile(input: UpsertVenueProfileInput): Promise<VenueProfile> {
  const snapshot = await loadSnapshot();
  const record = snapshot.venueProfiles.find((profile) => profile.userId === input.userId);
  const now = nowIso();
  if (record) {
    record.venueName = sanitizeHtml(input.venueName);
    record.address1 = sanitizeHtml(input.address1);
    record.address2 = input.address2 ? sanitizeHtml(input.address2) : null;
    record.city = sanitizeHtml(input.city);
    record.state = sanitizeHtml(input.state);
    record.postalCode = sanitizeHtml(input.postalCode);
    record.capacity = input.capacity ?? null;
    record.contactEmail = sanitizeHtml(input.contactEmail);
    record.phone = input.phone ? sanitizeHtml(input.phone) : null;
    record.updatedAt = now;
    await persist(snapshot);
    return mapVenue(record);
  }

  const created: VenueProfileRecord = {
    userId: input.userId,
    venueName: sanitizeHtml(input.venueName),
    address1: sanitizeHtml(input.address1),
    address2: input.address2 ? sanitizeHtml(input.address2) : null,
    city: sanitizeHtml(input.city),
    state: sanitizeHtml(input.state),
    postalCode: sanitizeHtml(input.postalCode),
    capacity: input.capacity ?? null,
    contactEmail: sanitizeHtml(input.contactEmail),
    phone: input.phone ? sanitizeHtml(input.phone) : null,
    verificationStatus: "PENDING",
    createdAt: now,
    updatedAt: now
  };
  snapshot.venueProfiles.push(created);
  await persist(snapshot);
  return mapVenue(created);
}

interface ListGigsOptions {
  isPublished?: boolean;
  titleContains?: { value: string; mode: "insensitive" | "default" };
  cityContains?: { value: string; mode: "insensitive" | "default" };
  state?: string;
  compensationType?: GigCompensationType;
  status?: GigStatus;
  minPayout?: number;
  skip?: number;
  take?: number;
  orderByDateStart?: "asc" | "desc";
}

export async function listGigs(options: ListGigsOptions = {}): Promise<Gig[]> {
  const snapshot = await loadSnapshot();
  let records = snapshot.gigs.slice();
  if (options.isPublished !== undefined) {
    records = records.filter((gig) => gig.isPublished === options.isPublished);
  }
  if (options.titleContains) {
    const query = options.titleContains.value.toLowerCase();
    records = records.filter((gig) => gig.title.toLowerCase().includes(query));
  }
  if (options.cityContains) {
    const query = options.cityContains.value.toLowerCase();
    records = records.filter((gig) => gig.city.toLowerCase().includes(query));
  }
  if (options.state) {
    records = records.filter((gig) => gig.state === options.state);
  }
  if (options.compensationType) {
    records = records.filter((gig) => gig.compensationType === options.compensationType);
  }
  if (options.status) {
    records = records.filter((gig) => gig.status === options.status);
  }
  if (typeof options.minPayout === "number") {
    records = records.filter((gig) => (gig.payoutUsd ?? 0) >= options.minPayout!);
  }
  if (options.orderByDateStart === "asc") {
    records.sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());
  } else if (options.orderByDateStart === "desc") {
    records.sort((a, b) => new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime());
  }
  const skip = options.skip ?? 0;
  const take = options.take ?? records.length;
  records = records.slice(skip, skip + take);
  return records.map(mapGig);
}

export async function getGigById(id: string): Promise<Gig | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.gigs.find((gig) => gig.id === id);
  return record ? mapGig(record) : null;
}

interface CreateGigInput extends Omit<GigRecord, "id" | "createdAt" | "updatedAt"> {}

export async function createGig(input: CreateGigInput): Promise<Gig> {
  const snapshot = await loadSnapshot();
  const now = nowIso();
  const gig: GigRecord = {
    id: randomUUID(),
    createdByUserId: input.createdByUserId,
    title: sanitizeHtml(input.title),
    description: sanitizeHtml(input.description),
    compensationType: input.compensationType,
    payoutUsd: input.payoutUsd ?? null,
    dateStart: new Date(input.dateStart).toISOString(),
    dateEnd: input.dateEnd ? new Date(input.dateEnd).toISOString() : null,
    timezone: input.timezone,
    city: sanitizeHtml(input.city),
    state: sanitizeHtml(input.state),
    minAge: input.minAge ?? null,
    isPublished: input.isPublished ?? false,
    status: input.status,
    format: input.format ? sanitizeHtml(input.format) : null,
    setLengthMinutes: input.setLengthMinutes ?? null,
    audienceDescription: input.audienceDescription ? sanitizeHtml(input.audienceDescription) : null,
    totalSpots: input.totalSpots ?? null,
    perks: Array.isArray(input.perks) ? input.perks.map((perk) => sanitizeHtml(perk)) : [],
    createdAt: now,
    updatedAt: now
  };
  snapshot.gigs.push(gig);
  await persist(snapshot);
  return mapGig(gig);
}

export async function updateGig(id: string, data: Partial<Omit<GigRecord, "id" | "createdAt" | "updatedAt">>): Promise<Gig | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.gigs.find((gig) => gig.id === id);
  if (!record) return null;
  if (data.title !== undefined) record.title = sanitizeHtml(data.title);
  if (data.description !== undefined) record.description = sanitizeHtml(data.description);
  if (data.compensationType !== undefined) record.compensationType = data.compensationType;
  if (data.payoutUsd !== undefined) record.payoutUsd = data.payoutUsd;
  if (data.dateStart !== undefined) record.dateStart = new Date(data.dateStart).toISOString();
  if (data.dateEnd !== undefined) {
    record.dateEnd = data.dateEnd ? new Date(data.dateEnd).toISOString() : null;
  }
  if (data.timezone !== undefined) record.timezone = data.timezone;
  if (data.city !== undefined) record.city = sanitizeHtml(data.city);
  if (data.state !== undefined) record.state = sanitizeHtml(data.state);
  if (data.minAge !== undefined) record.minAge = data.minAge;
  if (data.isPublished !== undefined) record.isPublished = data.isPublished;
  if (data.status !== undefined) record.status = data.status;
  if (data.format !== undefined) record.format = data.format ? sanitizeHtml(data.format) : null;
  if (data.setLengthMinutes !== undefined) record.setLengthMinutes = data.setLengthMinutes ?? null;
  if (data.audienceDescription !== undefined)
    record.audienceDescription = data.audienceDescription ? sanitizeHtml(data.audienceDescription) : null;
  if (data.totalSpots !== undefined) record.totalSpots = data.totalSpots ?? null;
  if (data.perks !== undefined)
    record.perks = Array.isArray(data.perks) ? data.perks.map((perk) => sanitizeHtml(perk)) : [];
  record.updatedAt = nowIso();
  await persist(snapshot);
  return mapGig(record);
}

export async function deleteGig(id: string): Promise<void> {
  const snapshot = await loadSnapshot();
  snapshot.gigs = snapshot.gigs.filter((gig) => gig.id !== id);
  await persist(snapshot);
}

export async function listApplicationsForUser(userId: string): Promise<Application[]> {
  const snapshot = await loadSnapshot();
  return snapshot.applications
    .filter((application) => application.comedianUserId === userId)
    .map(mapApplication);
}

export async function countActiveApplicationsForGig(gigId: string): Promise<number> {
  const snapshot = await loadSnapshot();
  const activeStatuses: ApplicationStatus[] = ["SUBMITTED", "SHORTLISTED", "ACCEPTED"];
  return snapshot.applications.filter(
    (application) => application.gigId === gigId && activeStatuses.includes(application.status)
  ).length;
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function computeGigMetrics(snapshot: DatabaseSnapshot, gigId: string): GigMetrics {
  const gig = snapshot.gigs.find((item) => item.id === gigId) ?? null;
  const applications = snapshot.applications.filter((application) => application.gigId === gigId);
  const favorites = snapshot.favorites.filter((favorite) => favorite.gigId === gigId);
  const threads = snapshot.threads.filter((thread) => thread.gigId === gigId);
  const threadIds = new Set(threads.map((thread) => thread.id));
  const messages = snapshot.messages.filter((message) => threadIds.has(message.threadId));
  const bookings = snapshot.bookings.filter((booking) => booking.gigId === gigId);

  const pendingStatuses: ApplicationStatus[] = ["SUBMITTED", "APPLIED", "SHORTLISTED"];

  const timestamps: Array<string | null | undefined> = [gig?.updatedAt ?? gig?.createdAt ?? null];
  applications.forEach((application) => {
    timestamps.push(application.updatedAt ?? application.createdAt);
  });
  threads.forEach((thread) => {
    timestamps.push(thread.updatedAt ?? thread.createdAt);
  });
  messages.forEach((message) => {
    timestamps.push(message.createdAt);
  });
  bookings.forEach((booking) => {
    timestamps.push(booking.createdAt);
  });

  const lastActivityAt = timestamps
    .map(toDate)
    .filter((value): value is Date => value !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  return {
    gigId,
    totalApplications: applications.length,
    pendingApplications: applications.filter((application) => pendingStatuses.includes(application.status)).length,
    favorites: favorites.length,
    bookings: bookings.length,
    threads: threads.length,
    messages: messages.length,
    lastActivityAt,
  };
}

export async function getGigMetrics(gigId: string): Promise<GigMetrics> {
  const snapshot = await loadSnapshot();
  return computeGigMetrics(snapshot, gigId);
}

export async function listGigMetrics(): Promise<GigMetrics[]> {
  const snapshot = await loadSnapshot();
  return snapshot.gigs.map((gig) => computeGigMetrics(snapshot, gig.id));
}

export async function listGigsForUser(userId: string): Promise<Gig[]> {
  const snapshot = await loadSnapshot();
  return snapshot.gigs.filter((gig) => gig.createdByUserId === userId).map(mapGig);
}

export async function listFavoritesForUser(userId: string, options?: { take?: number; order?: "asc" | "desc" }): Promise<Favorite[]> {
  const snapshot = await loadSnapshot();
  let favorites = snapshot.favorites.filter((favorite) => favorite.userId === userId);
  favorites.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return (options?.order ?? "desc") === "desc" ? bTime - aTime : aTime - bTime;
  });
  if (options?.take) {
    favorites = favorites.slice(0, options.take);
  }
  return favorites.map(mapFavorite);
}

export async function getApplicationById(id: string): Promise<Application | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.applications.find((application) => application.id === id);
  return record ? mapApplication(record) : null;
}

interface CreateApplicationInput {
  gigId: string;
  comedianUserId: string;
  message: string;
  status: ApplicationStatus;
}

export async function createApplication(input: CreateApplicationInput): Promise<Application> {
  const snapshot = await loadSnapshot();
  const now = nowIso();
  const record: ApplicationRecord = {
    id: randomUUID(),
    gigId: input.gigId,
    comedianUserId: input.comedianUserId,
    message: sanitizeHtml(input.message),
    status: input.status,
    createdAt: now,
    updatedAt: now
  };
  snapshot.applications.push(record);
  await persist(snapshot);
  return mapApplication(record);
}

export async function updateApplication(
  id: string,
  data: Partial<Omit<ApplicationRecord, "id" | "gigId" | "comedianUserId" | "createdAt" | "updatedAt">> & { status?: ApplicationStatus }
): Promise<Application | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.applications.find((application) => application.id === id);
  if (!record) return null;
  if (data.message !== undefined) record.message = sanitizeHtml(data.message);
  if (data.status !== undefined) record.status = data.status;
  record.updatedAt = nowIso();
  await persist(snapshot);
  return mapApplication(record);
}

export async function listVerificationRequestsByUser(userId: string): Promise<VerificationRequest[]> {
  const snapshot = await loadSnapshot();
  return snapshot.verificationRequests
    .filter((request) => request.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(mapVerification);
}

export async function listVerificationRequests(options?: {
  orderBy?: { createdAt?: "asc" | "desc" };
}): Promise<VerificationRequest[]> {
  const snapshot = await loadSnapshot();
  let records = snapshot.verificationRequests.slice();
  const direction = options?.orderBy?.createdAt ?? "desc";
  records.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return direction === "asc" ? aTime - bTime : bTime - aTime;
  });
  return records.map(mapVerification);
}

export async function getVerificationRequestById(id: string): Promise<VerificationRequest | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.verificationRequests.find((request) => request.id === id);
  return record ? mapVerification(record) : null;
}

interface FindVerificationRequestInput {
  userId?: string;
  orderBy?: { createdAt?: "asc" | "desc" };
}

export async function findLatestVerificationRequest(input: FindVerificationRequestInput): Promise<VerificationRequest | null> {
  const snapshot = await loadSnapshot();
  let records = snapshot.verificationRequests.slice();
  if (input.userId) {
    records = records.filter((request) => request.userId === input.userId);
  }
  const direction = input.orderBy?.createdAt ?? "desc";
  records.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return direction === "asc" ? aTime - bTime : bTime - aTime;
  });
  const record = records[0];
  return record ? mapVerification(record) : null;
}

interface CreateVerificationRequestInput {
  userId: string;
  roleRequested: Role;
  message: string;
  documents: unknown;
  status: VerificationStatus;
}

export async function createVerificationRequest(input: CreateVerificationRequestInput): Promise<VerificationRequest> {
  const snapshot = await loadSnapshot();
  const now = nowIso();
  const record: VerificationRequestRecord = {
    id: randomUUID(),
    userId: input.userId,
    roleRequested: input.roleRequested,
    message: input.message,
    documents: input.documents,
    status: input.status,
    reviewedBy: null,
    createdAt: now,
    updatedAt: now
  };
  snapshot.verificationRequests.push(record);
  await persist(snapshot);
  return mapVerification(record);
}

export async function updateVerificationRequest(
  id: string,
  data: Partial<Omit<VerificationRequestRecord, "id" | "userId" | "createdAt" | "updatedAt">> & { status?: VerificationStatus }
): Promise<VerificationRequest | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.verificationRequests.find((request) => request.id === id);
  if (!record) return null;
  if (data.roleRequested !== undefined) record.roleRequested = data.roleRequested;
  if (data.message !== undefined) record.message = data.message;
  if (data.documents !== undefined) record.documents = data.documents;
  if (data.status !== undefined) record.status = data.status;
  if (data.reviewedBy !== undefined) record.reviewedBy = data.reviewedBy;
  record.updatedAt = nowIso();
  await persist(snapshot);
  return mapVerification(record);
}

export async function addFavorite(input: { userId: string; gigId?: string | null; venueId?: string | null }): Promise<Favorite> {
  const snapshot = await loadSnapshot();
  const now = nowIso();
  const record: FavoriteRecord = {
    id: randomUUID(),
    userId: input.userId,
    gigId: input.gigId ?? null,
    venueId: input.venueId ?? null,
    createdAt: now,
    updatedAt: now
  };
  snapshot.favorites.push(record);
  await persist(snapshot);
  return mapFavorite(record);
}

export async function listThreadsForUser(userId: string): Promise<Thread[]> {
  const snapshot = await loadSnapshot();
  return snapshot.threads
    .filter((thread) => thread.participantIds.includes(userId))
    .map(mapThread)
    .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
}

export async function getThreadById(threadId: string): Promise<Thread | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.threads.find((thread) => thread.id === threadId);
  return record ? mapThread(record) : null;
}

interface CreateThreadInput {
  gigId: string;
  createdById: string;
  participantIds: string[];
  state?: ThreadState;
}

export async function createThread(input: CreateThreadInput): Promise<Thread> {
  const snapshot = await loadSnapshot();
  const now = nowIso();
  const uniqueParticipantIds = Array.from(new Set([input.createdById, ...input.participantIds]));
  const record: ThreadRecord = {
    id: randomUUID(),
    gigId: input.gigId,
    createdById: input.createdById,
    participantIds: uniqueParticipantIds,
    state: input.state ?? "INQUIRY",
    lastMessageAt: now,
    createdAt: now,
    updatedAt: now
  };
  snapshot.threads.push(record);
  await persist(snapshot);
  return mapThread(record);
}

export async function markThreadState(threadId: string, state: ThreadState): Promise<Thread | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.threads.find((thread) => thread.id === threadId);
  if (!record) return null;
  record.state = state;
  record.updatedAt = nowIso();
  await persist(snapshot);
  return mapThread(record);
}

export async function listMessagesForThread(threadId: string): Promise<Message[]> {
  const snapshot = await loadSnapshot();
  return snapshot.messages
    .filter((message) => message.threadId === threadId)
    .map(mapMessage)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

interface CreateMessageInput {
  threadId: string;
  senderId: string;
  kind: MessageKind;
  body?: string | null;
  fileUrl?: string | null;
  offerId?: string | null;
}

export async function createMessage(input: CreateMessageInput): Promise<Message> {
  const snapshot = await loadSnapshot();
  const thread = snapshot.threads.find((item) => item.id === input.threadId);
  if (!thread) {
    throw new Error("Thread not found");
  }
  const now = nowIso();
  const record: MessageRecord = {
    id: randomUUID(),
    threadId: input.threadId,
    senderId: input.senderId,
    kind: input.kind,
    body: input.body ? sanitizeHtml(input.body) : null,
    fileUrl: input.fileUrl ?? null,
    offerId: input.offerId ?? null,
    createdAt: now
  };
  snapshot.messages.push(record);
  thread.lastMessageAt = now;
  thread.updatedAt = now;
  await persist(snapshot);
  return mapMessage(record);
}

export async function listCommunityBoardMessages(): Promise<CommunityBoardMessage[]> {
  const snapshot = await loadSnapshot();
  return snapshot.communityBoardMessages
    .map(mapCommunityBoardMessage)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

interface CreateCommunityBoardMessageInput {
  authorId: string;
  authorRole: Role;
  content: string;
  category: CommunityBoardCategory;
  gigTitle?: string | null;
  gigAddress?: string | null;
  gigCity?: string | null;
  gigState?: string | null;
  gigContactName?: string | null;
  gigContactEmail?: string | null;
  gigSlotsAvailable?: number | null;
}

export async function createCommunityBoardMessage(
  input: CreateCommunityBoardMessageInput
): Promise<CommunityBoardMessage> {
  const snapshot = await loadSnapshot();
  const now = nowIso();
  const record: CommunityBoardMessageRecord = {
    id: randomUUID(),
    authorId: input.authorId,
    authorRole: input.authorRole,
    content: sanitizeHtml(input.content),
    category: input.category,
    isPinned: false,
    gigTitle: input.gigTitle ? sanitizeHtml(input.gigTitle) : null,
    gigAddress: input.gigAddress ? sanitizeHtml(input.gigAddress) : null,
    gigCity: input.gigCity ? sanitizeHtml(input.gigCity) : null,
    gigState: input.gigState ? sanitizeHtml(input.gigState) : null,
    gigContactName: input.gigContactName ? sanitizeHtml(input.gigContactName) : null,
    gigContactEmail: input.gigContactEmail ? sanitizeHtml(input.gigContactEmail) : null,
    gigSlotsAvailable: input.gigSlotsAvailable ?? null,
    createdAt: now,
    updatedAt: now
  };
  snapshot.communityBoardMessages.push(record);
  await persist(snapshot);
  return mapCommunityBoardMessage(record);
}

interface UpdateCommunityBoardMessageInput {
  content?: string;
  category?: CommunityBoardCategory;
  isPinned?: boolean;
}

export async function updateCommunityBoardMessage(
  id: string,
  actorId: string,
  data: UpdateCommunityBoardMessageInput
): Promise<CommunityBoardMessage | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.communityBoardMessages.find((message) => message.id === id);
  if (!record) return null;
  if (record.authorId !== actorId) {
    return null;
  }
  if (data.content !== undefined) {
    record.content = sanitizeHtml(data.content);
  }
  if (data.category !== undefined) {
    record.category = data.category;
  }
  if (data.isPinned !== undefined) {
    record.isPinned = data.isPinned;
  }
  record.updatedAt = nowIso();
  await persist(snapshot);
  return mapCommunityBoardMessage(record);
}

export async function listCommunityPosts(): Promise<CommunityPost[]> {
  const snapshot = await loadSnapshot();
  return snapshot.communityPosts
    .map(mapCommunityPost)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getCommunityPostById(id: string): Promise<CommunityPost | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.communityPosts.find((post) => post.id === id);
  return record ? mapCommunityPost(record) : null;
}

export async function listCommunityReplies(): Promise<CommunityReply[]> {
  const snapshot = await loadSnapshot();
  return snapshot.communityReplies
    .map(mapCommunityReply)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export async function listCommunityRepliesForPost(postId: string): Promise<CommunityReply[]> {
  const snapshot = await loadSnapshot();
  return snapshot.communityReplies
    .filter((reply) => reply.postId === postId)
    .map(mapCommunityReply)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export async function getCommunityReplyById(id: string): Promise<CommunityReply | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.communityReplies.find((reply) => reply.id === id);
  return record ? mapCommunityReply(record) : null;
}

interface CreateCommunityPostInput {
  authorId: string;
  title: string;
  content: string;
}

export async function createCommunityPost(input: CreateCommunityPostInput): Promise<CommunityPost> {
  const snapshot = await loadSnapshot();
  const now = nowIso();
  const record: CommunityPostRecord = {
    id: randomUUID(),
    authorId: input.authorId,
    title: sanitizeHtml(input.title),
    content: sanitizeHtml(input.content),
    createdAt: now,
    updatedAt: now
  };
  snapshot.communityPosts.push(record);
  await persist(snapshot);
  return mapCommunityPost(record);
}

interface CreateCommunityReplyInput {
  postId: string;
  authorId: string;
  content: string;
}

export async function createCommunityReply(
  input: CreateCommunityReplyInput
): Promise<CommunityReply | null> {
  const snapshot = await loadSnapshot();
  const postExists = snapshot.communityPosts.some((post) => post.id === input.postId);
  if (!postExists) {
    return null;
  }
  const now = nowIso();
  const record: CommunityReplyRecord = {
    id: randomUUID(),
    postId: input.postId,
    authorId: input.authorId,
    content: sanitizeHtml(input.content),
    createdAt: now,
    updatedAt: now
  };
  snapshot.communityReplies.push(record);
  await persist(snapshot);
  return mapCommunityReply(record);
}

interface SetCommunityVoteInput {
  userId: string;
  targetType: CommunityVoteTarget;
  targetId: string;
  value: -1 | 0 | 1;
}

export async function setCommunityVote(
  input: SetCommunityVoteInput
): Promise<CommunityVote | null> {
  const snapshot = await loadSnapshot();
  const existing = snapshot.communityVotes.find(
    (vote) =>
      vote.userId === input.userId &&
      vote.targetType === input.targetType &&
      vote.targetId === input.targetId
  );

  if (input.value === 0) {
    if (existing) {
      snapshot.communityVotes = snapshot.communityVotes.filter((vote) => vote !== existing);
      await persist(snapshot);
    }
    return null;
  }

  const normalizedValue: -1 | 1 = input.value < 0 ? -1 : 1;

  if (existing) {
    if (existing.value === normalizedValue) {
      snapshot.communityVotes = snapshot.communityVotes.filter((vote) => vote !== existing);
      await persist(snapshot);
      return null;
    }
    existing.value = normalizedValue;
    existing.updatedAt = nowIso();
    await persist(snapshot);
    return mapCommunityVote(existing);
  }

  const now = nowIso();
  const record: CommunityVoteRecord = {
    id: randomUUID(),
    targetType: input.targetType,
    targetId: input.targetId,
    userId: input.userId,
    value: normalizedValue,
    createdAt: now,
    updatedAt: now
  };
  snapshot.communityVotes.push(record);
  await persist(snapshot);
  return mapCommunityVote(record);
}

export async function listCommunityVotes(): Promise<CommunityVote[]> {
  const snapshot = await loadSnapshot();
  return snapshot.communityVotes.map(mapCommunityVote);
}

interface CreateAdSlotInput {
  page: AdSlotPage;
  placement: AdSlotPlacement;
  html?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  active?: boolean;
  priority?: number;
}

export async function createAdSlot(input: CreateAdSlotInput): Promise<AdSlot> {
  const snapshot = await loadSnapshot();
  const now = nowIso();
  const record: AdSlotRecord = {
    id: randomUUID(),
    page: input.page,
    placement: input.placement,
    html: input.html ? sanitizeHtml(input.html) : undefined,
    imageUrl: input.imageUrl ? sanitizeHtml(input.imageUrl) : undefined,
    linkUrl: input.linkUrl ? sanitizeHtml(input.linkUrl) : undefined,
    active: input.active ?? true,
    priority: typeof input.priority === "number" ? input.priority : 0,
    createdAt: now,
    updatedAt: now
  };
  snapshot.adSlots.push(record);
  await persist(snapshot);
  return mapAdSlot(record);
}

export async function listAdSlots(page: AdSlotPage, placement: AdSlotPlacement): Promise<AdSlot[]> {
  const snapshot = await loadSnapshot();
  return snapshot.adSlots
    .filter((slot) => slot.page === page && slot.placement === placement && slot.active)
    .map(mapAdSlot)
    .sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
}

export async function toggleAdSlot(id: string, active: boolean): Promise<AdSlot | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.adSlots.find((slot) => slot.id === id);
  if (!record) return null;
  record.active = active;
  record.updatedAt = nowIso();
  await persist(snapshot);
  return mapAdSlot(record);
}

export async function listAllAdSlots(): Promise<AdSlot[]> {
  const snapshot = await loadSnapshot();
  return snapshot.adSlots
    .map(mapAdSlot)
    .sort((a, b) => {
      if (a.page !== b.page) {
        return a.page.localeCompare(b.page);
      }
      if (a.placement !== b.placement) {
        return a.placement.localeCompare(b.placement);
      }
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
}

interface UpdateAdSlotInput {
  page?: AdSlotPage;
  placement?: AdSlotPlacement;
  html?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  active?: boolean;
  priority?: number;
}

export async function updateAdSlot(id: string, input: UpdateAdSlotInput): Promise<AdSlot | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.adSlots.find((slot) => slot.id === id);
  if (!record) return null;

  if (input.page) {
    record.page = input.page;
  }
  if (input.placement) {
    record.placement = input.placement;
  }
  if (input.html !== undefined) {
    record.html = input.html ? sanitizeHtml(input.html) : undefined;
  }
  if (input.imageUrl !== undefined) {
    record.imageUrl = input.imageUrl ? sanitizeHtml(input.imageUrl) : undefined;
  }
  if (input.linkUrl !== undefined) {
    record.linkUrl = input.linkUrl ? sanitizeHtml(input.linkUrl) : undefined;
  }
  if (typeof input.active === "boolean") {
    record.active = input.active;
  }
  if (typeof input.priority === "number" && Number.isFinite(input.priority)) {
    record.priority = input.priority;
  }

  record.updatedAt = nowIso();
  await persist(snapshot);
  return mapAdSlot(record);
}

export async function deleteAdSlot(id: string): Promise<boolean> {
  const snapshot = await loadSnapshot();
  const initialLength = snapshot.adSlots.length;
  snapshot.adSlots = snapshot.adSlots.filter((slot) => slot.id !== id);
  if (snapshot.adSlots.length === initialLength) {
    return false;
  }
  await persist(snapshot);
  return true;
}

interface CreateOfferInput {
  threadId: string;
  fromUserId: string;
  amount: number;
  currency?: string;
  terms: string;
  eventDate: Date;
  expiresAt?: Date | null;
}

export async function createOffer(input: CreateOfferInput): Promise<Offer> {
  const snapshot = await loadSnapshot();
  const now = nowIso();
  const record: OfferRecord = {
    id: randomUUID(),
    threadId: input.threadId,
    fromUserId: input.fromUserId,
    amount: input.amount,
    currency: input.currency ?? "USD",
    terms: sanitizeHtml(input.terms),
    eventDate: input.eventDate.toISOString(),
    expiresAt: input.expiresAt ? input.expiresAt.toISOString() : null,
    status: "PENDING",
    createdAt: now
  };
  snapshot.offers.push(record);
  await persist(snapshot);
  return mapOffer(record);
}

export async function listOffersForThread(threadId: string): Promise<Offer[]> {
  const snapshot = await loadSnapshot();
  return snapshot.offers
    .filter((offer) => offer.threadId === threadId)
    .map(mapOffer)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getOfferById(offerId: string): Promise<Offer | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.offers.find((offer) => offer.id === offerId);
  return record ? mapOffer(record) : null;
}

export async function updateOfferStatus(offerId: string, status: OfferStatus): Promise<Offer | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.offers.find((offer) => offer.id === offerId);
  if (!record) return null;
  record.status = status;
  await persist(snapshot);
  return mapOffer(record);
}

export async function listBookingsForThread(threadId: string): Promise<Booking[]> {
  const snapshot = await loadSnapshot();
  const offerIdsForThread = new Set(
    snapshot.offers.filter((offer) => offer.threadId === threadId).map((offer) => offer.id)
  );

  if (offerIdsForThread.size === 0) {
    return [];
  }

  return snapshot.bookings
    .filter((booking) => offerIdsForThread.has(booking.offerId))
    .map(mapBooking)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

interface CreateBookingInput {
  gigId: string;
  comedianId: string;
  promoterId: string;
  offerId: string;
  status?: BookingStatus;
  payoutProtection?: boolean;
  cancellationPolicy?: CancellationPolicy;
  paymentIntentId?: string | null;
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const snapshot = await loadSnapshot();
  const now = nowIso();
  const record: BookingRecord = {
    id: randomUUID(),
    gigId: input.gigId,
    comedianId: input.comedianId,
    promoterId: input.promoterId,
    offerId: input.offerId,
    status: input.status ?? "PENDING",
    payoutProtection: input.payoutProtection ?? true,
    cancellationPolicy: input.cancellationPolicy ?? "STANDARD",
    paymentIntentId: input.paymentIntentId ?? null,
    createdAt: now
  };
  snapshot.bookings.push(record);
  await persist(snapshot);
  return mapBooking(record);
}

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.bookings.find((booking) => booking.id === bookingId);
  return record ? mapBooking(record) : null;
}

export async function listBookingsForComedian(userId: string): Promise<Booking[]> {
  const snapshot = await loadSnapshot();
  return snapshot.bookings
    .filter((booking) => booking.comedianId === userId)
    .map(mapBooking)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export async function listBookingsForPromoter(userId: string): Promise<Booking[]> {
  const snapshot = await loadSnapshot();
  return snapshot.bookings
    .filter((booking) => booking.promoterId === userId)
    .map(mapBooking)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export async function listBookingsForGig(gigId: string): Promise<Booking[]> {
  const snapshot = await loadSnapshot();
  return snapshot.bookings
    .filter((booking) => booking.gigId === gigId)
    .map(mapBooking)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export async function updateBooking(
  bookingId: string,
  data: Partial<Omit<BookingRecord, "id" | "gigId" | "comedianId" | "promoterId" | "offerId" | "createdAt">>
): Promise<Booking | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.bookings.find((booking) => booking.id === bookingId);
  if (!record) return null;
  if (data.status !== undefined) record.status = data.status;
  if (data.payoutProtection !== undefined) record.payoutProtection = data.payoutProtection;
  if (data.cancellationPolicy !== undefined) record.cancellationPolicy = data.cancellationPolicy;
  if (data.paymentIntentId !== undefined) record.paymentIntentId = data.paymentIntentId;
  await persist(snapshot);
  return mapBooking(record);
}

interface CreateConversationReviewInput {
  bookingId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  body: string;
  visible?: boolean;
}

export async function createConversationReview(input: CreateConversationReviewInput): Promise<ConversationReview> {
  const snapshot = await loadSnapshot();
  const record: ConversationReviewRecord = {
    id: randomUUID(),
    bookingId: input.bookingId,
    fromUserId: input.fromUserId,
    toUserId: input.toUserId,
    rating: input.rating,
    body: sanitizeHtml(input.body),
    visible: input.visible ?? true,
    createdAt: nowIso()
  };
  snapshot.conversationReviews.push(record);
  await persist(snapshot);
  return mapConversationReview(record);
}

export async function listConversationReviewsForUser(userId: string): Promise<ConversationReview[]> {
  const snapshot = await loadSnapshot();
  return snapshot.conversationReviews
    .filter((review) => review.toUserId === userId)
    .map(mapConversationReview)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function listConversationReviewsForBooking(bookingId: string): Promise<ConversationReview[]> {
  const snapshot = await loadSnapshot();
  return snapshot.conversationReviews
    .filter((review) => review.bookingId === bookingId)
    .map(mapConversationReview)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

interface CreateReviewInput {
  authorUserId: string;
  subjectUserId: string;
  gigId: string;
  rating: number;
  comment: string;
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const snapshot = await loadSnapshot();
  const now = nowIso();
  const record: ReviewRecord = {
    id: randomUUID(),
    authorUserId: input.authorUserId,
    subjectUserId: input.subjectUserId,
    gigId: input.gigId,
    rating: normalizeReviewRating(input.rating),
    comment: sanitizeHtml(input.comment),
    visible: true,
    createdAt: now
  };
  snapshot.reviews.push(record);
  await persist(snapshot);
  return mapReview(record);
}

export async function listReviewsForUser(subjectUserId: string): Promise<Review[]> {
  const snapshot = await loadSnapshot();
  return snapshot.reviews
    .filter((review) => review.subjectUserId === subjectUserId && review.visible !== false)
    .map(mapReview)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function listReviewsForGig(gigId: string): Promise<Review[]> {
  const snapshot = await loadSnapshot();
  return snapshot.reviews
    .filter((review) => review.gigId === gigId && review.visible !== false)
    .map(mapReview)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function scheduleReviewRemindersForPastBookings(): Promise<number> {
  const snapshot = await loadSnapshot();
  const gigMap = new Map(snapshot.gigs.map((gig) => [gig.id, gig]));
  const now = Date.now();
  let created = 0;

  for (const booking of snapshot.bookings) {
    if (!booking) continue;
    if (!booking.status || !["PAID", "COMPLETED"].includes(booking.status)) {
      continue;
    }

    const gig = gigMap.get(booking.gigId);
    if (!gig) continue;

    const eventTime = new Date(gig.dateStart).getTime();
    if (!Number.isFinite(eventTime) || eventTime > now) {
      continue;
    }

    const participantIds = [booking.comedianId, booking.promoterId].filter(Boolean);
    for (const participantId of participantIds) {
      const offsets = [24, 24 * 7];
      for (const hours of offsets) {
        const sendAt = new Date(eventTime + hours * 60 * 60 * 1000).toISOString();
        const exists = snapshot.reviewReminders.some(
          (reminder) =>
            reminder.bookingId === booking.id &&
            reminder.recipientUserId === participantId &&
            reminder.sendAt === sendAt
        );

        if (!exists) {
          snapshot.reviewReminders.push({
            id: randomUUID(),
            bookingId: booking.id,
            recipientUserId: participantId,
            sendAt,
            sentAt: null,
            createdAt: nowIso(),
          });
          created += 1;
        }
      }
    }
  }

  if (created > 0) {
    await persist(snapshot);
  }

  return created;
}

export async function listAllReviews(): Promise<Review[]> {
  const snapshot = await loadSnapshot();
  return snapshot.reviews.map(mapReview).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function setReviewVisibility(reviewId: string, visible: boolean): Promise<Review | null> {
  const snapshot = await loadSnapshot();
  const record = snapshot.reviews.find((review) => review.id === reviewId);
  if (!record) return null;
  record.visible = visible;
  await persist(snapshot);
  return mapReview(record);
}

export async function listFeatureFlags(): Promise<FeatureFlag[]> {
  const snapshot = await loadSnapshot();
  const overrides = snapshot.featureFlags ?? [];
  const overrideMap = new Map(overrides.map((flag) => [flag.key, flag] as const));
  const keys = Object.keys(FEATURE_FLAG_DEFAULTS) as FeatureFlagKey[];

  return keys.map((key) => {
    const record = overrideMap.get(key);
    if (record) {
      return mapFeatureFlag(record);
    }
    const defaultFlag: FeatureFlag = {
      key,
      enabled: FEATURE_FLAG_DEFAULTS[key],
      updatedAt: new Date(0),
    };
    return defaultFlag;
  });
}

export async function setFeatureFlag(key: FeatureFlagKey, enabled: boolean): Promise<FeatureFlag> {
  const snapshot = await loadSnapshot();
  const now = new Date().toISOString();
  const record = snapshot.featureFlags.find((flag) => flag.key === key);
  if (record) {
    record.enabled = enabled;
    record.updatedAt = now;
  } else {
    snapshot.featureFlags.push({ key, enabled, updatedAt: now });
  }
  await persist(snapshot);
  return mapFeatureFlag({ key, enabled, updatedAt: now });
}

export async function isFeatureFlagEnabled(key: FeatureFlagKey): Promise<boolean> {
  const snapshot = await loadSnapshot();
  return getFeatureFlagValue(snapshot, key);
}

export async function listAvailabilityForUser(userId: string): Promise<Availability[]> {
  const snapshot = await loadSnapshot();
  return snapshot.availability
    .filter((record) => record.userId === userId)
    .map(mapAvailability)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

interface CreateReportInput {
  reporterId: string;
  targetType: ReportRecord["targetType"];
  targetId: string;
  reason: string;
  details?: string | null;
}

export async function createReport(input: CreateReportInput): Promise<Report> {
  const snapshot = await loadSnapshot();
  const record: ReportRecord = {
    id: randomUUID(),
    reporterId: input.reporterId,
    targetType: input.targetType,
    targetId: input.targetId,
    reason: input.reason,
    details: input.details ? sanitizeHtml(input.details) : null,
    createdAt: nowIso(),
    resolvedAt: null
  };
  snapshot.reports.push(record);
  await persist(snapshot);
  return mapReport(record);
}

export async function listReports(): Promise<Report[]> {
  const snapshot = await loadSnapshot();
  return snapshot.reports.map(mapReport).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export type DatabaseUser = User;
export type DatabaseGig = Gig;
export type DatabaseApplication = Application;
export type DatabaseVerificationRequest = VerificationRequest;
