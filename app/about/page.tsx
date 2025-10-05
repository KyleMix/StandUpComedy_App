export default function AboutPage() {
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-manrope">What is The Funny?</h1>
        <p className="text-base text-base-content/70">
          The Funny is a community-driven stand-up discovery platform designed to connect comics, producers, and fans across the
          Pacific Northwest.
        </p>
      </header>

      <section className="grid gap-8 md:grid-cols-3">
        <article className="rounded-2xl border border-base-300 bg-base-200/40 p-6">
          <h2 className="text-xl font-manrope">Why we&apos;re building</h2>
          <p className="mt-3 text-sm text-base-content/70">
            Comedy thrives when stage time is easy to find and booking is transparent. We&apos;re creating a single hub for rooms,
            comics, and superfans to plan nights that feel electric.
          </p>
        </article>
        <article className="rounded-2xl border border-base-300 bg-base-200/40 p-6">
          <h2 className="text-xl font-manrope">What&apos;s here now</h2>
          <p className="mt-3 text-sm text-base-content/70">
            Browse curated gig listings, explore community profiles, and experiment with booking requests—all powered by a
            playful, high-contrast design made for late-night planners.
          </p>
        </article>
        <article className="rounded-2xl border border-base-300 bg-base-200/40 p-6">
          <h2 className="text-xl font-manrope">Where we&apos;re going</h2>
          <p className="mt-3 text-sm text-base-content/70">
            Up next: collaborative routing tools, richer venue dashboards, and ways for fans to RSVP and build loyalty programs
            with their favorite rooms.
          </p>
        </article>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-manrope">2025 roadmap</h2>
        <ul className="timeline timeline-vertical timeline-compact text-sm text-base-content/80">
          <li>
            <div className="timeline-middle" />
            <div className="timeline-start timeline-box bg-base-200/70">
              <h3 className="font-manrope text-base">Spring</h3>
              <p>Launch self-serve submissions and automated lineup reminders.</p>
            </div>
            <hr className="bg-primary/40" />
          </li>
          <li>
            <div className="timeline-middle" />
            <div className="timeline-end timeline-box bg-base-200/70">
              <h3 className="font-manrope text-base">Summer</h3>
              <p>Roll out promoter CRM tools and collaborative budget tracking.</p>
            </div>
            <hr className="bg-secondary/40" />
          </li>
          <li>
            <div className="timeline-middle" />
            <div className="timeline-start timeline-box bg-base-200/70">
              <h3 className="font-manrope text-base">Fall</h3>
              <p>Introduce audience loyalty features and fan-curated highlight reels.</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
