import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Premium pricing",
  description: "Learn about upcoming premium tools for bookers and talent.",
};

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 py-16">
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary">
          <Sparkles className="h-3.5 w-3.5" /> Premium preview
        </p>
        <h1 className="text-4xl font-semibold text-base-content">Premium coming soon</h1>
        <p className="text-base text-base-content/70">
          We&apos;re polishing the next wave of booking tools for comedians and promoters. Early access
          will roll out gradually as we validate the experience.
        </p>
      </header>

      <section className="space-y-4 rounded-3xl border border-base-300 bg-base-200/40 p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-base-content">What to expect</h2>
        <ul className="list-disc space-y-2 pl-5 text-base text-base-content/70">
          <li>Priority placement in search results when Premium Boost is enabled.</li>
          <li>Instant alerts for fresh booking opportunities in your target cities.</li>
          <li>Insight dashboards highlighting audience engagement trends.</li>
        </ul>
      </section>

      <section className="space-y-4 rounded-3xl border border-dashed border-secondary/40 bg-base-100/80 p-8 text-base-content/80">
        <h2 className="text-xl font-semibold text-base-content">Want early access?</h2>
        <p>
          We&apos;re collecting a short list of producers and performers who want to shape the roadmap. Drop us a
          note and we&apos;ll reach out as soon as Premium is open for pilot testing.
        </p>
        <Link className="btn btn-secondary" href="/contact">
          Contact the team
        </Link>
      </section>
    </main>
  );
}
