import Link from "next/link";
import { GigCard } from "@/components/GigCard";
import { gigs } from "@/lib/sample";

const trendingGigs = gigs.slice(0, 4);

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-base-300 bg-base-200/60 px-6 py-16 sm:px-10">
        <div className="absolute inset-0 -z-10 opacity-70">
          <svg
            className="absolute -left-24 -top-24 h-72 w-72 text-secondary/30"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M53.8,-64.3C68.3,-51,79.6,-34.1,82.7,-16.2C85.8,1.7,80.7,20.7,69.9,35.3C59.2,49.9,42.7,60.1,24.7,65.4C6.8,70.7,-12.5,71.1,-30.3,65.2C-48,59.3,-64.2,47,-72,30.7C-79.8,14.4,-79.3,-6,-71.4,-23.2C-63.5,-40.3,-48.1,-54.1,-31.4,-66.4C-14.6,-78.7,3.4,-89.6,20.9,-87.7C38.4,-85.8,56.4,-71.6,53.8,-64.3Z"
              transform="translate(100 100)"
            />
          </svg>
          <div className="absolute inset-0 bg-grid-dots/[0.12] bg-[length:24px_24px]" aria-hidden="true" />
        </div>
        <div className="relative z-10 space-y-6 text-center lg:text-left">
          <span className="badge badge-secondary badge-outline border-secondary/40 px-4 py-3 uppercase tracking-[0.3em]">
            Stand-up made social
          </span>
          <h1 className="font-manrope text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Find gigs, book comics, and pack every room with laughs.
          </h1>
          <p className="mx-auto max-w-2xl text-base text-base-content/80 lg:mx-0">
            The Funny keeps Northwest comics, bookers, and superfans in sync. Discover open mics, secure paid spots, and grow your
            comedy crew—no spreadsheets required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Link
              href="/gigs"
              className="btn btn-primary btn-wide sm:btn-md focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/60"
            >
              Find Gigs
            </Link>
            <Link
              href="/profiles"
              className="btn btn-outline focus-visible:outline-none focus-visible:ring focus-visible:ring-secondary/50"
            >
              Create Profile
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 text-center lg:text-left">
          <h2 className="text-3xl font-manrope">Trending Gigs</h2>
          <p className="text-base text-base-content/70">
            Fresh shows from Olympia, Tacoma, Seattle, and Portland to keep your calendar hot.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {trendingGigs.map((gig) => (
            <GigCard key={gig.id} {...gig} />
          ))}
        </div>
      </section>
    </div>
  );
}
