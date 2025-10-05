import Link from "next/link";
import { CalendarDays, MapPin, Mic } from "lucide-react";
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
}

export function GigCard({ title, venue, city, dateISO, signupUrl, tags, isOpenMic }: GigCardProps) {
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
