import Link from "next/link";
import { CalendarDays, Coins, MapPin, Mic, Users } from "lucide-react";
import { Icon } from "@/components/Icon";
import { formatDateShort } from "@/utils/format";

export interface GigCardProps {
  id: string;
  title: string;
  venue: string;
  city: string;
  dateISO: string;
  signupUrl: string;
  tags: string[];
  isOpenMic: boolean;
  compensationType: "FLAT" | "DOOR_SPLIT" | "TIPS" | "UNPAID";
  payoutUsd: number | null;
  totalSpots: number | null;
  spotsRemaining: number | null;
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

function describeSpots(totalSpots: number | null, spotsRemaining: number | null) {
  if (typeof totalSpots === "number" && typeof spotsRemaining === "number") {
    return `${spotsRemaining} of ${totalSpots} spots open`;
  }
  if (typeof totalSpots === "number") {
    return `${totalSpots} total spots`;
  }
  if (typeof spotsRemaining === "number") {
    return `${spotsRemaining} spots open`;
  }
  return "Rolling submissions";
}

export function GigCard({
  title,
  venue,
  city,
  dateISO,
  signupUrl,
  tags,
  isOpenMic,
  compensationType,
  payoutUsd,
  totalSpots,
  spotsRemaining
}: GigCardProps) {
  const compensationLabel = describeCompensation(compensationType, payoutUsd);
  const spotsLabel = describeSpots(totalSpots, spotsRemaining);

  return (
    <article className="card border border-base-300 bg-base-200/50 shadow-sm transition hover:border-primary/60 hover:shadow-md">
      <div className="card-body space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-manrope">{title}</h3>
            <p className="text-sm text-base-content/70">{venue}</p>
          </div>
          <span
            className={`badge ${isOpenMic ? "badge-outline badge-primary text-primary" : "badge-outline border-secondary/40 text-secondary"}`}
          >
            {isOpenMic ? "Open Mic" : "Booked Show"}
          </span>
        </div>

        <div className="grid gap-2 text-sm text-base-content/80 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Icon icon={CalendarDays} className="h-4 w-4" />
            <span>{formatDateShort(dateISO)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon={MapPin} className="h-4 w-4" />
            <span>{city}</span>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Icon icon={Mic} className="h-4 w-4" />
            <span>{isOpenMic ? "Comics welcome to sign up" : "Lineup curated by host"}</span>
          </div>
        </div>

        <div className="grid gap-2 text-sm text-base-content/80 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Icon icon={Coins} className="h-4 w-4" />
            <span>{compensationLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon={Users} className="h-4 w-4" />
            <span>{spotsLabel}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="badge badge-sm badge-outline border-base-300/60 text-xs uppercase tracking-wide">
              {tag}
            </span>
          ))}
        </div>

        <div className="card-actions justify-end">
          <Link
            href={signupUrl}
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
