import Link from "next/link";

const eventTypes = [
  {
    title: "Corporate celebrations",
    description:
      "Keep all-hands, retreats, and appreciation nights energetic with comics who can tailor material to your company culture.",
    tip: "Pair with our booking checklist to cover timing, tech, and HR approvals."
  },
  {
    title: "Private parties",
    description:
      "From milestone birthdays to bachelor weekends, bring in talent that keeps friends laughing with custom material.",
    tip: "Add a crowd warm-up host for seamless transitions between activities."
  },
  {
    title: "Fundraisers & galas",
    description:
      "Create unforgettable donor experiences with comedians who know how to energize a room and keep the program on schedule.",
    tip: "Browse success stories from other nonprofits in our resource library."
  },
  {
    title: "Festivals & theaters",
    description:
      "Line up headliners, feature acts, and themed showcases that complement your festival brand or seasonal calendar.",
    tip: "Sync with your venue profile so artists can visualize the space before they arrive."
  },
  {
    title: "Campus programming",
    description:
      "Engage students with comics experienced in college audiences, orientation weeks, and student life events.",
    tip: "Invite emerging alumni comics to co-host for built-in campus familiarity."
  },
  {
    title: "Virtual experiences",
    description:
      "Livestream-ready comedians keep distributed teams and online communities laughing without missing a beat.",
    tip: "Share our virtual tech specs guide with your AV lead before showtime."
  }
] as const;

export default function EventTypesPage() {
  return (
    <div className="space-y-14">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Event Types</p>
        <h1 className="text-4xl font-manrope">Comedy for every occasion</h1>
        <p className="max-w-3xl text-base text-base-content/70">
          Whether you are planning a gala, filling a festival lineup, or adding laughs to a team summit, explore curated event
          playbooks inspired by booking hubs like GigSalad. Each one includes pro tips to help you deliver a polished experience.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {eventTypes.map((event) => (
          <article key={event.title} className="card border border-base-300 bg-base-100/80">
            <div className="card-body space-y-3">
              <h2 className="text-lg font-manrope">{event.title}</h2>
              <p className="text-sm text-base-content/70">{event.description}</p>
              <p className="rounded-2xl bg-base-200/80 p-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {event.tip}
              </p>
            </div>
          </article>
        ))}
      </section>

      <footer className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-manrope">Need help matching a comic to your event?</h2>
            <p className="text-sm text-base-content/70">
              Share your event details and our team will send curated talent recommendations within 48 hours.
            </p>
          </div>
          <Link href="/post-gig" className="btn btn-secondary self-start">
            Request suggestions
          </Link>
        </div>
      </footer>
    </div>
  );
}
