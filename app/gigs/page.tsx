import { prisma } from "@/lib/prisma";
import { gigFiltersSchema } from "@/lib/zodSchemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Suspense } from "react";

async function GigsList({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const parsed = gigFiltersSchema.safeParse(searchParams);
  const page = parsed.success ? parsed.data.page : 1;
  const take = 10;
  const skip = (page - 1) * take;

  const gigs = await prisma.gig.findMany({
    where: {
      isPublished: true,
      title: parsed.success && parsed.data.search ? { contains: parsed.data.search, mode: "insensitive" } : undefined,
      city: parsed.success && parsed.data.city ? { contains: parsed.data.city, mode: "insensitive" } : undefined,
      state: parsed.success && parsed.data.state ? parsed.data.state : undefined,
      compensationType: parsed.success ? parsed.data.compensationType ?? undefined : undefined,
      status: parsed.success ? parsed.data.status ?? undefined : undefined
    },
    orderBy: { dateStart: "asc" },
    skip,
    take
  });

  if (gigs.length === 0) {
    return <p className="text-sm text-slate-600">No gigs match the filters yet.</p>;
  }

  return (
    <div className="grid gap-4">
      {gigs.map((gig) => (
        <Card key={gig.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              <Link href={`/gigs/${gig.id}`} className="hover:underline">
                {gig.title}
              </Link>
            </CardTitle>
            <Badge variant="outline">{gig.compensationType}</Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>{gig.description.slice(0, 140)}...</p>
            <p className="flex gap-2 text-xs uppercase tracking-wide text-slate-500">
              <span>
                {gig.city}, {gig.state}
              </span>
              <span>Starts {gig.dateStart.toLocaleDateString()}</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function GigsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Browse gigs</h1>
        <p className="text-sm text-slate-600">Filter by location, compensation, and more.</p>
      </div>
      <Suspense key={JSON.stringify(searchParams)} fallback={<p>Loading gigs...</p>}>
        <GigsList searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
