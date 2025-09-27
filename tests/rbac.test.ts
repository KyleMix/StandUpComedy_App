import { describe, expect, it } from "vitest";
import { Role, VerificationStatus } from "@prisma/client";
import { canApplyToGig, canPublishGig } from "@/lib/rbac";

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
});
