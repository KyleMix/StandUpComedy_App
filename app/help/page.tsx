import Link from "next/link";

const faqItems = [
  {
    question: "How do I manage inquiries from promoters?",
    answer:
      "Head to your dashboard to review new messages, respond with availability, and update the status once a booking is confirmed."
  },
  {
    question: "Can I invite teammates to collaborate?",
    answer:
      "Yes! Upgrade to a team workspace from your account settings to assign roles for marketing, booking, and finance collaborators."
  },
  {
    question: "What fees should I expect?",
    answer:
      "Posting gigs is free. Completed bookings include a transparent service fee displayed before you confirm the contract."
  }
] as const;

const contactOptions = [
  {
    title: "Email support",
    description: "Get a response within one business day for account or billing questions.",
    href: "mailto:hello@thefunny.com"
  },
  {
    title: "Live chat",
    description: "Chat with a comedy concierge Monday–Friday, 9am–6pm PT.",
    href: "/inbox"
  },
  {
    title: "Status page",
    description: "Check real-time uptime and scheduled maintenance before your event begins.",
    href: "https://status.thefunny.com"
  }
] as const;

export default function HelpPage() {
  return (
    <div className="space-y-14">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Help Center</p>
        <h1 className="text-4xl font-manrope">We are here to support your show</h1>
        <p className="max-w-3xl text-base text-base-content/70">
          Explore FAQs, guides, and direct contact options inspired by service-driven platforms like GigSalad. Our team ensures
          every inquiry gets the attention it deserves.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="space-y-4 rounded-3xl border border-base-300 bg-base-100/80 p-6">
          <h2 className="text-2xl font-manrope">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details key={item.question} className="rounded-2xl border border-base-300 bg-base-200/60 p-4">
                <summary className="cursor-pointer text-sm font-semibold">{item.question}</summary>
                <p className="mt-2 text-sm text-base-content/70">{item.answer}</p>
              </details>
            ))}
          </div>
        </article>
        <article className="space-y-4 rounded-3xl border border-base-300 bg-base-100/80 p-6">
          <h2 className="text-2xl font-manrope">Quick-start guides</h2>
          <ul className="space-y-3 text-sm text-base-content/70">
            <li>
              <Link href="/services" className="font-semibold text-primary transition hover:text-primary/80">
                Setup checklist for your first gig posting
              </Link>
            </li>
            <li>
              <Link href="/profiles" className="font-semibold text-primary transition hover:text-primary/80">
                Tips for crafting a standout comedian profile
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="font-semibold text-primary transition hover:text-primary/80">
                Managing applications with The Funny dashboard
              </Link>
            </li>
          </ul>
        </article>
      </section>

      <section className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {contactOptions.map((option) => (
            <article key={option.title} className="rounded-2xl border border-base-300 bg-base-100/80 p-5">
              <h3 className="text-base font-semibold">{option.title}</h3>
              <p className="mt-2 text-sm text-base-content/70">{option.description}</p>
              <Link
                href={option.href}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
              >
                Connect
                <span aria-hidden>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
