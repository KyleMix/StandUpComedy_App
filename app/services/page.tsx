import Link from "next/link";

const serviceSections = [
  {
    title: "Book performers",
    description:
      "Search our roster of stand-up comedians, emcees, and specialty acts to match the vibe of your next event.",
    ctaLabel: "Browse comedians",
    href: "/profiles"
  },
  {
    title: "Post a gig",
    description:
      "List your show or private booking request and start receiving submissions from vetted comics in minutes.",
    ctaLabel: "Create a listing",
    href: "/post-gig"
  },
  {
    title: "Promote your venue",
    description:
      "Showcase your room, highlight upcoming dates, and collaborate with promoters looking for fresh stages.",
    ctaLabel: "Claim your venue",
    href: "/dashboard"
  }
] as const;

const supportServices = [
  {
    title: "Consulting & production",
    description:
      "Need help curating lineups, designing run-of-show, or coordinating tech? Connect with our production partners for end-to-end support."
  },
  {
    title: "Workshops & education",
    description:
      "Book private coaching, writers rooms, or on-site workshops to level up talent while building community engagement."
  },
  {
    title: "Marketing boosts",
    description:
      "Amplify your gig with targeted newsletters, featured placement, and collaborative social campaigns that drive ticket sales."
  }
] as const;

export default function ServicesPage() {
  return (
    <div className="space-y-14">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Services</p>
        <h1 className="text-4xl font-manrope">Everything you need to make comedy happen</h1>
        <p className="max-w-3xl text-base text-base-content/70">
          From talent discovery to show production, The Funny connects comedians, promoters, and venues with tools that keep every
          crowd laughing. Explore the core services below and find the right next step for your team.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {serviceSections.map((section) => (
          <article key={section.title} className="card border border-base-300 bg-base-100/80">
            <div className="card-body space-y-4">
              <div className="space-y-2">
                <h2 className="text-lg font-manrope">{section.title}</h2>
                <p className="text-sm text-base-content/70">{section.description}</p>
              </div>
              <Link
                href={section.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
              >
                {section.ctaLabel}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-manrope">Specialty support</h2>
          <p className="text-sm text-base-content/70">
            Go beyond the basics with concierge services that mirror how major booking platforms like GigSalad help planners stay
            organized.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {supportServices.map((support) => (
            <article key={support.title} className="rounded-2xl border border-base-300 bg-base-200/60 p-6">
              <h3 className="text-base font-semibold">{support.title}</h3>
              <p className="mt-2 text-sm text-base-content/70">{support.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
