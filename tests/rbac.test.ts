import { describe, expect, it } from "vitest";
import { Role, VerificationStatus } from "@/lib/prismaEnums";
import {
  canApplyToGig,
  canPublishGig,
  requiresVerification,
  roleLabelMap,
} from "@/lib/rbac";

describe("RBAC helpers", () => {
  it("allows verified promoters to publish", () => {
    expect(canPublishGig(Role.PROMOTER, VerificationStatus.APPROVED)).toBe(true);
  });

  it("blocks unverified venues from publishing", () => {
    expect(canPublishGig(Role.VENUE, VerificationStatus.PENDING)).toBe(false);
  });

  it("allows comedians to apply", () => {
    expect(canApplyToGig(Role.COMEDIAN)).toBe(true);
  });

  it("blocks fans from applying", () => {
    expect(canApplyToGig(Role.FAN)).toBe(false);
  });

  it("requires verification for promoters and venues", () => {
    expect(requiresVerification(Role.PROMOTER)).toBe(true);
    expect(requiresVerification(Role.VENUE)).toBe(true);
  });

  it("does not require verification for comedians, fans, or admins", () => {
    expect(requiresVerification(Role.COMEDIAN)).toBe(false);
    expect(requiresVerification(Role.FAN)).toBe(false);
    expect(requiresVerification(Role.ADMIN)).toBe(false);
  });

  it("allows admins to publish regardless of verification status", () => {
    expect(canPublishGig(Role.ADMIN, null)).toBe(true);
  });

  it("maps every role to a human-readable label", () => {
    expect(roleLabelMap[Role.COMEDIAN]).toBe("Comedian");
    expect(roleLabelMap[Role.PROMOTER]).toBe("Promoter");
    expect(roleLabelMap[Role.VENUE]).toBe("Venue");
    expect(roleLabelMap[Role.FAN]).toBe("Fan");
    expect(roleLabelMap[Role.ADMIN]).toBe("Admin");
  });
});
