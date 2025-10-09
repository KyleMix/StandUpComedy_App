import Link from "next/link";
import { redirect } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { ThemeToggle } from "@/components/ThemeToggle";
import { auth, signOut } from "@/lib/auth";

const links = [
  { href: "/", label: "Home" },
  { href: "/gigs", label: "Find Gigs" },
  { href: "/profiles", label: "Profiles" },
  { href: "/about", label: "About" }
];

export async function Navbar() {
  const session = await auth();

  async function handleSignOut() {
    "use server";
    await signOut();
    redirect("/");
  }

  return (
    <header className="border-b border-base-300 bg-base-100/80 backdrop-blur">
      <div className="container">
        <div className="navbar px-0">
          <div className="navbar-start gap-2">
            <div className="dropdown lg:hidden">
              <button
                type="button"
                tabIndex={0}
                className="btn btn-ghost btn-square"
                aria-label="Toggle navigation menu"
              >
                <Bars3Icon className="h-5 w-5" aria-hidden />
              </button>
              <ul
                tabIndex={0}
                className="menu dropdown-content mt-3 w-48 rounded-box bg-base-200 p-2 text-sm shadow z-[1]"
                aria-label="Mobile navigation"
              >
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-btn px-3 py-2 focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/60"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/" className="btn btn-ghost text-lg font-manrope normal-case">
              The Funny
            </Link>
          </div>
          <div className="navbar-center hidden lg:flex">
            <nav aria-label="Primary navigation">
              <ul className="menu menu-horizontal gap-1 px-0 text-sm font-medium">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-btn px-3 py-2 transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/60"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="navbar-end gap-2">
            <ThemeToggle />
            {session?.user ? (
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="btn btn-secondary btn-sm font-semibold focus-visible:outline-none focus-visible:ring focus-visible:ring-secondary/50"
                >
                  Sign Out
                </button>
              </form>
            ) : (
              <Link
                href="/auth/sign-in"
                className="btn btn-secondary btn-sm font-semibold focus-visible:outline-none focus-visible:ring focus-visible:ring-secondary/50"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
