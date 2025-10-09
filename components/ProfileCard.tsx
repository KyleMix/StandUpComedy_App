/* eslint-disable @next/next/no-img-element */
import { Icon } from "@/components/Icon";
import { avatarFor } from "@/utils/avatar";
import { Building2, Mic, Users } from "lucide-react";
import Link from "next/link";

export type ProfileRole = "comedian" | "venue" | "fan";

export interface ProfileCardProps {
  slug: string;
  displayName: string;
  role: ProfileRole;
  city: string;
  avatarUrl?: string;
  tagline?: string;
}

const ROLE_STYLES: Record<ProfileRole, { label: string; icon: typeof Mic }> = {
  comedian: { label: "Comedian", icon: Mic },
  venue: { label: "Venue", icon: Building2 },
  fan: { label: "Fan", icon: Users }
};

export function ProfileCard({ slug, displayName, role, city, avatarUrl, tagline }: ProfileCardProps) {
  const roleInfo = ROLE_STYLES[role];
  const imageSrc = avatarFor(displayName, avatarUrl);

  return (
    <article className="card border border-base-300 bg-base-200/40 shadow-sm transition hover:border-secondary/60 hover:shadow-md">
      <div className="card-body space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={imageSrc}
            alt={displayName}
            className="h-16 w-16 rounded-full border border-base-300/60 bg-base-100 object-cover"
            loading="lazy"
          />
          <div className="space-y-1">
            <h3 className="text-lg font-manrope">{displayName}</h3>
            <p className="text-sm text-base-content/70">{city}</p>
            {tagline && <p className="text-sm text-base-content/60">{tagline}</p>}
            <span className="badge badge-outline flex items-center gap-1 border-secondary/40 text-xs uppercase tracking-wide">
              <Icon icon={roleInfo.icon} className="h-3.5 w-3.5" /> {roleInfo.label}
            </span>
          </div>
        </div>

        <div className="card-actions justify-end">
          <Link
            href={`/profiles/${slug}`}
            className="btn btn-outline btn-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-secondary/60"
            aria-label={`View profile for ${displayName}`}
          >
            View Profile
          </Link>
        </div>
      </div>
    </article>
  );
}
