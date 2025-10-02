import type {
  ApplicationStatus,
  GigCompensationType,
  GigStatus,
  Role,
  VerificationStatus
} from "@/lib/prismaEnums";

export interface UserRecord {
  id: string;
  name: string | null;
  email: string;
  hashedPassword: string | null;
  role: Role;
  createdAt: string;
}

export interface ComedianProfileRecord {
  userId: string;
  stageName: string;
  bio: string | null;
  credits: string | null;
  website: string | null;
  reelUrl: string | null;
  instagram: string | null;
  tiktokHandle: string | null;
  youtubeChannel: string | null;
  travelRadiusMiles: number | null;
  homeCity: string | null;
  homeState: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ComedianVideoPlatform = "YOUTUBE" | "TIKTOK";

export interface ComedianVideoRecord {
  id: string;
  comedianUserId: string;
  title: string;
  platform: ComedianVideoPlatform;
  url: string;
  postedAt: string;
}

export interface ComedianAppearanceRecord {
  id: string;
  comedianUserId: string;
  showName: string;
  venueName: string;
  city: string;
  state: string;
  performedAt: string;
  gigId: string | null;
}

export interface PromoterProfileRecord {
  userId: string;
  organization: string;
  contactName: string;
  phone: string | null;
  website: string | null;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VenueProfileRecord {
  userId: string;
  venueName: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  postalCode: string;
  capacity: number | null;
  contactEmail: string;
  phone: string | null;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GigRecord {
  id: string;
  createdByUserId: string;
  title: string;
  description: string;
  compensationType: GigCompensationType;
  payoutUsd: number | null;
  dateStart: string;
  dateEnd: string | null;
  timezone: string;
  city: string;
  state: string;
  minAge: number | null;
  isPublished: boolean;
  status: GigStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationRecord {
  id: string;
  gigId: string;
  comedianUserId: string;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationRequestRecord {
  id: string;
  userId: string;
  roleRequested: Role;
  message: string;
  documents: unknown;
  status: VerificationStatus;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteRecord {
  id: string;
  userId: string;
  gigId: string | null;
  venueId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSnapshot {
  users: UserRecord[];
  comedianProfiles: ComedianProfileRecord[];
  comedianVideos: ComedianVideoRecord[];
  comedianAppearances: ComedianAppearanceRecord[];
  promoterProfiles: PromoterProfileRecord[];
  venueProfiles: VenueProfileRecord[];
  gigs: GigRecord[];
  applications: ApplicationRecord[];
  verificationRequests: VerificationRequestRecord[];
  favorites: FavoriteRecord[];
}
