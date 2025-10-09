import Link from "next/link";

const regionalSpotlights = [
  {
    region: "Pacific Northwest",
    cities: "Seattle, Portland, Vancouver",
    highlight:
      "A thriving indie scene with smart crowds, perfect for comics developing storytelling-forward sets and alt-room cred."
  },
  {
    region: "Mountain West",
    cities: "Denver, Salt Lake City, Boise",
    highlight:
      "Fast-growing comedy communities anchored by supportive clubs and boutique festivals seeking fresh talent."
  },
  {
    region: "Southwest",
    cities: "Phoenix, Las Vegas, Albuquerque",
    highlight:
      "Corporate bookings, casino showcases, and destination events keep performers busy year-round."
  }
] as const;

const locationTips = [
  "Use filters on the gigs page to surface events within driving distance or that offer travel stipends.",
  "Publish your travel calendar so promoters can catch you while you are already routed through their city.",
  "Request testimonials from venues after each show to boost your profile in new markets."
] as const;

export default function LocationsPage() {
  return (
    <div className="space-y-14">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Locations</p>
        <h1 className="text-4xl font-manrope">Expand your reach city by city</h1>
        <p className="max-w-3xl text-base text-base-content/70">
          Browse active comedy markets, discover emerging hot spots, and plan smarter routes. Like the city hubs on GigSalad,
          The Funny helps you pair talent and venues with the right local audience.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {regionalSpotlights.map((spotlight) => (
          <article key={spotlight.region} className="card border border-base-300 bg-base-100/80">
            <div className="card-body space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{spotlight.region}</p>
                <h2 className="text-lg font-manrope">{spotlight.cities}</h2>
              </div>
              <p className="text-sm text-base-content/70">{spotlight.highlight}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-base-300 bg-base-200/60 p-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-manrope">Make the most of every market</h2>
          <ul className="list-disc space-y-2 pl-6 text-sm text-base-content/70">
            {locationTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="flex flex-col gap-4 rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-manrope">Ready to introduce your city?</h2>
          <p className="text-sm text-base-content/70">
            Submit a location guide and we will feature your rooms, producers, and insider travel tips in the weekly newsletter.
          </p>
        </div>
        <Link href="/post-gig" className="btn btn-secondary self-start">
          Share your market
        </Link>
      </footer>
    </div>
  );
}
