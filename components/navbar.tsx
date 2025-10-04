import { auth } from "@/lib/auth";
import Link from "next/link";
https://github.com/KyleMix/StandUpComedy_App/pull/17/conflict?name=components%252Fnavbar.tsx&ancestor_oid=98bc5fa50738ec7673220605dfdd56f5c1aea3da&base_oid=1c1c86c37c4a17ce7476b9799fac0ce7fdc561c5&head_oid=92c46ab54ff4851adfbef967bb1fabbb8326fe30
const links = [
  { href: "/", label: "Home" },
  { href: "/gigs", label: "Gigs" },
  { href: "/comedians", label: "Comedians" },
];

export async function Navbar() {
  const session = await auth();
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/gigs", label: "Gigs" },
  { href: "/comedians", label: "Comedians" },
];

export function Navbar() {
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
            </>
          ) : (
            <Link href="/auth/sign-in" className="font-medium text-slate-900 transition hover:text-slate-600">
              Sign in
            </Link>
          )}
        </div>
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-base font-semibold tracking-tight">
          the-funny
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-slate-900">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
