const fallbackRole = {
  COMEDIAN: "COMEDIAN",
  PROMOTER: "PROMOTER",
  VENUE: "VENUE",
  FAN: "FAN",
  ADMIN: "ADMIN"
} as const;

const fallbackVerificationStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
} as const;

const fallbackGigStatus = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED"
} as const;

const fallbackGigType = {
  OPEN_MIC: "OPEN_MIC",
  BOOKED_SHOW: "BOOKED_SHOW",
  PAID_GIG: "PAID_GIG"
} as const;

const fallbackSignUpMethod = {
  WALKUP: "WALKUP",
  ONLINE_FORM: "ONLINE_FORM",
  DM: "DM",
  EMAIL: "EMAIL",
  OTHER: "OTHER"
} as const;

const fallbackLeadStatus = {
  NEW: "NEW",
  REVIEW: "REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  DUPLICATE: "DUPLICATE"
} as const;

const fallbackGigCompensationType = {
  FLAT: "FLAT",
  DOOR_SPLIT: "DOOR_SPLIT",
  TIPS: "TIPS",
  UNPAID: "UNPAID"
} as const;

const fallbackApplicationStatus = {
  SUBMITTED: "SUBMITTED",
  SHORTLISTED: "SHORTLISTED",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
  APPLIED: "APPLIED",
  BOOKED: "BOOKED",
  CANCELLED: "CANCELLED"
} as const;

const fallbackThreadState = {
  INQUIRY: "INQUIRY",
  QUOTE: "QUOTE",
  BOOKED: "BOOKED",
  COMPLETED: "COMPLETED"
} as const;

const fallbackMessageKind = {
  TEXT: "TEXT",
  FILE: "FILE",
  OFFER: "OFFER",
  SYSTEM: "SYSTEM"
} as const;

const fallbackOfferStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  WITHDRAWN: "WITHDRAWN",
  EXPIRED: "EXPIRED"
} as const;

const fallbackBookingStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
} as const;

const fallbackCancellationPolicy = {
  FLEX: "FLEX",
  STANDARD: "STANDARD",
  STRICT: "STRICT"
} as const;

const fallbackReportTarget = {
  USER: "USER",
  THREAD: "THREAD",
  GIG: "GIG"
} as const;

function loadPrismaEnum<T extends Record<string, string>>(
  selector: (mod: Record<string, unknown>) => Record<string, string> | undefined,
  fallback: T
): T {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const prismaModule = require("@prisma/client") as Record<string, unknown>;
    const value = selector(prismaModule);
    if (value && typeof value === "object") {
      return value as T;
    }
  } catch (error) {
    // Ignore errors – fall back to the inline enum definitions.
  }
  return fallback;
}

export const Role = loadPrismaEnum((mod) => mod.Role as Record<string, string> | undefined, fallbackRole);
export type Role = (typeof Role)[keyof typeof Role];

export const VerificationStatus = loadPrismaEnum(
  (mod) => mod.VerificationStatus as Record<string, string> | undefined,
  fallbackVerificationStatus
);
export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const GigStatus = loadPrismaEnum(
  (mod) => mod.GigStatus as Record<string, string> | undefined,
  fallbackGigStatus
);
export type GigStatus = (typeof GigStatus)[keyof typeof GigStatus];

export const GigType = loadPrismaEnum(
  (mod) => mod.GigType as Record<string, string> | undefined,
  fallbackGigType
);
export type GigType = (typeof GigType)[keyof typeof GigType];

export const SignUpMethod = loadPrismaEnum(
  (mod) => mod.SignUpMethod as Record<string, string> | undefined,
  fallbackSignUpMethod
);
export type SignUpMethod = (typeof SignUpMethod)[keyof typeof SignUpMethod];

export const LeadStatus = loadPrismaEnum(
  (mod) => mod.LeadStatus as Record<string, string> | undefined,
  fallbackLeadStatus
);
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

export const GigCompensationType = loadPrismaEnum(
  (mod) => mod.GigCompensationType as Record<string, string> | undefined,
  fallbackGigCompensationType
);
export type GigCompensationType = (typeof GigCompensationType)[keyof typeof GigCompensationType];

export const ApplicationStatus = loadPrismaEnum(
  (mod) => mod.ApplicationStatus as Record<string, string> | undefined,
  fallbackApplicationStatus
);
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const ThreadState = loadPrismaEnum(
  (mod) => mod.ThreadState as Record<string, string> | undefined,
  fallbackThreadState
);
export type ThreadState = (typeof ThreadState)[keyof typeof ThreadState];

export const MessageKind = loadPrismaEnum(
  (mod) => mod.MessageKind as Record<string, string> | undefined,
  fallbackMessageKind
);
export type MessageKind = (typeof MessageKind)[keyof typeof MessageKind];

export const OfferStatus = loadPrismaEnum(
  (mod) => mod.OfferStatus as Record<string, string> | undefined,
  fallbackOfferStatus
);
export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus];

export const BookingStatus = loadPrismaEnum(
  (mod) => mod.BookingStatus as Record<string, string> | undefined,
  fallbackBookingStatus
);
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const CancellationPolicy = loadPrismaEnum(
  (mod) => mod.CancellationPolicy as Record<string, string> | undefined,
  fallbackCancellationPolicy
);
export type CancellationPolicy = (typeof CancellationPolicy)[keyof typeof CancellationPolicy];

export const ReportTarget = loadPrismaEnum(
  (mod) => mod.ReportTarget as Record<string, string> | undefined,
  fallbackReportTarget
);
export type ReportTarget = (typeof ReportTarget)[keyof typeof ReportTarget];
