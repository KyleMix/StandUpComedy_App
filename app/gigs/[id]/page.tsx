import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canApplyToGig } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchGigWeatherSummary } from "@/lib/external-apis";

async function applyToGig(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) {
    throw new Error("You must be signed in to apply");
  }
  const gigId = formData.get("gigId");
  const message = formData.get("message");
  if (typeof gigId !== "string" || typeof message !== "string") {
    throw new Error("Invalid application");
  }
  if (!canApplyToGig(session.user.role)) {
    throw new Error("Only comedians can apply");
  }
  await prisma.application.create({
    data: {
      gigId,
      comedianUserId: session.user.id,
      message,
      status: "SUBMITTED"
    }
  });
}

export default async function GigDetailPage({ params }: { params: { id: string } }) {
  const gig = await prisma.gig.findUnique({ where: { id: params.id } });
  if (!gig || !gig.isPublished) {
    notFound();
  }
  const session = await auth();
  const canApply = session?.user ? canApplyToGig(session.user.role) : false;
  const weather = await fetchGigWeatherSummary(gig.city, gig.state ?? null, gig.dateStart);

  return (
    <Card>
      <CardHeader className="flex items-start justify-between gap-4">
        <div>
          <CardTitle className="text-2xl font-semibold">{gig.title}</CardTitle>
          <p className="text-sm text-slate-500">
            {gig.city}, {gig.state} • {gig.dateStart.toLocaleDateString()}
          </p>
        </div>
        <Badge>{gig.compensationType}</Badge>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-relaxed text-slate-700">
        <p>{gig.description}</p>
        {weather && (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-medium text-slate-700">
              Local forecast ({new Date(weather.localDate).toLocaleDateString(undefined, { timeZone: weather.timezone })})
            </p>
            <p className="mt-1">
              {weather.description} with highs near {Math.round(weather.maxTempC)}°C/
              {Math.round(weather.maxTempC * (9 / 5) + 32)}°F and lows around {Math.round(weather.minTempC)}°C/
              {Math.round(weather.minTempC * (9 / 5) + 32)}°F.
            </p>
            {typeof weather.precipitationChance === "number" && (
              <p>Precipitation chance: {Math.round(weather.precipitationChance)}%.</p>
            )}
            <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">Powered by Open-Meteo</p>
          </div>
        )}
        {canApply ? (
          <form action={applyToGig} className="space-y-3">
            <input type="hidden" name="gigId" value={gig.id} />
            <textarea
              name="message"
              required
              minLength={20}
              className="w-full rounded-md border border-slate-200 p-2"
              placeholder="Share your credits, availability, and why you're a fit"
            />
            <Button type="submit">Submit application</Button>
          </form>
        ) : (
          <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            Sign in as a comedian to apply to this gig.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
