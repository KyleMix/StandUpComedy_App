import Link from "next/link";

const resourceCollections = [
  {
    title: "Booking playbooks",
    description:
      "Download templates for outreach emails, contract checklists, and event timelines that keep your planning smooth.",
    href: "/docs/booking-playbook.pdf",
    label: "Download toolkit"
  },
  {
    title: "Marketing templates",
    description:
      "Editable social graphics, press release starters, and run-of-show slides built to hype your next comedy night.",
    href: "https://www.figma.com/community/file/1270637255948366300",
    label: "Grab the files"
  },
  {
    title: "Community insights",
    description:
      "Monthly trend reports featuring top-booked comics, audience preferences, and pricing benchmarks across regions.",
    href: "/docs/community-insights.pdf",
    label: "View latest report"
  }
] as const;

const learningLinks = [
  {
    title: "Office Hours",
    copy: "Join weekly live Q&A sessions with booking experts and club managers.",
    href: "/credits"
  },
  {
    title: "Knowledge base",
    copy: "Step-by-step guides for updating profiles, reviewing submissions, and managing payments.",
    href: "/help"
  },
  {
    title: "Success stories",
    copy: "See how producers and venues across North America grow their audience with The Funny.",
    href: "/the-funny"
  }
] as const;

export default function ResourcesPage() {
  return (
    <div className="space-y-14">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Resources</p>
        <h1 className="text-4xl font-manrope">Guides, templates, and insights for your next booking</h1>
        <p className="max-w-3xl text-base text-base-content/70">
          Stay organized like the pros. These resources mirror the planning support you would find on GigSalad while tailoring
          every tip to the stand-up world.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {resourceCollections.map((resource) => (
          <article key={resource.title} className="card border border-base-300 bg-base-100/80">
            <div className="card-body space-y-4">
              <div className="space-y-2">
                <h2 className="text-lg font-manrope">{resource.title}</h2>
                <p className="text-sm text-base-content/70">{resource.description}</p>
              </div>
              <Link
                href={resource.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
              >
                {resource.label}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-base-300 bg-base-200/60 p-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-manrope">Keep learning with the community</h2>
          <p className="text-sm text-base-content/70">
            Explore trainings and conversations to level up your craft, business, and audience experience.
          </p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {learningLinks.map((link) => (
            <article key={link.title} className="rounded-2xl border border-base-300 bg-base-100/80 p-5">
              <h3 className="text-base font-semibold">{link.title}</h3>
              <p className="mt-2 text-sm text-base-content/70">{link.copy}</p>
              <Link
                href={link.href}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
              >
                Explore
                <span aria-hidden>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
