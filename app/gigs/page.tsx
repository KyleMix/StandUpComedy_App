"use client";

import { useMemo, useState } from "react";
import { GigCard } from "@/components/GigCard";
import { gigs } from "@/lib/sample";

const typeOptions = [
  { value: "all", label: "All" },
  { value: "open", label: "Open Mic" },
  { value: "booked", label: "Booked" }
] as const;

const sortOptions = [
  { value: "date-asc", label: "Date: Soonest" },
  { value: "date-desc", label: "Date: Latest" },
  { value: "compensation", label: "Pay type: Paid first" },
  { value: "payout-desc", label: "Pay amount: High to low" },
  { value: "payout-asc", label: "Pay amount: Low to high" },
  { value: "spots-desc", label: "Spots left: Most" },
  { value: "spots-asc", label: "Spots left: Fewest" },
  { value: "city-asc", label: "City: A to Z" }
] as const;

const compensationPriority: Record<(typeof gigs)[number]["compensationType"], number> = {
  UNPAID: 0,
  TIPS: 1,
  DOOR_SPLIT: 2,
  FLAT: 3
};

export default function GigsPage() {
  const [cityFilter, setCityFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof typeOptions)[number]["value"]>("all");
  const [sortOption, setSortOption] = useState<(typeof sortOptions)[number]["value"]>("date-asc");

  const visibleGigs = useMemo(() => {
    const filtered = gigs.filter((gig) => {
      const matchesCity = cityFilter
        ? gig.city.toLowerCase().includes(cityFilter.trim().toLowerCase())
        : true;
      const matchesDate = dateFilter ? new Date(gig.dateISO) >= new Date(dateFilter) : true;
      const matchesType =
        typeFilter === "all" ? true : typeFilter === "open" ? gig.isOpenMic : !gig.isOpenMic;

      return matchesCity && matchesDate && matchesType;
    });

    const sorter = new Intl.Collator();

    const compare = (a: (typeof gigs)[number], b: (typeof gigs)[number]) => {
      const aDate = new Date(a.dateISO).getTime();
      const bDate = new Date(b.dateISO).getTime();

      switch (sortOption) {
        case "date-desc":
          return bDate - aDate;
        case "compensation":
          return compensationPriority[b.compensationType] - compensationPriority[a.compensationType] || aDate - bDate;
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
        case "spots-desc": {
          const aSpots = typeof a.spotsRemaining === "number" ? a.spotsRemaining : -Infinity;
          const bSpots = typeof b.spotsRemaining === "number" ? b.spotsRemaining : -Infinity;
          return bSpots - aSpots || aDate - bDate;
        }
        case "spots-asc": {
          const aSpots = typeof a.spotsRemaining === "number" ? a.spotsRemaining : Infinity;
          const bSpots = typeof b.spotsRemaining === "number" ? b.spotsRemaining : Infinity;
          return aSpots - bSpots || aDate - bDate;
        }
        case "city-asc":
          return sorter.compare(a.city, b.city) || aDate - bDate;
        case "date-asc":
        default:
          return aDate - bDate;
      }
    };

    return filtered.slice().sort(compare);
  }, [cityFilter, dateFilter, typeFilter, sortOption]);

  return (
    <div className="space-y-10">
      <header className="space-y-3 text-center lg:text-left">
        <h1 className="text-4xl font-manrope">Find the next mic or showcase</h1>
        <p className="text-base text-base-content/70">
          Search by city, filter by vibe, and land the perfect stage time across the Pacific Northwest.
        </p>
      </header>

      <section className="card border border-base-300 bg-base-200/40">
        <div className="card-body">
          <form className="grid gap-4 md:grid-cols-4" aria-label="Gig search filters">
            <label className="form-control w-full md:col-span-2">
              <span className="label-text text-sm">City</span>
              <input
                type="text"
                value={cityFilter}
                onChange={(event) => setCityFilter(event.target.value)}
                placeholder="Olympia, Seattle, Tacoma..."
                className="input input-bordered focus:outline-none focus-visible:ring focus-visible:ring-primary/60"
                aria-label="Filter gigs by city"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text text-sm">Date</span>
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="input input-bordered focus:outline-none focus-visible:ring focus-visible:ring-primary/60"
                aria-label="Filter gigs by date"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text text-sm">Type</span>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as (typeof typeOptions)[number]["value"])}
                className="select select-bordered focus:outline-none focus-visible:ring focus-visible:ring-primary/60"
                aria-label="Filter gigs by type"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-control w-full">
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

      <section aria-live="polite" className="space-y-4">
        <p className="text-sm text-base-content/70">
          Showing {visibleGigs.length} {visibleGigs.length === 1 ? "gig" : "gigs"}.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          {visibleGigs.map((gig) => (
            <GigCard key={gig.id} {...gig} />
          ))}
        </div>
        {visibleGigs.length === 0 && (
          <div className="alert alert-info">
            <span>No gigs match those filters yet—try adjusting your search.</span>
          </div>
        )}
      </section>
    </div>
  );
}
