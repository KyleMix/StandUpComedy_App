import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-col items-center gap-6 py-24 text-center">
      <div className="rounded-full border border-base-300 bg-base-200/60 px-6 py-3 text-sm uppercase tracking-[0.3em] text-base-content/70">
        404
      </div>
      <h1 className="text-4xl font-manrope">We lost the punchline.</h1>
      <p className="max-w-md text-base text-base-content/70">
        The page you&apos;re chasing hasn&apos;t hit the stage yet. Head back home to catch the latest gigs and profiles.
      </p>
      <Link
        href="/"
        className="btn btn-primary focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/60"
      >
        Return Home
      </Link>
    </section>
  );
}
