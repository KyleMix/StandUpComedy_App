import type {
  ApplicationStatus,
  BookingStatus,
  CancellationPolicy,
  GigCompensationType,
  GigStatus,
  MessageKind,
  OfferStatus,
  ReportTarget,
  Role,
  ThreadState,
  VerificationStatus
} from "@/lib/prismaEnums";

export type ComedianCleanRating = "CLEAN" | "PG13" | "R";

export interface UserRecord {
  id: string;
  name: string | null;
  email: string;
  hashedPassword: string | null;
  role: Role;
  createdAt: string;
  isPremium: boolean;
  premiumSince: string | null;
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
  styles: string[];
  cleanRating: ComedianCleanRating;
  rateMin: number | null;
  rateMax: number | null;
  reelUrls: string[];
  photoUrls: string[];
  notableClubs: string[];
  availability: AvailabilityRecord[];
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

export type CommunityBoardCategory = "ASK" | "OFFER" | "ANNOUNCEMENT";

export interface CommunityBoardMessageRecord {
  id: string;
  authorId: string;
  authorRole: Role;
  content: string;
  category: CommunityBoardCategory;
  isPinned: boolean;
  gigTitle: string | null;
  gigAddress: string | null;
  gigCity: string | null;
  gigState: string | null;
  gigContactName: string | null;
  gigContactEmail: string | null;
  gigSlotsAvailable: number | null;
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
  format: string | null;
  setLengthMinutes: number | null;
  audienceDescription: string | null;
  totalSpots: number | null;
  perks: string[];
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

export interface ThreadRecord {
  id: string;
  gigId: string;
  createdById: string;
  participantIds: string[];
  state: ThreadState;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  threadId: string;
  senderId: string;
  kind: MessageKind;
  body: string | null;
  fileUrl: string | null;
  offerId: string | null;
  createdAt: string;
}

export interface OfferRecord {
  id: string;
  threadId: string;
  fromUserId: string;
  amount: number;
  currency: string;
  terms: string;
  eventDate: string;
  expiresAt: string | null;
  status: OfferStatus;
  createdAt: string;
}

export interface BookingRecord {
  id: string;
  gigId: string;
  comedianId: string;
  promoterId: string;
  offerId: string;
  status: BookingStatus;
  payoutProtection: boolean;
  cancellationPolicy: CancellationPolicy;
  paymentIntentId: string | null;
  createdAt: string;
}

export interface ConversationReviewRecord {
  id: string;
  bookingId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  body: string;
  visible: boolean;
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  authorUserId: string;
  subjectUserId: string;
  gigId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
}

export interface ReviewReminderRecord {
  id: string;
  bookingId: string;
  recipientUserId: string;
  sendAt: string;
  sentAt: string | null;
  createdAt: string;
}

export type AdSlotPage = "home" | "search" | "profile";
export type AdSlotPlacement = "top" | "inline" | "sidebar";

export interface AdSlotRecord {
  id: string;
  page: AdSlotPage;
  placement: AdSlotPlacement;
  html?: string;
  imageUrl?: string;
  linkUrl?: string;
  active: boolean;
  priority: number;
  createdAt: string;
}

export interface AvailabilityRecord {
  id: string;
  userId: string;
  date: string;
  status: "free" | "busy";
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  targetType: ReportTarget;
  targetId: string;
  reason: string;
  details: string | null;
  createdAt: string;
  resolvedAt: string | null;
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
  threads: ThreadRecord[];
  messages: MessageRecord[];
  offers: OfferRecord[];
  bookings: BookingRecord[];
  conversationReviews: ConversationReviewRecord[];
  reviews: ReviewRecord[];
  reviewReminders: ReviewReminderRecord[];
  availability: AvailabilityRecord[];
  reports: ReportRecord[];
  communityBoardMessages: CommunityBoardMessageRecord[];
  adSlots: AdSlotRecord[];
}
