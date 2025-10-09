import { promises as fs } from "node:fs";
import path from "node:path";
import {
  type AdSlotRecord,
  type AvailabilityRecord,
  type BookingRecord,
  type ComedianAppearanceRecord,
  type ComedianProfileRecord,
  type ComedianVideoRecord,
  type ConversationReviewRecord,
  type DatabaseSnapshot,
  type FavoriteRecord,
  type GigRecord,
  type MessageRecord,
  type OfferRecord,
  type PromoterProfileRecord,
  type ReviewRecord,
  type ThreadRecord,
  type UserRecord,
  type VenueProfileRecord,
  type FeatureFlagRecord,
} from "@/types/database";
import { FeatureFlagKey, getDefaultFeatureFlags } from "@/lib/config/flags";

const DATA_PATH = path.join(process.cwd(), "data", "database.json");
const HASHED_PASSWORD = "$2a$10$NSAXdlvRg.IVwMnoneGfMOmzMDy3JWta4qTJPUJWtfNK14Zj.NfLa"; // DemoPass123!

const iso = (value: string): string => new Date(value).toISOString();
const date = (month: number, day: number, hour = 12): string =>
  iso(`2024-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00Z`);

const users: UserRecord[] = [
  {
    id: "user-admin",
    name: "Alex Admin",
    email: "admin@thefunny.local",
    hashedPassword: HASHED_PASSWORD,
    role: "ADMIN",
    createdAt: date(1, 1, 9),
    isPremium: false,
    premiumSince: null,
  },
  {
    id: "user-promoter",
    name: "Paula Promoter",
    email: "promoter@thefunny.local",
    hashedPassword: HASHED_PASSWORD,
    role: "PROMOTER",
    createdAt: date(1, 2, 10),
    isPremium: false,
    premiumSince: null,
  },
  {
    id: "user-venue",
    name: "Harbor Lights",
    email: "venue@thefunny.local",
    hashedPassword: HASHED_PASSWORD,
    role: "VENUE",
    createdAt: date(1, 2, 11),
    isPremium: false,
    premiumSince: null,
  },
  {
    id: "user-comic1",
    name: "Casey Quick",
    email: "comic1@thefunny.local",
    hashedPassword: HASHED_PASSWORD,
    role: "COMEDIAN",
    createdAt: date(1, 3, 9),
    isPremium: false,
    premiumSince: null,
  },
  {
    id: "user-comic2",
    name: "Riley Riff",
    email: "comic2@thefunny.local",
    hashedPassword: HASHED_PASSWORD,
    role: "COMEDIAN",
    createdAt: date(1, 4, 9),
    isPremium: true,
    premiumSince: date(2, 1, 8),
  },
  {
    id: "user-fan",
    name: "Frankie Fan",
    email: "fan@thefunny.local",
    hashedPassword: HASHED_PASSWORD,
    role: "FAN",
    createdAt: date(1, 5, 10),
    isPremium: false,
    premiumSince: null,
  },
];

const availability: AvailabilityRecord[] = [
  {
    id: "avail-comic1-weekend",
    userId: "user-comic1",
    date: date(5, 18),
    status: "free",
  },
  {
    id: "avail-comic1-weeknight",
    userId: "user-comic1",
    date: date(5, 22),
    status: "busy",
  },
  {
    id: "avail-comic2-weekend",
    userId: "user-comic2",
    date: date(5, 25),
    status: "free",
  },
  {
    id: "avail-comic2-weeknight",
    userId: "user-comic2",
    date: date(5, 29),
    status: "free",
  },
];

const promoterProfiles: PromoterProfileRecord[] = [
  {
    userId: "user-promoter",
    organization: "Northwest Laugh Co.",
    contactName: "Paula Promoter",
    phone: "206-555-1212",
    website: "https://northwestlaughs.example.com",
    verificationStatus: "APPROVED",
    createdAt: date(1, 7, 9),
    updatedAt: date(4, 1, 9),
  },
];

const venueProfiles: VenueProfileRecord[] = [
  {
    userId: "user-venue",
    venueName: "Harbor Lights Comedy Club",
    address1: "123 Pier Ave",
    address2: null,
    city: "Portland",
    state: "OR",
    postalCode: "97205",
    capacity: 180,
    contactEmail: "bookings@harborlights.local",
    phone: "503-555-4242",
    verificationStatus: "APPROVED",
    createdAt: date(1, 8, 9),
    updatedAt: date(4, 1, 10),
  },
];

const comedianProfiles: ComedianProfileRecord[] = [
  {
    userId: "user-comic1",
    stageName: "Casey Quick",
    bio: "High-energy comic delivering quick punchlines about tech, transit, and PNW rainstorms.",
    credits: "Seattle International Comedy Competition",
    website: "https://caseyquick.live",
    reelUrl: "https://youtu.be/casey-quick-reel",
    instagram: "@caseyquickcomedy",
    tiktokHandle: "@caseyquick",
    youtubeChannel: "https://www.youtube.com/@caseyquick",
    travelRadiusMiles: 150,
    homeCity: "Seattle",
    homeState: "WA",
    styles: ["Observational", "Storytelling"],
    cleanRating: "PG13",
    rateMin: 300,
    rateMax: 600,
    reelUrls: ["https://youtu.be/casey-quick-reel"],
    photoUrls: ["https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80"],
    notableClubs: ["Laughs Comedy Club", "Capitol Cider"],
    availability: availability.filter((slot) => slot.userId === "user-comic1"),
    createdAt: date(2, 1, 12),
    updatedAt: date(4, 20, 11),
  },
  {
    userId: "user-comic2",
    stageName: "Riley Riff",
    bio: "Clean-meets-clever comic mixing guitar bits with heartfelt storytelling.",
    credits: "Helium Portland Showcase",
    website: "https://rileyriff.live",
    reelUrl: "https://youtu.be/riley-riff-reel",
    instagram: "@rileyriff",
    tiktokHandle: "@rileyriff",
    youtubeChannel: "https://www.youtube.com/@rileyriff",
    travelRadiusMiles: 200,
    homeCity: "Portland",
    homeState: "OR",
    styles: ["Musical", "Clean"],
    cleanRating: "CLEAN",
    rateMin: 350,
    rateMax: 650,
    reelUrls: ["https://youtu.be/riley-riff-reel"],
    photoUrls: ["https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80"],
    notableClubs: ["Helium Portland", "Alberta Street Pub"],
    availability: availability.filter((slot) => slot.userId === "user-comic2"),
    createdAt: date(2, 15, 12),
    updatedAt: date(4, 22, 10),
  },
];

const comedianAppearances: ComedianAppearanceRecord[] = [
  {
    id: "appearance-riley-harbor",
    comedianUserId: "user-comic2",
    showName: "Harbor Lights Late Show",
    venueName: "Harbor Lights Comedy Club",
    city: "Portland",
    state: "OR",
    performedAt: date(3, 5, 21),
    gigId: "gig-portland-past",
  },
];

const comedianVideos: ComedianVideoRecord[] = [
  {
    id: "video-casey-quick",
    comedianUserId: "user-comic1",
    title: "Casey Quick - Five Minutes",
    platform: "YOUTUBE",
    url: "https://youtu.be/casey-quick-reel",
    postedAt: date(2, 10, 18),
  },
  {
    id: "video-riley-riff",
    comedianUserId: "user-comic2",
    title: "Riley Riff - Live at Harbor Lights",
    platform: "YOUTUBE",
    url: "https://youtu.be/riley-riff-reel",
    postedAt: date(3, 7, 20),
  },
];

const gigs: GigRecord[] = [
  {
    id: "gig-seattle-showcase",
    createdByUserId: "user-promoter",
    title: "Waterfront Weekend Showcase",
    description: "Book a headliner for a high-energy Saturday night showcase in Seattle.",
    compensationType: "FLAT",
    payoutUsd: 500,
    dateStart: date(6, 15, 3),
    dateEnd: null,
    timezone: "America/Los_Angeles",
    city: "Seattle",
    state: "WA",
    minAge: 21,
    isPublished: true,
    status: "OPEN",
    format: "Club Showcase",
    setLengthMinutes: 25,
    audienceDescription: "200-seat club audience looking for polished acts.",
    totalSpots: 1,
    perks: ["Hotel provided", "Ground transportation"],
    createdAt: date(4, 10, 9),
    updatedAt: date(4, 25, 9),
  },
  {
    id: "gig-portland-open",
    createdByUserId: "user-venue",
    title: "Portland Brewery Comedy Night",
    description: "Seeking a clean comic for a Friday brewery crowd with family-friendly vibes.",
    compensationType: "FLAT",
    payoutUsd: 350,
    dateStart: date(6, 21, 2),
    dateEnd: null,
    timezone: "America/Los_Angeles",
    city: "Portland",
    state: "OR",
    minAge: 18,
    isPublished: true,
    status: "OPEN",
    format: "Brewery Show",
    setLengthMinutes: 20,
    audienceDescription: "Cozy brewery audience who love music and storytelling.",
    totalSpots: 1,
    perks: ["Meal voucher"],
    createdAt: date(4, 12, 9),
    updatedAt: date(4, 24, 10),
  },
  {
    id: "gig-portland-past",
    createdByUserId: "user-promoter",
    title: "Rooftop Spring Finale",
    description: "Completed rooftop series closer featuring acoustic comedy and clean sets.",
    compensationType: "FLAT",
    payoutUsd: 400,
    dateStart: date(3, 5, 2),
    dateEnd: null,
    timezone: "America/Los_Angeles",
    city: "Portland",
    state: "OR",
    minAge: 21,
    isPublished: true,
    status: "CLOSED",
    format: "Rooftop Show",
    setLengthMinutes: 30,
    audienceDescription: "Outdoor rooftop crowd with curated seating.",
    totalSpots: 1,
    perks: ["Green room snacks"],
    createdAt: date(1, 25, 9),
    updatedAt: date(3, 6, 9),
  },
];

const threads: ThreadRecord[] = [
  {
    id: "thread-seattle-offer",
    gigId: "gig-seattle-showcase",
    createdById: "user-promoter",
    participantIds: ["user-promoter", "user-comic1"],
    state: "INQUIRY",
    lastMessageAt: date(4, 28, 16),
    createdAt: date(4, 20, 15),
    updatedAt: date(4, 28, 16),
  },
  {
    id: "thread-portland-booked",
    gigId: "gig-portland-past",
    createdById: "user-promoter",
    participantIds: ["user-promoter", "user-comic2"],
    state: "BOOKED",
    lastMessageAt: date(3, 6, 17),
    createdAt: date(2, 20, 14),
    updatedAt: date(3, 6, 17),
  },
];

const offers: OfferRecord[] = [
  {
    id: "offer-seattle-casey",
    threadId: "thread-seattle-offer",
    fromUserId: "user-promoter",
    amount: 500,
    currency: "USD",
    terms: "25 minute featured set plus meet and greet",
    eventDate: date(6, 15, 3),
    expiresAt: date(5, 5, 12),
    status: "PENDING",
    createdAt: date(4, 20, 15),
  },
  {
    id: "offer-portland-riley",
    threadId: "thread-portland-booked",
    fromUserId: "user-promoter",
    amount: 400,
    currency: "USD",
    terms: "30 minute rooftop closer, includes travel stipend",
    eventDate: date(3, 5, 2),
    expiresAt: null,
    status: "ACCEPTED",
    createdAt: date(2, 20, 14),
  },
];

const messages: MessageRecord[] = [
  {
    id: "message-seattle-intro",
    threadId: "thread-seattle-offer",
    senderId: "user-promoter",
    kind: "TEXT",
    body: "Hey Casey! We'd love to have you headline our waterfront showcase.",
    fileUrl: null,
    offerId: null,
    createdAt: date(4, 20, 15),
  },
  {
    id: "message-seattle-details",
    threadId: "thread-seattle-offer",
    senderId: "user-promoter",
    kind: "TEXT",
    body: "Offer sent with set length and budget details.",
    fileUrl: null,
    offerId: "offer-seattle-casey",
    createdAt: date(4, 20, 15),
  },
  {
    id: "message-portland-confirm",
    threadId: "thread-portland-booked",
    senderId: "user-comic2",
    kind: "TEXT",
    body: "Excited for the rooftop finale! I'll bring the guitar for a closer.",
    fileUrl: null,
    offerId: "offer-portland-riley",
    createdAt: date(2, 22, 10),
  },
];

const bookings: BookingRecord[] = [
  {
    id: "booking-portland-riley",
    gigId: "gig-portland-past",
    comedianId: "user-comic2",
    promoterId: "user-promoter",
    offerId: "offer-portland-riley",
    status: "COMPLETED",
    payoutProtection: true,
    cancellationPolicy: "STANDARD",
    paymentIntentId: "pi_demo_portland_riley",
    createdAt: date(2, 22, 11),
  },
];

const conversationReviews: ConversationReviewRecord[] = [
  {
    id: "conversation-review-promoter",
    bookingId: "booking-portland-riley",
    fromUserId: "user-promoter",
    toUserId: "user-comic2",
    rating: 5,
    body: "Fantastic communication and quick to confirm tech needs.",
    visible: true,
    createdAt: date(3, 6, 18),
  },
];

const reviews: ReviewRecord[] = [
  {
    id: "review-promoter-riley",
    authorUserId: "user-promoter",
    subjectUserId: "user-comic2",
    gigId: "gig-portland-past",
    rating: 5,
    comment: "Riley crushed the rooftop closer with hilarious original songs.",
    visible: true,
    createdAt: date(3, 7, 12),
  },
  {
    id: "review-fan-riley",
    authorUserId: "user-fan",
    subjectUserId: "user-comic2",
    gigId: "gig-portland-past",
    rating: 4,
    comment: "Loved the musical closer—can't wait to catch another show!",
    visible: true,
    createdAt: date(3, 8, 19),
  },
];

const favorites: FavoriteRecord[] = [
  {
    id: "favorite-fan-seattle",
    userId: "user-fan",
    gigId: "gig-seattle-showcase",
    venueId: null,
    createdAt: date(4, 22, 9),
    updatedAt: date(4, 22, 9),
  },
];

const adSlots: AdSlotRecord[] = [
  {
    id: "ad-home-hero",
    page: "home",
    placement: "top",
    html: "<div class=\"ad-creative\">\n  <h3>Harbor Lights Summer Series</h3>\n  <p>Three weekends of rooftop comedy under the stars.</p>\n</div>",
    linkUrl: "https://harborlightscomedy.example.com",
    active: true,
    priority: 1,
    createdAt: date(2, 1, 9),
    updatedAt: date(4, 1, 9),
  },
  {
    id: "ad-search-inline",
    page: "search",
    placement: "inline",
    html: "<div class=\"ad-creative\">\n  <strong>Need a clean comic?</strong> Book Riley Riff for your summer events.\n</div>",
    linkUrl: "https://rileyriff.live",
    active: true,
    priority: 2,
    createdAt: date(2, 10, 9),
    updatedAt: date(4, 15, 9),
  },
];

const featureFlags: FeatureFlagRecord[] = (Object.entries(getDefaultFeatureFlags()) as Array<[
  FeatureFlagKey,
  boolean
]>).map(([key, enabled]) => ({
  key,
  enabled,
  updatedAt: date(1, 1, 8),
}));

const snapshot: DatabaseSnapshot = {
  users,
  comedianProfiles,
  comedianVideos,
  comedianAppearances,
  promoterProfiles,
  venueProfiles,
  gigs,
  applications: [],
  verificationRequests: [],
  favorites,
  threads,
  messages,
  offers,
  bookings,
  conversationReviews,
  reviews,
  reviewReminders: [],
  availability,
  reports: [],
  communityBoardMessages: [],
  adSlots,
  featureFlags,
};

async function main(): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(snapshot, null, 2));
  console.log(`Seeded datastore with ${users.length} users and ${gigs.length} gigs.`);
}

main().catch((error) => {
  console.error("Failed to seed datastore", error);
  process.exit(1);
});
