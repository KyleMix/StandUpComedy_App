import { createAvatar } from "@dicebear/core";
import { botttsNeutral } from "@dicebear/collection";
import { createHash } from "crypto";

export function avatarDataUrl(seed: string) {
  const hashed = createHash("sha256").update(seed).digest("hex");
  const svg = createAvatar(botttsNeutral, {
    seed: hashed,
    size: 96,
    backgroundType: ["gradientLinear"],
    radius: 8
  }).toString();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
