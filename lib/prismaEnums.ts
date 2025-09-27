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
  CANCELLED: "CANCELLED"
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
  WITHDRAWN: "WITHDRAWN"
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
