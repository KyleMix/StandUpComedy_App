import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { fetchGigWeatherSummary } from "@/lib/external-apis";
import { prisma } from "@/lib/prisma";
import { canApplyToGig } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatCompensationBadge(type: string, payoutUsd: number | null) {
  if (type === "FLAT" && typeof payoutUsd === "number") {
    return `${currencyFormatter.format(payoutUsd)} flat`;
  }
  if (type === "TIPS") {
    return "Tips + stage time";
  }
  if (type === "DOOR_SPLIT") {
    return "Door split";
  }
  if (type === "UNPAID") {
    return "Stage time";
  }
  return formatEnumLabel(type);
}

function formatCompensationDetail(type: string, payoutUsd: number | null) {
  if (type === "FLAT") {
    return typeof payoutUsd === "number"
      ? `${currencyFormatter.format(payoutUsd)} flat guarantee`
      : "Flat guarantee (amount TBD)";
  }
  if (type === "DOOR_SPLIT") {
    return "Door split with the producer";
  }
  if (type === "TIPS") {
    return "Tips are passed directly to performers";
  }
  if (type === "UNPAID") {
    return "Stage time / unpaid spot";
  }
  return formatEnumLabel(type);
}

function formatSetLength(minutes: number | null) {
  if (typeof minutes !== "number") {
    return "Booker will confirm set length";
  }
  return `${minutes}-minute set${minutes === 1 ? "" : "s"}`;
}

function formatMinAge(minAge: number | null) {
  if (typeof minAge === "number") {
    return `${minAge}+ venue policy`;
  }
  return "All ages welcome";
}

function formatLineupSpots(totalSpots: number | null, remaining: number | null, applied: number) {
  if (typeof totalSpots === "number") {
    const spotsLeft = typeof remaining === "number" ? remaining : Math.max(totalSpots - applied, 0);
    const appliedLabel = applied === 1 ? "1 comedian applied" : `${applied} comedians applied`;
    return `${spotsLeft} spots open • ${totalSpots} total • ${appliedLabel}`;
  }
  if (applied > 0) {
    return `${applied} comedians have applied so far`;
  }
  return "Rolling submissions";
}

async function applyToGig(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) {
    throw new Error("You must be signed in to apply");
  }

  const gigId = formData.get("gigId");
  const fallbackMessage = formData.get("fallbackMessage");
  const note = formData.get("note");

  if (typeof gigId !== "string") {
    throw new Error("Invalid application");
  }

  if (!canApplyToGig(session.user.role)) {
    throw new Error("Only comedians can apply");
  }

  let message: string | null = null;
  if (typeof note === "string" && note.trim().length > 0) {
    message = note.trim();
  } else if (typeof fallbackMessage === "string" && fallbackMessage.trim().length > 0) {
    message = fallbackMessage.trim();
  }

  if (!message) {
    message = "I'd love to be considered for this gig.";
  }

  if (message.length > 1000) {
    message = message.slice(0, 1000);
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

  const [weather, activeApplicationCount] = await Promise.all([
    fetchGigWeatherSummary(gig.city, gig.state ?? null, gig.dateStart),
    prisma.application.count({ where: { gigId: gig.id } })
  ]);

  const totalSpots = typeof gig.totalSpots === "number" ? gig.totalSpots : null;
  const spotsRemaining = totalSpots !== null ? Math.max(totalSpots - activeApplicationCount, 0) : null;

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: gig.timezone,
    timeZoneName: "short"
  });
  const startLabel = dateFormatter.format(gig.dateStart);

  const fallbackMessage = `Hi there! I'm available for ${gig.title} on ${startLabel} in ${gig.city}. I'd love to perform.`;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-semibold">{gig.title}</CardTitle>
          <p className="text-sm text-slate-500">
            {startLabel} • {gig.city}, {gig.state}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{formatCompensationBadge(gig.compensationType, gig.payoutUsd)}</Badge>
          {spotsRemaining !== null && <Badge variant="outline">{spotsRemaining} spots left</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 text-sm leading-relaxed text-slate-700">
        <div className="space-y-2">
          {gig.format && <p className="font-semibold text-slate-900">{gig.format}</p>}
          <p>{gig.description}</p>
        </div>
        {weather && (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-medium text-slate-700">
              Local forecast (
              {new Date(weather.localDate).toLocaleDateString(undefined, { timeZone: weather.timezone })})
            </p>
            <p className="mt-1">
              {weather.description} with highs near {Math.round(weather.maxTempC)}°C/{
                Math.round(weather.maxTempC * (9 / 5) + 32)
              }
              °F and lows around {Math.round(weather.minTempC)}°C/{Math.round(weather.minTempC * (9 / 5) + 32)}°F.
            </p>
            {typeof weather.precipitationChance === "number" && (
              <p>Precipitation chance: {Math.round(weather.precipitationChance)}%.</p>
            )}
            <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">Powered by Open-Meteo</p>
          </div>
        )}
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Show details</h2>
          <dl className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">When</dt>
              <dd className="mt-1 text-sm text-slate-700">{startLabel}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Where</dt>
              <dd className="mt-1 text-sm text-slate-700">
                {gig.city}, {gig.state}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Set length</dt>
              <dd className="mt-1 text-sm text-slate-700">{formatSetLength(gig.setLengthMinutes)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lineup spots</dt>
              <dd className="mt-1 text-sm text-slate-700">
                {formatLineupSpots(totalSpots, spotsRemaining, activeApplicationCount)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Compensation</dt>
              <dd className="mt-1 text-sm text-slate-700">
                {formatCompensationDetail(gig.compensationType, gig.payoutUsd)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Age requirement</dt>
              <dd className="mt-1 text-sm text-slate-700">{formatMinAge(gig.minAge)}</dd>
            </div>
            {gig.audienceDescription && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Audience vibe</dt>
                <dd className="mt-1 text-sm text-slate-700">{gig.audienceDescription}</dd>
              </div>
            )}
          </dl>
        </section>
        {gig.perks.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-900">Perks & expectations</h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {gig.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-brand"></span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {canApply ? (
          <form action={applyToGig} className="space-y-4 rounded-lg border border-slate-200 p-4">
            <input type="hidden" name="gigId" value={gig.id} />
            <input type="hidden" name="fallbackMessage" value={fallbackMessage} />
            {spotsRemaining !== null && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  <span className="font-semibold text-slate-900">{spotsRemaining}</span> spots left
                  {typeof totalSpots === "number" ? ` • ${totalSpots} total` : ""}
                </span>
                <span>
                  {activeApplicationCount === 1
                    ? "1 comedian already applied"
                    : `${activeApplicationCount} comedians already applied`}
                </span>
              </div>
            )}
            <p className="text-sm text-slate-600">
              We&apos;ll include your profile automatically. Add an optional note for the booker, or just click apply.
            </p>
            <textarea
              name="note"
              rows={4}
              maxLength={1000}
              className="w-full rounded-md border border-slate-200 p-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
              placeholder="Share your avails, credits, or hosting experience — or leave it blank for a one-click apply."
            />
            <Button type="submit" className="w-full sm:w-auto">
              Apply with one click
            </Button>
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
