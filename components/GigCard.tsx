import Link from "next/link";
import { CalendarDays, Coins, Heart, MapPin, Mic, Users } from "lucide-react";

import { Icon } from "@/components/Icon";
import { formatDateShort } from "@/utils/format";

export interface GigCardProps {
  id: string;
  title: string;
  location: string;
  dateISO: string;
  timezone?: string;
  summary?: string | null;
  signupUrl?: string;
  tags?: string[];
  status?: string | null;
  isPublished?: boolean;
  compensationType: "FLAT" | "DOOR_SPLIT" | "TIPS" | "UNPAID";
  payoutUsd: number | null;
  totalSpots?: number | null;
  applicationsCount?: number | null;
  favoritesCount?: number | null;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function describeCompensation(type: GigCardProps["compensationType"], payoutUsd: number | null) {
  if (type === "FLAT") {
    return typeof payoutUsd === "number" ? `${currencyFormatter.format(payoutUsd)} flat` : "Flat guarantee";
  }
  if (type === "DOOR_SPLIT") {
    return "Door split";
  }
  if (type === "TIPS") {
    return "Tips for comics";
  }
  return "Stage time";
}

function describePipeline(totalSpots?: number | null, applicationsCount?: number | null) {
  if (typeof totalSpots === "number" && typeof applicationsCount === "number") {
    const remaining = Math.max(totalSpots - applicationsCount, 0);
    return `${remaining} of ${totalSpots} spots open`;
  }
  if (typeof totalSpots === "number") {
    return `${totalSpots} total spots`;
  }
  if (typeof applicationsCount === "number") {
    return `${applicationsCount} application${applicationsCount === 1 ? "" : "s"}`;
  }
  return "Rolling submissions";
}

function getStatusLabel(status?: string | null, isPublished?: boolean) {
  if (status && status.trim().length > 0) {
    return status
      .toLowerCase()
      .split(/[_\s]+/)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
  }
  return isPublished ? "Published" : "Draft";
}

function describeProgramming(status?: string | null, isPublished?: boolean) {
  if (!status) {
    return isPublished ? "Taking submissions" : "Draft gig";
  }
  const normalized = status.toUpperCase();
  switch (normalized) {
    case "OPEN":
      return "Taking submissions now";
    case "PENDING":
      return "Pending review";
    case "PUBLISHED":
      return "Published on The Funny";
    case "ARCHIVED":
      return "Archived gig";
    case "CLOSED":
      return "Lineup locked";
    default:
      return `${getStatusLabel(status, isPublished)} gig`;
  }
}

export function GigCard({
  id,
  title,
  location,
  dateISO,
  timezone,
  summary,
  signupUrl,
  tags,
  status,
  isPublished,
  compensationType,
  payoutUsd,
  totalSpots,
  applicationsCount,
  favoritesCount
}: GigCardProps) {
  const compensationLabel = describeCompensation(compensationType, payoutUsd);
  const pipelineLabel = describePipeline(totalSpots ?? null, applicationsCount ?? null);
  const statusLabel = getStatusLabel(status, isPublished);
  const micLabel = describeProgramming(status, isPublished);
  const href = signupUrl ?? `/gigs/${id}`;
  const dateLabel = timezone ? `${formatDateShort(dateISO)} • ${timezone}` : formatDateShort(dateISO);
  const subtitle = summary ?? location;
  const badges = tags ?? [];

  return (
    <article className="card border border-base-300 bg-base-200/50 shadow-sm transition hover:border-primary/60 hover:shadow-md">
      <div className="card-body space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-manrope">{title}</h3>
            <p className="text-sm text-base-content/70">{subtitle}</p>
          </div>
          <span
            className={`badge ${isPublished ? "badge-primary text-primary-content" : "badge-outline border-slate-300 text-slate-600"}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="grid gap-2 text-sm text-base-content/80 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Icon icon={CalendarDays} className="h-4 w-4" />
            <span>{dateLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon={MapPin} className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Icon icon={Mic} className="h-4 w-4" />
            <span>{micLabel}</span>
          </div>
        </div>

        <div className="grid gap-2 text-sm text-base-content/80 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Icon icon={Coins} className="h-4 w-4" />
            <span>{compensationLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon={Users} className="h-4 w-4" />
            <span>{pipelineLabel}</span>
          </div>
        </div>

        {(typeof favoritesCount === "number" || typeof applicationsCount === "number") && (
          <div className="flex flex-wrap gap-4 text-xs uppercase tracking-wide text-base-content/60">
            {typeof applicationsCount === "number" && (
              <span className="flex items-center gap-1">
                <Icon icon={Mic} className="h-3 w-3" />
                {applicationsCount} appl{applicationsCount === 1 ? "" : "s"}
              </span>
            )}
            {typeof favoritesCount === "number" && (
              <span className="flex items-center gap-1">
                <Icon icon={Heart} className="h-3 w-3" />
                {favoritesCount} save{favoritesCount === 1 ? "" : "s"}
              </span>
            )}
          </div>
        )}

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((tag) => (
              <span key={tag} className="badge badge-sm badge-outline border-base-300/60 text-xs uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="card-actions justify-end">
          <Link
            href={href}
            className="btn btn-primary focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/60"
            aria-label={`View or sign up for ${title}`}
          >
            View / Sign Up
          </Link>
        </div>
      </div>
    </article>
  );
}
