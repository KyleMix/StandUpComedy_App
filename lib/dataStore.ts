import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  ApplicationRecord,
  ComedianProfileRecord,
  DatabaseSnapshot,
  FavoriteRecord,
  GigRecord,
  PromoterProfileRecord,
  UserRecord,
  VenueProfileRecord,
  VerificationRequestRecord
} from "@/types/database";
import type { ApplicationStatus, GigCompensationType, GigStatus, Role, VerificationStatus } from "@/lib/prismaEnums";
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
      promoterProfiles: [],
      venueProfiles: [],
      gigs: [],
      applications: [],
      verificationRequests: [],
      favorites: []
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

let cache: DatabaseSnapshot | null = null;

async function loadSnapshot(): Promise<DatabaseSnapshot> {
  if (!cache) {
    await ensureDataStore();
    const raw = await fs.readFile(DATABASE_PATH, "utf-8");
    try {
      cache = JSON.parse(raw) as DatabaseSnapshot;
    } catch (error) {
      cache = {
        users: [],
        comedianProfiles: [],
        promoterProfiles: [],
        venueProfiles: [],
        gigs: [],
        applications: [],
        verificationRequests: [],
        favorites: []
      };
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
    travelRadiusMiles: record.travelRadiusMiles ?? null,
    homeCity: record.homeCity ?? null,
    homeState: record.homeState ?? null,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt)
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

function nowIso() {
  return new Date().toISOString();
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
}

export async function createComedianProfile(input: CreateComedianProfileInput): Promise<ComedianProfile> {
  const snapshot = await loadSnapshot();
  const now = nowIso();
  const record: ComedianProfileRecord = {
    userId: input.userId,
    stageName: input.stageName,
    bio: null,
    credits: null,
    website: null,
    reelUrl: null,
    instagram: null,
    travelRadiusMiles: null,
    homeCity: null,
    homeState: null,
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
  if (data.organization !== undefined) record.organization = data.organization;
  if (data.contactName !== undefined) record.contactName = data.contactName;
  if (data.phone !== undefined) record.phone = data.phone;
  if (data.website !== undefined) record.website = data.website;
  if (data.verificationStatus !== undefined) record.verificationStatus = data.verificationStatus;
  record.updatedAt = nowIso();
  await persist(snapshot);
  return mapPromoter(record);
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
  if (data.venueName !== undefined) record.venueName = data.venueName;
  if (data.address1 !== undefined) record.address1 = data.address1;
  if (data.address2 !== undefined) record.address2 = data.address2;
  if (data.city !== undefined) record.city = data.city;
  if (data.state !== undefined) record.state = data.state;
  if (data.postalCode !== undefined) record.postalCode = data.postalCode;
  if (data.capacity !== undefined) record.capacity = data.capacity;
  if (data.contactEmail !== undefined) record.contactEmail = data.contactEmail;
  if (data.phone !== undefined) record.phone = data.phone;
  if (data.verificationStatus !== undefined) record.verificationStatus = data.verificationStatus;
  record.updatedAt = nowIso();
  await persist(snapshot);
  return mapVenue(record);
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

export type DatabaseUser = User;
export type DatabaseGig = Gig;
export type DatabaseApplication = Application;
export type DatabaseVerificationRequest = VerificationRequest;
