"use client";

import { useEffect, useMemo, useState } from "react";

import { GigCard } from "@/components/GigCard";

type GigStatus = "OPEN" | "PENDING" | "PUBLISHED" | "ARCHIVED" | "CLOSED" | "DRAFT" | string;

type ApiGig = {
  id: string;
  title: string;
  description: string;
  city: string;
  state: string | null;
  timezone: string;
  status: GigStatus | null;
  isPublished: boolean;
  compensationType: "FLAT" | "DOOR_SPLIT" | "TIPS" | "UNPAID";
  payoutUsd: number | null;
  dateStart: string;
  dateEnd: string | null;
  totalSpots: number | null;
  format: string | null;
  updatedAt: string;
  metrics?: {
    totalApplications: number;
    pendingApplications: number;
    favorites: number;
    bookings: number;
  } | null;
};

type GigListItem = {
  id: string;
  title: string;
  location: string;
  dateISO: string;
  timezone: string;
  summary: string | null;
  status: GigStatus | null;
  isPublished: boolean;
  compensationType: "FLAT" | "DOOR_SPLIT" | "TIPS" | "UNPAID";
  payoutUsd: number | null;
  totalSpots: number | null;
  applicationsCount: number | null;
  favoritesCount: number | null;
  tags: string[];
};

const sortOptions = [
  { value: "date-asc", label: "Date: Soonest" },
  { value: "date-desc", label: "Date: Latest" },
  { value: "payout-desc", label: "Payout: High to low" },
  { value: "payout-asc", label: "Payout: Low to high" },
  { value: "applications-desc", label: "Applications: Most" },
  { value: "applications-asc", label: "Applications: Fewest" },
  { value: "city-asc", label: "City: A to Z" }
] as const;

const compensationOptions = [
  { value: "", label: "All compensation" },
  { value: "FLAT", label: "Flat" },
  { value: "DOOR_SPLIT", label: "Door split" },
  { value: "TIPS", label: "Tips" },
  { value: "UNPAID", label: "Unpaid" }
] as const;

function formatLocation(city: string, state: string | null): string {
  if (state && state.trim().length > 0) {
    return `${city}, ${state}`;
  }
  return city;
}

function summariseDescription(description: string, format: string | null): string | null {
  if (format && format.trim().length > 0) {
    return format;
  }
  if (!description || description.trim().length === 0) {
    return null;
  }
  const trimmed = description.trim();
  if (trimmed.length <= 120) {
    return trimmed;
  }
  return `${trimmed.slice(0, 117)}...`;
}

function toGigListItem(gig: ApiGig): GigListItem {
  const location = formatLocation(gig.city, gig.state);
  const summary = summariseDescription(gig.description, gig.format);
  const tags = new Set<string>();
  if (!gig.isPublished) {
    tags.add("draft");
  }
  if (gig.status) {
    tags.add(gig.status.toLowerCase());
  }
  if (gig.metrics?.bookings) {
    tags.add("booked");
  }
  if (gig.metrics?.pendingApplications) {
    tags.add("pending");
  }

  return {
    id: gig.id,
    title: gig.title,
    location,
    dateISO: gig.dateStart,
    timezone: gig.timezone,
    summary,
    status: gig.status,
    isPublished: gig.isPublished,
    compensationType: gig.compensationType,
    payoutUsd: gig.payoutUsd,
    totalSpots: gig.totalSpots,
    applicationsCount: gig.metrics?.totalApplications ?? null,
    favoritesCount: gig.metrics?.favorites ?? null,
    tags: Array.from(tags)
  };
}

export default function GigsPage() {
  const [searchFilter, setSearchFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [compensationFilter, setCompensationFilter] = useState<(typeof compensationOptions)[number]["value"]>("");
  const [minPayoutFilter, setMinPayoutFilter] = useState("");
  const [sortOption, setSortOption] = useState<(typeof sortOptions)[number]["value"]>("date-asc");
  const [gigs, setGigs] = useState<GigListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGigs() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (searchFilter.trim().length > 0) {
          params.set("search", searchFilter.trim());
        }
        if (cityFilter.trim().length > 0) {
          params.set("city", cityFilter.trim());
        }
        if (stateFilter.trim().length > 0) {
          params.set("state", stateFilter.trim().toUpperCase());
        }
        if (compensationFilter) {
          params.set("compensationType", compensationFilter);
        }
        if (minPayoutFilter.trim().length > 0) {
          params.set("minPayout", minPayoutFilter.trim());
        }

        const query = params.toString();
        const response = await fetch(`/api/gigs${query ? `?${query}` : ""}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Failed to load gigs");
        }
        const payload = (await response.json()) as { items: ApiGig[] };
        const nextItems = payload.items.map(toGigListItem);
        if (!controller.signal.aborted) {
          setGigs(nextItems);
        }
      } catch (error_) {
        if (!controller.signal.aborted) {
          setError(error_ instanceof Error ? error_.message : "Unable to load gigs");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadGigs();

    return () => {
      controller.abort();
    };
  }, [searchFilter, cityFilter, stateFilter, compensationFilter, minPayoutFilter]);

  const sortedGigs = useMemo(() => {
    const items = gigs.slice();
    const collator = new Intl.Collator();

    items.sort((a, b) => {
      const aDate = new Date(a.dateISO).getTime();
      const bDate = new Date(b.dateISO).getTime();
      switch (sortOption) {
        case "date-desc":
          return bDate - aDate;
        case "payout-desc": {
          const aPayout = typeof a.payoutUsd === "number" ? a.payoutUsd : -Infinity;
          const bPayout = typeof b.payoutUsd === "number" ? b.payoutUsd : -Infinity;
          return bPayout - aPayout || aDate - bDate;
        }
        case "payout-asc": {
          const aPayout = typeof a.payoutUsd === "number" ? a.payoutUsd : Infinity;
          const bPayout = typeof b.payoutUsd === "number" ? b.payoutUsd : Infinity;
          return aPayout - bPayout || aDate - bDate;
        }
        case "applications-desc": {
          const aApps = typeof a.applicationsCount === "number" ? a.applicationsCount : -Infinity;
          const bApps = typeof b.applicationsCount === "number" ? b.applicationsCount : -Infinity;
          return bApps - aApps || aDate - bDate;
        }
        case "applications-asc": {
          const aApps = typeof a.applicationsCount === "number" ? a.applicationsCount : Infinity;
          const bApps = typeof b.applicationsCount === "number" ? b.applicationsCount : Infinity;
          return aApps - bApps || aDate - bDate;
        }
        case "city-asc":
          return collator.compare(a.location, b.location) || aDate - bDate;
        case "date-asc":
        default:
          return aDate - bDate;
      }
    });

    return items;
  }, [gigs, sortOption]);

  return (
    <div className="space-y-10">
      <header className="space-y-3 text-center lg:text-left">
        <h1 className="text-4xl font-manrope">Find the next mic or showcase</h1>
        <p className="text-base text-base-content/70">
          Search by city, sort by payout, and track performance metrics for every show you post on The Funny.
        </p>
      </header>

      <section className="card border border-base-300 bg-base-200/40">
        <div className="card-body">
          <form className="grid gap-4 md:grid-cols-5" aria-label="Gig search filters">
            <label className="form-control w-full md:col-span-2">
              <span className="label-text text-sm">Search</span>
              <input
                type="text"
                value={searchFilter}
                onChange={(event) => setSearchFilter(event.target.value)}
                placeholder="Search gigs by title or description"
                className="input input-bordered focus:outline-none focus-visible:ring focus-visible:ring-primary/60"
                aria-label="Search gigs"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text text-sm">City</span>
              <input
                type="text"
                value={cityFilter}
                onChange={(event) => setCityFilter(event.target.value)}
                placeholder="Seattle, Portland, Tacoma..."
                className="input input-bordered focus:outline-none focus-visible:ring focus-visible:ring-primary/60"
                aria-label="Filter gigs by city"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text text-sm">State</span>
              <input
                type="text"
                value={stateFilter}
                onChange={(event) => setStateFilter(event.target.value)}
                placeholder="WA"
                maxLength={2}
                className="input input-bordered uppercase focus:outline-none focus-visible:ring focus-visible:ring-primary/60"
                aria-label="Filter gigs by state"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text text-sm">Min payout (USD)</span>
              <input
                type="number"
                min={0}
                value={minPayoutFilter}
                onChange={(event) => setMinPayoutFilter(event.target.value)}
                placeholder="0"
                className="input input-bordered focus:outline-none focus-visible:ring focus-visible:ring-primary/60"
                aria-label="Filter gigs by minimum payout"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text text-sm">Compensation</span>
              <select
                value={compensationFilter}
                onChange={(event) => setCompensationFilter(event.target.value as (typeof compensationOptions)[number]["value"])}
                className="select select-bordered focus:outline-none focus-visible:ring focus-visible:ring-primary/60"
                aria-label="Filter gigs by compensation type"
              >
                {compensationOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-control w-full md:col-span-2">
              <span className="label-text text-sm">Sort by</span>
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as (typeof sortOptions)[number]["value"])}
                className="select select-bordered focus:outline-none focus-visible:ring focus-visible:ring-primary/60"
                aria-label="Sort gigs"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </form>
        </div>
      </section>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <section aria-live="polite" className="space-y-4">
        <p className="text-sm text-base-content/70">
          {loading
            ? "Loading gigs..."
            : `Showing ${sortedGigs.length} ${sortedGigs.length === 1 ? "gig" : "gigs"}.`}
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          {sortedGigs.map((gig) => (
            <GigCard
              key={gig.id}
              id={gig.id}
              title={gig.title}
              location={gig.location}
              dateISO={gig.dateISO}
              timezone={gig.timezone}
              summary={gig.summary}
              status={gig.status}
              isPublished={gig.isPublished}
              compensationType={gig.compensationType}
              payoutUsd={gig.payoutUsd}
              totalSpots={gig.totalSpots}
              applicationsCount={gig.applicationsCount}
              favoritesCount={gig.favoritesCount}
              tags={gig.tags}
            />
          ))}
        </div>
        {!loading && sortedGigs.length === 0 && (
          <div className="alert alert-info">
            <span>No gigs match those filters yet—try adjusting your search or check back soon.</span>
          </div>
        )}
      </section>
    </div>
  );
}
