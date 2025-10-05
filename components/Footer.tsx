import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-base-300 bg-base-200/60 text-sm">
      <div className="container">
        <div className="grid gap-10 py-12 md:grid-cols-4">
          <div className="space-y-3">
            <h2 className="font-manrope text-lg">About</h2>
            <p className="text-base-content/80">
              The Funny is your stand-up hub—discover rooms, promote shows, and keep comics booked solid.
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="font-manrope text-lg">Resources</h2>
            <ul className="space-y-2" aria-label="Resources">
              <li>
                <Link
                  href="/credits"
                  className="link-hover link focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/50"
                >
                  Credits &amp; Licenses
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="link-hover link focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/50"
                >
                  About The Funny
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h2 className="font-manrope text-lg">Social</h2>
            <ul className="space-y-2" aria-label="Social links">
              <li>
                <a
                  href="#"
                  className="link-hover link focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/50"
                >
                  Instagram (coming soon)
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="link-hover link focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/50"
                >
                  Threads (coming soon)
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h2 className="font-manrope text-lg">Stay in the loop</h2>
            <p className="text-base-content/80">
              Join our upcoming newsletter to get weekly open mic drops, booked shows, and networking events.
            </p>
            <button
              type="button"
              className="btn btn-primary w-full justify-center focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/50"
              aria-label="Subscribe to the upcoming newsletter"
            >
              Notify me
            </button>
          </div>
        </div>
        <div className="border-t border-base-300 py-6 text-center text-xs text-base-content/70">
          © {currentYear} The Funny. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
