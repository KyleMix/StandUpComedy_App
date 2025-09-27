import { Role, VerificationStatus } from "@/lib/prismaEnums";

export const roleLabelMap: Record<Role, string> = {
  [Role.COMEDIAN]: "Comedian",
  [Role.PROMOTER]: "Promoter",
  [Role.VENUE]: "Venue",
  [Role.FAN]: "Fan",
  [Role.ADMIN]: "Admin"
};

export function requiresVerification(role: Role) {
  return role === Role.PROMOTER || role === Role.VENUE;
}

export function canPublishGig(role: Role, verificationStatus?: VerificationStatus | null) {
  if (role === Role.ADMIN) return true;
  if (role === Role.PROMOTER || role === Role.VENUE) {
    return verificationStatus === VerificationStatus.APPROVED;
  }
  return false;
}

export function canApplyToGig(role: Role) {
  return role === Role.COMEDIAN;
}
