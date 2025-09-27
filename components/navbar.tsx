import Link from "next/link";
import { auth } from "@/lib/auth";
import { roleLabelMap } from "@/lib/rbac";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-xl font-semibold text-brand transition hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
        >
          the-funny
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link className="transition hover:text-brand" href="/gigs">
            Gigs
          </Link>
          {user?.role === "ADMIN" && (
            <Link className="transition hover:text-brand" href="/admin">
              Admin
            </Link>
          )}
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 transition hover:border-brand/40 hover:text-brand"
            >
              {user.name ?? "Dashboard"} ({roleLabelMap[user.role]})
            </Link>
          ) : (
            <Button asChild size="sm" className="shadow-sm">
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
