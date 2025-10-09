/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import type { SVGProps } from "react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  getUserById,
  listComedianProfiles,
  listReviewsForUser,
  type ComedianProfile,
} from "@/lib/dataStore";
import { cn } from "@/lib/utils";
import { avatarFor } from "@/utils/avatar";
import { Calendar, Camera, DollarSign, MapPin, Star, Video } from "lucide-react";

interface ProfileDetailPageProps {
  params: { slug: string };
}

interface ReviewSummary {
  average: number | null;
  count: number;
}

const CLEAN_RATING_LABELS: Record<ComedianProfile["cleanRating"], string> = {
  CLEAN: "Clean",
  PG13: "PG-13",
  R: "R-rated",
};

function slugFromStageName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function formatRateRange(profile: ComedianProfile) {
  if (profile.rateMin == null && profile.rateMax == null) {
    return "Flexible pricing";
  }
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const minLabel = profile.rateMin != null ? formatter.format(profile.rateMin) : "Flexible";
  const maxLabel = profile.rateMax != null ? formatter.format(profile.rateMax) : "Flexible";
  if (profile.rateMin == null || profile.rateMax == null || profile.rateMin === profile.rateMax) {
    return minLabel === maxLabel ? minLabel : `${minLabel} – ${maxLabel}`;
  }
  return `${minLabel} – ${maxLabel}`;
}

function summarizeReviews(ratings: number[]): ReviewSummary {
  if (ratings.length === 0) {
    return { average: null, count: 0 };
  }
  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  const average = Number((total / ratings.length).toFixed(1));
  return { average, count: ratings.length };
}

function formatDate(value: Date) {
  return value.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function generateStaticParams() {
  const profiles = await listComedianProfiles();
  return profiles
    .filter((profile) => profile.stageName)
    .map((profile) => ({ slug: slugFromStageName(profile.stageName) }));
}

async function getProfileBySlug(slug: string) {
  const profiles = await listComedianProfiles();
  return profiles.find((profile) => slugFromStageName(profile.stageName) === slug) ?? null;
}

export async function generateMetadata({ params }: ProfileDetailPageProps): Promise<Metadata> {
  const profile = await getProfileBySlug(params.slug);
  if (!profile) {
    return { title: "Profile not found" };
  }
  return {
    title: `${profile.stageName} • Profiles`,
    description: profile.bio ?? undefined,
  };
}

function renderRatingStars(average: number | null) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = average != null && average >= index + 1;
        const half = average != null && average > index && average < index + 1;
        return (
          <Star
            key={index}
            className={`h-4 w-4 ${filled ? "text-amber-500" : half ? "text-amber-400" : "text-slate-300"}`}
            fill={filled || half ? "currentColor" : "none"}
          />
        );
      })}
    </div>
  );
}

export default async function ProfileDetailPage({ params }: ProfileDetailPageProps) {
  const profile = await getProfileBySlug(params.slug);
  if (!profile) {
    notFound();
  }

  const [user, reviews] = await Promise.all([
    getUserById(profile.userId),
    listReviewsForUser(profile.userId),
  ]);

  const reviewSummary = summarizeReviews(reviews.map((review) => review.rating));
  const latestReviews = reviews.slice(0, 3);
  const reels = [profile.reelUrl, ...profile.reelUrls].filter((url): url is string => Boolean(url));
  const locationParts = [profile.homeCity, profile.homeState].filter((part) => part && part.length > 0);
  const avatarSrc = avatarFor(profile.stageName, undefined);
  const upcomingAvailability = profile.availability
    .filter((entry) => entry.date.getTime() >= Date.now())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 7);

  return (
    <main className="space-y-10">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <img
              src={avatarSrc}
              alt={profile.stageName}
              className="h-24 w-24 rounded-full border border-slate-200 object-cover"
            />
            <div className="space-y-3">
              <div>
                <h1 className="text-3xl font-semibold text-slate-900">{profile.stageName}</h1>
                {user?.name && (
                  <p className="text-sm text-slate-500">Legal name: {user.name}</p>
                )}
                {locationParts.length > 0 && (
                  <p className="flex items-center gap-1 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    {locationParts.join(", ")}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                <Badge>{CLEAN_RATING_LABELS[profile.cleanRating]}</Badge>
                {profile.travelRadiusMiles && (
                  <Badge variant="outline">{profile.travelRadiusMiles} mile travel radius</Badge>
                )}
                <Badge variant="outline">{formatRateRange(profile)}</Badge>
                {profile.styles.map((style) => (
                  <Badge key={style} variant="secondary">
                    {style}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  {renderRatingStars(reviewSummary.average)}
                  {reviewSummary.average != null ? (
                    <span className="font-semibold text-slate-800">
                      {reviewSummary.average}
                      <span className="ml-1 text-xs text-slate-500">({reviewSummary.count} reviews)</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">No reviews yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 lg:items-end">
            {profile.website && (
              <a
                href={profile.website}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                target="_blank"
                rel="noreferrer"
              >
                <Video className="h-4 w-4" /> Website
              </a>
            )}
            {profile.instagram && (
              <a
                href={`https://instagram.com/${profile.instagram}`}
                className="text-sm text-brand hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                @{profile.instagram}
              </a>
            )}
            {profile.tiktokHandle && (
              <a
                href={`https://www.tiktok.com/@${profile.tiktokHandle}`}
                className="text-sm text-brand hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                TikTok · @{profile.tiktokHandle}
              </a>
            )}
            {profile.youtubeChannel && (
              <a
                href={profile.youtubeChannel}
                className="text-sm text-brand hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                YouTube channel
              </a>
            )}
          </div>
        </div>
        {profile.bio && (
          <p className="mt-6 text-base leading-relaxed text-slate-700">{profile.bio}</p>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {profile.credits && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <ThumbsUpIcon className="h-5 w-5" /> Credits & Highlights
              </h2>
              <p className="mt-3 text-sm text-slate-700">{profile.credits}</p>
            </div>
          )}

          {reels.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Video className="h-5 w-5" /> Reels
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-brand">
                {reels.map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer" className="hover:underline">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {profile.photoUrls.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Camera className="h-5 w-5" /> Photo gallery
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {profile.photoUrls.map((url) => (
                  <img key={url} src={url} alt="Gallery" className="h-40 w-full rounded-md object-cover" />
                ))}
              </div>
            </div>
          )}

          {latestReviews.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Latest reviews</h2>
              <ul className="mt-4 space-y-4">
                {latestReviews.map((review) => (
                  <li key={review.id} className="space-y-2 rounded-md border border-slate-100 p-4">
                    <div className="flex items-center gap-2">
                      {renderRatingStars(review.rating)}
                      <span className="text-xs text-slate-500">{formatDate(review.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-700">{review.comment}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <DollarSign className="h-5 w-5" /> Booking info
            </h2>
            <dl className="mt-3 space-y-2 text-sm text-slate-600">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rate range</dt>
                <dd>{formatRateRange(profile)}</dd>
              </div>
              {profile.notableClubs.length > 0 && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notable stages</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {profile.notableClubs.map((club) => (
                      <Badge key={club} variant="secondary">
                        {club}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Calendar className="h-5 w-5" /> Upcoming availability
            </h2>
            {upcomingAvailability.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">Availability calendar coming soon.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {upcomingAvailability.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between">
                    <span>{formatDate(entry.date)}</span>
                    <Badge variant={entry.status === "free" ? "secondary" : "outline"}>
                      {entry.status === "free" ? "Available" : "Booked"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}

function ThumbsUpIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cn("h-5 w-5 text-brand", className)}
    >
      <path
        d="M7 10V21H4C2.89543 21 2 20.1046 2 19V12C2 10.8954 2.89543 10 4 10H7Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 21H17.5C18.8807 21 20 19.8807 20 18.5V13C20 12.4477 19.5523 12 19 12H14.3431C13.8929 12 13.4714 11.7893 13.2071 11.4142L11.5 9C11.2239 8.60855 11.2239 8.09145 11.5 7.7L14 4H13C11.8954 4 11 4.89543 11 6V10"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
