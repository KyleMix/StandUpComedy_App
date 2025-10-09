import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { slugFromStageName } from "@/lib/profileSlug";
import type { ComedianSearchListItem } from "@/lib/dataStore";
import { DollarSign, MapPin, MessageSquare, Sparkles, Star, Timer } from "lucide-react";

function formatLocation(city: string | null, state: string | null) {
  if (!city && !state) return null;
  if (city && state) return `${city}, ${state}`;
  return city ?? state ?? null;
}

function formatRateRange(min: number | null, max: number | null) {
  if (min == null && max == null) return "Flexible pricing";
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const minLabel = min != null ? formatter.format(min) : "Flexible";
  const maxLabel = max != null ? formatter.format(max) : "Flexible";
  if (min == null || max == null || min === max) {
    return minLabel === maxLabel ? minLabel : `${minLabel} – ${maxLabel}`;
  }
  return `${minLabel} – ${maxLabel}`;
}

function formatRating(average: number | null, count: number) {
  if (average == null || count === 0) {
    return "No reviews yet";
  }
  return `${average.toFixed(1)} avg • ${count} review${count === 1 ? "" : "s"}`;
}

function formatResponsiveness(score: number | null, count: number) {
  if (score == null || count === 0) {
    return "No response feedback";
  }
  return `${score.toFixed(1)} / 5 • ${count} response${count === 1 ? "" : "s"}`;
}

function formatExperience(years: number | null) {
  if (years == null) return "Experience building";
  if (years === 0) return "Under 1 year";
  return `${years}+ year${years === 1 ? "" : "s"}`;
}

const CLEAN_RATING_LABELS = {
  CLEAN: "Clean",
  PG13: "PG-13",
  R: "R-rated",
} as const;

interface ComedianResultCardProps {
  item: ComedianSearchListItem;
}

export function ComedianResultCard({ item }: ComedianResultCardProps) {
  const { profile, user, averageRating, reviewCount, responsivenessScore, responseCount, experienceYears } = item;
  const slug = slugFromStageName(profile.stageName);
  const location = formatLocation(profile.homeCity, profile.homeState);
  const rateRange = formatRateRange(profile.rateMin, profile.rateMax);
  const displayedStyles = profile.styles.slice(0, 4);
  const cleanLabel = CLEAN_RATING_LABELS[profile.cleanRating];
  const isPremium = Boolean(user?.isPremium);
  const summary = profile.bio ? (profile.bio.length > 200 ? `${profile.bio.slice(0, 197)}…` : profile.bio) : null;

  return (
    <article className="rounded-3xl border border-base-300 bg-base-200/40 p-6 shadow-sm transition hover:border-secondary/60 hover:shadow-md">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-base-content">{profile.stageName}</h3>
            {isPremium && (
              <Badge
                variant="secondary"
                className="gap-1 border border-amber-200 bg-amber-50 text-amber-700 shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-semibold uppercase tracking-wide">Premium</span>
              </Badge>
            )}
          </div>
          {location && (
            <p className="flex items-center gap-1 text-sm text-base-content/70">
              <MapPin className="h-4 w-4" /> {location}
              {typeof profile.travelRadiusMiles === "number" && (
                <span className="text-base-content/60">• Travels {profile.travelRadiusMiles} mi</span>
              )}
            </p>
          )}
          <div className="flex flex-wrap gap-2 text-xs text-base-content/60">
            <span className="inline-flex items-center gap-1">
              <Badge variant="outline" className="border-secondary/40 text-xs font-semibold uppercase tracking-wide">
                {cleanLabel}
              </Badge>
            </span>
            {user?.name && <span>Legal: {user.name}</span>}
          </div>
        </div>
        <Link
          href={`/profiles/${slug}`}
          className="btn btn-outline btn-sm whitespace-nowrap"
          aria-label={`View profile for ${profile.stageName}`}
        >
          View profile
        </Link>
      </header>

      {summary && <p className="mt-4 text-sm leading-relaxed text-base-content/80">{summary}</p>}

      {displayedStyles.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {displayedStyles.map((style) => (
            <Badge key={style} variant="outline" className="border-secondary/40 text-xs text-secondary">
              {style}
            </Badge>
          ))}
          {profile.styles.length > displayedStyles.length && (
            <span className="text-xs text-base-content/60">+{profile.styles.length - displayedStyles.length} more</span>
          )}
        </div>
      )}

      <dl className="mt-6 grid gap-4 text-sm md:grid-cols-3">
        <div className="rounded-2xl border border-base-300 bg-base-100/70 p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
            <Star className="h-4 w-4 text-amber-500" /> Rating
          </dt>
          <dd className="mt-2 text-base-content/80">{formatRating(averageRating, reviewCount)}</dd>
        </div>
        <div className="rounded-2xl border border-base-300 bg-base-100/70 p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
            <MessageSquare className="h-4 w-4 text-secondary" /> Responsiveness
          </dt>
          <dd className="mt-2 text-base-content/80">{formatResponsiveness(responsivenessScore, responseCount)}</dd>
        </div>
        <div className="rounded-2xl border border-base-300 bg-base-100/70 p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
            <Timer className="h-4 w-4 text-primary" /> Experience
          </dt>
          <dd className="mt-2 text-base-content/80">{formatExperience(experienceYears)}</dd>
        </div>
      </dl>

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-base-content/70">
        <div className="inline-flex items-center gap-2">
          <DollarSign className="h-4 w-4" /> {rateRange}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-base-content/60">
          {profile.instagram && <span className="uppercase tracking-wide">Instagram</span>}
          {profile.tiktokHandle && <span className="uppercase tracking-wide">TikTok</span>}
          {profile.youtubeChannel && <span className="uppercase tracking-wide">YouTube</span>}
        </div>
      </footer>
    </article>
  );
}

