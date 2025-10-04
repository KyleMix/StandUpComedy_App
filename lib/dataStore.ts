import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  ApplicationRecord,
  AvailabilityRecord,
  BookingRecord,
  ComedianAppearanceRecord,
  ComedianProfileRecord,
  ComedianVideoRecord,
  CommunityBoardMessageRecord,
  CommunityBoardCategory,
  ConversationReviewRecord,
  DatabaseSnapshot,
  FavoriteRecord,
  GigRecord,
  MessageRecord,
  OfferRecord,
  PromoterProfileRecord,
  ReportRecord,
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
      availability: [],
      reports: [],
      communityBoardMessages: []
    };
    await fs.writeFile(DATABASE_PATH, JSON.stringify(emptySnapshot, null, 2));
  }
}

export interface User extends Omit<UserRecord, "createdAt"> {
  createdAt: Date;
}

export interface ComedianProfile extends Omit<ComedianProfileRecord, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
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
    availability: snapshot.availability ?? [],
    reports: snapshot.reports ?? [],
    communityBoardMessages: snapshot.communityBoardMessages ?? []
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
  return { ...record, name: record.name ?? null, hashedPassword: record.hashedPassword ?? null, createdAt: new Date(record.createdAt) };
}

function mapComedian(record: ComedianProfileRecord): ComedianProfile {
  return {
    ...record,
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
    content: record.content,
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

function nowIso() {
  return new Date().toISOString();
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
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const snapshot = await loadSnapshot();
  const user: UserRecord = {
    id: randomUUID(),
    name: input.name ?? null,
    email: input.email,
    hashedPassword: input.hashedPassword ?? null,
    role: input.role,
    createdAt: nowIso()
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
