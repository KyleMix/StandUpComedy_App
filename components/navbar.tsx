import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/gigs", label: "Gigs" },
  { href: "/comedians", label: "Comedians" },
];

export function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
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
