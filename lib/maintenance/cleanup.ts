import { promises as fs } from "node:fs";
import path from "node:path";
import type { DatabaseSnapshot } from "@/types/database";
import { WHITELIST_EMAILS } from "./whitelist";

const DATA_DIR = path.join(process.cwd(), "data");
const DATABASE_PATH = path.join(DATA_DIR, "database.json");

interface CollectionReport {
  kept: number;
  removed: number;
}

export interface CleanupReport {
  generatedAt: string;
  whitelist: string[];
  collections: Record<string, CollectionReport>;
  scrubbedAdSlotEmails: string[];
}

const EMPTY_SNAPSHOT: DatabaseSnapshot = {
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
  adSlots: [],
  featureFlags: []
};

async function ensureDataStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATABASE_PATH);
  } catch {
    await fs.writeFile(DATABASE_PATH, JSON.stringify(EMPTY_SNAPSHOT, null, 2));
  }
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
    adSlots: snapshot.adSlots ?? [],
    featureFlags: snapshot.featureFlags ?? []
  };
}

export async function loadSnapshot(): Promise<DatabaseSnapshot> {
  await ensureDataStore();
  const raw = await fs.readFile(DATABASE_PATH, "utf-8");
  try {
    return withDefaults(JSON.parse(raw) as Partial<DatabaseSnapshot>);
  } catch {
    return JSON.parse(JSON.stringify(EMPTY_SNAPSHOT)) as DatabaseSnapshot;
  }
}

export async function saveSnapshot(snapshot: DatabaseSnapshot): Promise<void> {
  await ensureDataStore();
  await fs.writeFile(DATABASE_PATH, JSON.stringify(snapshot, null, 2));
}

export function resolveWhitelistedUserIds(snapshot: DatabaseSnapshot): Set<string> {
  const ids = new Set<string>();
  for (const user of snapshot.users) {
    if (WHITELIST_EMAILS.has(user.email)) {
      ids.add(user.id);
    }
  }
  return ids;
}

function filterWithReport<T>(
  items: T[],
  predicate: (item: T) => boolean,
  key: keyof DatabaseSnapshot | string,
  reports: Record<string, CollectionReport>
): T[] {
  const filtered = items.filter(predicate);
  reports[String(key)] = {
    kept: filtered.length,
    removed: items.length - filtered.length
  };
  return filtered;
}

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function scrubAdSlots(
  adSlots: DatabaseSnapshot["adSlots"],
  reports: Record<string, CollectionReport>
): { cleaned: DatabaseSnapshot["adSlots"]; emailsRemoved: string[] } {
  const emailsRemoved = new Set<string>();
  const cleaned = adSlots.map((slot) => {
    let scrubbed = slot;
    const fields: Array<["html" | "imageUrl" | "linkUrl", string | undefined]> = [
      ["html", slot.html],
      ["imageUrl", slot.imageUrl],
      ["linkUrl", slot.linkUrl]
    ];
    for (const [field, value] of fields) {
      if (typeof value !== "string") continue;
      const matches = value.match(EMAIL_PATTERN);
      if (!matches) continue;
      const offending = matches.filter((email) => !WHITELIST_EMAILS.has(email));
      if (offending.length === 0) continue;
      if (scrubbed === slot) {
        scrubbed = { ...slot };
      }
      offending.forEach((email) => emailsRemoved.add(email));
      if (field === "html") {
        delete scrubbed.html;
      } else if (field === "imageUrl") {
        delete scrubbed.imageUrl;
      } else {
        delete scrubbed.linkUrl;
      }
    }
    return scrubbed;
  });

  reports.adSlots = {
    kept: cleaned.length,
    removed: 0
  };

  return { cleaned, emailsRemoved: Array.from(emailsRemoved).sort() };
}

function buildReport(
  reports: Record<string, CollectionReport>,
  scrubbedAdSlotEmails: string[]
): CleanupReport {
  return {
    generatedAt: new Date().toISOString(),
    whitelist: Array.from(WHITELIST_EMAILS).sort(),
    collections: reports,
    scrubbedAdSlotEmails
  };
}

function pruneSnapshot(snapshot: DatabaseSnapshot): {
  snapshot: DatabaseSnapshot;
  report: CleanupReport;
} {
  const reports: Record<string, CollectionReport> = {};

  const users = filterWithReport(
    snapshot.users,
    (user) => WHITELIST_EMAILS.has(user.email),
    "users",
    reports
  );
  const keptUserIds = new Set(users.map((user) => user.id));

  const comedianProfiles = filterWithReport(
    snapshot.comedianProfiles,
    (profile) => keptUserIds.has(profile.userId),
    "comedianProfiles",
    reports
  );

  const promoterProfiles = filterWithReport(
    snapshot.promoterProfiles,
    (profile) => keptUserIds.has(profile.userId),
    "promoterProfiles",
    reports
  );

  const venueProfiles = filterWithReport(
    snapshot.venueProfiles,
    (profile) => keptUserIds.has(profile.userId),
    "venueProfiles",
    reports
  );

  const availability = filterWithReport(
    snapshot.availability,
    (record) => keptUserIds.has(record.userId),
    "availability",
    reports
  );

  const comedianVideos = filterWithReport(
    snapshot.comedianVideos,
    (video) => keptUserIds.has(video.comedianUserId),
    "comedianVideos",
    reports
  );

  const gigs = filterWithReport(
    snapshot.gigs,
    (gig) => keptUserIds.has(gig.createdByUserId),
    "gigs",
    reports
  );
  const keptGigIds = new Set(gigs.map((gig) => gig.id));

  const comedianAppearances = filterWithReport(
    snapshot.comedianAppearances,
    (appearance) =>
      keptUserIds.has(appearance.comedianUserId) &&
      (!appearance.gigId || keptGigIds.has(appearance.gigId)),
    "comedianAppearances",
    reports
  );

  const applications = filterWithReport(
    snapshot.applications,
    (application) =>
      keptGigIds.has(application.gigId) &&
      keptUserIds.has(application.comedianUserId),
    "applications",
    reports
  );

  const verificationRequests = filterWithReport(
    snapshot.verificationRequests,
    (request) => keptUserIds.has(request.userId),
    "verificationRequests",
    reports
  );

  const favorites = filterWithReport(
    snapshot.favorites,
    (favorite) =>
      keptUserIds.has(favorite.userId) &&
      (!favorite.gigId || keptGigIds.has(favorite.gigId)) &&
      (!favorite.venueId || keptUserIds.has(favorite.venueId)),
    "favorites",
    reports
  );

  const threads = filterWithReport(
    snapshot.threads,
    (thread) =>
      keptGigIds.has(thread.gigId) &&
      keptUserIds.has(thread.createdById) &&
      thread.participantIds.every((participantId) => keptUserIds.has(participantId)),
    "threads",
    reports
  );
  const keptThreadIds = new Set(threads.map((thread) => thread.id));

  const offers = filterWithReport(
    snapshot.offers,
    (offer) => keptThreadIds.has(offer.threadId) && keptUserIds.has(offer.fromUserId),
    "offers",
    reports
  );
  const keptOfferIds = new Set(offers.map((offer) => offer.id));

  const messages = filterWithReport(
    snapshot.messages,
    (message) =>
      keptThreadIds.has(message.threadId) &&
      keptUserIds.has(message.senderId) &&
      (!message.offerId || keptOfferIds.has(message.offerId)),
    "messages",
    reports
  );

  const bookings = filterWithReport(
    snapshot.bookings,
    (booking) =>
      keptGigIds.has(booking.gigId) &&
      keptOfferIds.has(booking.offerId) &&
      keptUserIds.has(booking.comedianId) &&
      keptUserIds.has(booking.promoterId),
    "bookings",
    reports
  );
  const keptBookingIds = new Set(bookings.map((booking) => booking.id));

  const conversationReviews = filterWithReport(
    snapshot.conversationReviews,
    (review) =>
      keptBookingIds.has(review.bookingId) &&
      keptUserIds.has(review.fromUserId) &&
      keptUserIds.has(review.toUserId),
    "conversationReviews",
    reports
  );

  const reviews = filterWithReport(
    snapshot.reviews,
    (review) =>
      keptUserIds.has(review.authorUserId) &&
      keptUserIds.has(review.subjectUserId) &&
      keptGigIds.has(review.gigId),
    "reviews",
    reports
  );

  const reviewReminders = filterWithReport(
    snapshot.reviewReminders,
    (reminder) =>
      keptBookingIds.has(reminder.bookingId) &&
      keptUserIds.has(reminder.recipientUserId),
    "reviewReminders",
    reports
  );

  const communityBoardMessages = filterWithReport(
    snapshot.communityBoardMessages,
    (message) => keptUserIds.has(message.authorId),
    "communityBoardMessages",
    reports
  );

  const reportsCollection = filterWithReport(
    snapshot.reports,
    (record) =>
      keptUserIds.has(record.reporterId) &&
      (keptUserIds.has(record.targetId) ||
        keptGigIds.has(record.targetId) ||
        keptThreadIds.has(record.targetId) ||
        keptOfferIds.has(record.targetId) ||
        keptBookingIds.has(record.targetId)),
    "reports",
    reports
  );

  const { cleaned: adSlots, emailsRemoved } = scrubAdSlots(snapshot.adSlots, reports);

  reports.featureFlags = {
    kept: snapshot.featureFlags.length,
    removed: 0
  };

  const prunedSnapshot = withDefaults({
    users,
    comedianProfiles,
    comedianVideos,
    comedianAppearances,
    promoterProfiles,
    venueProfiles,
    gigs,
    applications,
    verificationRequests,
    favorites,
    threads,
    messages,
    offers,
    bookings,
    conversationReviews,
    reviews,
    reviewReminders,
    availability,
    reports: reportsCollection,
    communityBoardMessages,
    adSlots,
    featureFlags: snapshot.featureFlags
  });

  const report = buildReport(reports, emailsRemoved);

  return { snapshot: prunedSnapshot, report };
}

export async function cleanupSnapshot(): Promise<{
  snapshot: DatabaseSnapshot;
  report: CleanupReport;
}> {
  const snapshot = await loadSnapshot();
  const { snapshot: cleanedSnapshot, report } = pruneSnapshot(snapshot);
  await saveSnapshot(cleanedSnapshot);
  return { snapshot: cleanedSnapshot, report };
}

export type { CollectionReport };
