import { createAvatar } from "@dicebear/core";
import { botttsNeutral } from "@dicebear/collection";
import { sha256 } from "crypto-hash";

export async function avatarDataUrl(seed: string) {
  const hashed = await sha256(seed);
  const svg = createAvatar(botttsNeutral, {
    seed: hashed,
    size: 96,
    backgroundType: ["gradientLinear"],
    radius: 8
  }).toString();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
