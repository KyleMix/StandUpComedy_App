import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roleLabelMap } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getDashboardData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      comedian: true,
      promoter: true,
      venue: true,
      applications: { take: 5, orderBy: { createdAt: "desc" } },
      gigs: { take: 5, orderBy: { createdAt: "desc" } },
      favorites: { take: 5, orderBy: { createdAt: "desc" } }
    }
  });
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sign in required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            You need an account to view the dashboard.
          </p>
          <Button asChild className="mt-4">
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const user = await getDashboardData(session.user.id);
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">This account has been removed.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {user.name ?? "friend"}</h1>
          <p className="text-sm text-slate-600">
            You are logged in as <strong>{roleLabelMap[user.role]}</strong>.
          </p>
        </div>
        <Badge>{user.role}</Badge>
      </div>

      {user.role === "COMEDIAN" && (
        <Card>
          <CardHeader>
            <CardTitle>Recent applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {user.applications.length === 0 ? (
              <p>
                No applications yet. Head to <Link className="text-brand" href="/gigs">Gigs</Link> to apply.
              </p>
            ) : (
              user.applications.map((application) => (
                <div key={application.id} className="flex items-center justify-between">
                  <span>{application.message.slice(0, 48)}...</span>
                  <Badge variant="outline">{application.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {(user.role === "PROMOTER" || user.role === "VENUE") && (
        <Card>
          <CardHeader>
            <CardTitle>Your gigs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {user.gigs.length === 0 ? (
              <p>No gigs yet. Start by creating one.</p>
            ) : (
              user.gigs.map((gig) => (
                <div key={gig.id} className="flex items-center justify-between">
                  <span>{gig.title}</span>
                  <Badge variant="outline">{gig.status}</Badge>
                </div>
              ))
            )}
            <Button asChild className="mt-2">
              <Link href="/post-gig">Create gig</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {user.role === "FAN" && (
        <Card>
          <CardHeader>
            <CardTitle>Saved gigs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {user.favorites.length === 0 ? (
              <p>You have not saved any gigs yet.</p>
            ) : (
              user.favorites.map((favorite) => (
                <div key={favorite.id}>{favorite.gigId ? `Gig: ${favorite.gigId}` : `Venue: ${favorite.venueId}`}</div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
