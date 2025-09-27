import Link from "next/link";
import { auth } from "@/lib/auth";
import { roleLabelMap } from "@/lib/rbac";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-brand">
          the-funny
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/gigs">Gigs</Link>
          {user?.role === "ADMIN" && <Link href="/admin">Admin</Link>}
          {user ? (
            <Link href="/dashboard" className="rounded-full border px-3 py-1 text-xs">
              {user.name ?? "Dashboard"} ({roleLabelMap[user.role]})
            </Link>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
