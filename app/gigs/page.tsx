import { prisma } from "@/lib/prisma";
import { gigFiltersSchema } from "@/lib/zodSchemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { GigFilters } from "./GigFilters";

type SearchParams = Record<string, string | string[] | undefined>;

function stringifySearchParams(searchParams: SearchParams) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "undefined") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
    } else {
      params.set(key, value);
    }
  }

  return params.toString();
}

async function GigsList({ searchParams }: { searchParams: SearchParams }) {
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
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50/80">
        <HeroBackground pattern="jigsaw" />
        <EmptyState
          title="No gigs match yet"
          message="Adjust your filters or check back soon—new shows are posted every week."
          illustration="events-placeholder.svg"
          className="border-none bg-white/70 backdrop-blur-sm"
          actions={
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/post-gig">Post a gig</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/gigs">Reset filters</Link>
              </Button>
            </div>
          }
        />
      </div>
    );
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

export default function GigsPage({ searchParams }: { searchParams: SearchParams }) {
  const parsed = gigFiltersSchema.safeParse(searchParams);
  const initialSearch = parsed.success && parsed.data.search ? parsed.data.search : "";
  const initialCity = parsed.success && parsed.data.city ? parsed.data.city : "";
  const initialState = parsed.success && parsed.data.state ? parsed.data.state : "";
  const searchParamsString = stringifySearchParams(searchParams);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Browse gigs</h1>
        <p className="text-sm text-slate-600">Filter by location, compensation, and more.</p>
      </div>
      <GigFilters
        initialSearch={initialSearch}
        initialCity={initialCity}
        initialState={initialState}
        searchParamsString={searchParamsString}
      />
      <Suspense key={JSON.stringify(searchParams)} fallback={<p>Loading gigs...</p>}>
        <GigsList searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
