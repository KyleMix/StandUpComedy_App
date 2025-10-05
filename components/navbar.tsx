import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/gigs", label: "Gigs" },
  { href: "/comedians", label: "Comedians" },
];

async function handleSignOut() {
  "use server";
  await signOut();
  redirect("/");
}

export async function Navbar() {
  const session = await auth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-base font-semibold tracking-tight">
            the-funny
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-slate-600 sm:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-slate-900">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {session ? (
            <>
              <span className="hidden text-slate-500 sm:inline">
                Signed in as {session.user.name ?? session.user.email}
              </span>
              <Link href="/dashboard" className="font-medium text-slate-900 transition hover:text-slate-600">
                Open workspace
              </Link>
              <form action={handleSignOut}>
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <Link href="/auth/sign-in" className="font-medium text-slate-900 transition hover:text-slate-600">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
