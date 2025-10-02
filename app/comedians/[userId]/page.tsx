import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  MapPin,
  Mic2,
  Play,
  Sparkles,
  Video
} from "lucide-react";

const longDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric"
});

function embedYouTube(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      const paths = parsed.pathname.split("/").filter(Boolean);
      if (paths[0] === "embed" && paths[1]) return url;
    }
    if (parsed.hostname === "youtu.be") {
      const segments = parsed.pathname.split("/").filter(Boolean);
      if (segments[0]) {
        return `https://www.youtube.com/embed/${segments[0]}`;
      }
    }
  } catch (error) {
    return null;
  }
  return null;
}

function toInstagramUrl(handle: string) {
  return `https://www.instagram.com/${handle.replace(/^@/, "")}`;
}

function toTikTokUrl(handle: string) {
  return `https://www.tiktok.com/@${handle.replace(/^@/, "")}`;
}

function formatLocation(city: string | null, state: string | null) {
  if (!city && !state) return null;
  if (city && state) return `${city}, ${state}`;
  return city ?? state ?? null;
}

export default async function ComedianProfilePage({ params }: { params: { userId: string } }) {
  const comedian = await prisma.comedian.findUnique({
    where: { userId: params.userId },
    include: {
      user: true,
      videos: { orderBy: { postedAt: "desc" } },
      appearances: { orderBy: { performedAt: "desc" } }
    }
  });

  if (!comedian) {
    notFound();
  }

  const location = formatLocation(comedian.homeCity, comedian.homeState);

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost" className="px-0 text-brand hover:text-brand-dark">
        <Link href="/comedians" className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to comedians
        </Link>
      </Button>

      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <Badge variant="outline" className="border-brand/30 text-brand">
                Verified talent profile
              </Badge>
              <h1 className="text-4xl font-semibold text-slate-900">{comedian.stageName}</h1>
              {comedian.user?.name && <p className="text-sm text-slate-500">Legal name: {comedian.user.name}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1">
                <Mic2 className="h-4 w-4 text-brand" /> Comedian
              </span>
              {location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-brand" /> {location}
                </span>
              )}
              {typeof comedian.travelRadiusMiles === "number" && (
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-amber-500" /> Travels {comedian.travelRadiusMiles} miles
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-medium text-brand">
              {comedian.website && (
                <a href={comedian.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                  <ExternalLink className="h-4 w-4" /> Website
                </a>
              )}
              {comedian.reelUrl && (
                <a href={comedian.reelUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                  <Play className="h-4 w-4" /> Reel
                </a>
              )}
              {comedian.instagram && (
                <a href={toInstagramUrl(comedian.instagram)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                  <ExternalLink className="h-4 w-4" /> Instagram
                </a>
              )}
              {comedian.tiktokHandle && (
                <a href={toTikTokUrl(comedian.tiktokHandle)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                  <ExternalLink className="h-4 w-4" /> TikTok
                </a>
              )}
              {comedian.youtubeChannel && (
                <a href={comedian.youtubeChannel} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                  <ExternalLink className="h-4 w-4" /> YouTube
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="border-slate-200/80 bg-white/80">
          <CardHeader>
            <CardTitle>About {comedian.stageName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            {comedian.bio ? <p>{comedian.bio}</p> : <p className="text-slate-400">No bio has been added yet.</p>}
            <div className="space-y-1 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Credits</p>
              <p>{comedian.credits ?? "No credits listed."}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/80">
          <CardHeader>
            <CardTitle>Booking quick facts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-700">Primary location:</span> {location ?? "Not specified"}
            </p>
            <p>
              <span className="font-medium text-slate-700">Travel radius:</span>{" "}
              {typeof comedian.travelRadiusMiles === "number" ? `${comedian.travelRadiusMiles} miles` : "Not provided"}
            </p>
            <p>
              <span className="font-medium text-slate-700">Contact:</span> {comedian.user?.email ?? "See promoter portal"}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Featured clips</h2>
          <Badge variant="secondary" className="bg-brand/10 text-brand">
            {comedian.videos?.length ?? 0} posted
          </Badge>
        </div>
        {comedian.videos && comedian.videos.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {comedian.videos.map((video) => {
              const embedUrl = video.platform === "YOUTUBE" ? embedYouTube(video.url) : null;
              return (
                <Card key={video.id} className="overflow-hidden border-slate-200/80 bg-white/80">
                  <CardHeader>
                    <CardTitle className="text-base">{video.title}</CardTitle>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{video.platform}</p>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-600">
                    {embedUrl ? (
                      <div className="aspect-video overflow-hidden rounded-lg border border-slate-200/80">
                        <iframe
                          src={embedUrl}
                          title={video.title}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-brand hover:text-brand-dark"
                      >
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
                          {video.platform === "YOUTUBE" ? <Play className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                        </span>
                        Watch on {video.platform}
                      </a>
                    )}
                    <p className="text-xs text-slate-400">Shared {longDate.format(video.postedAt)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-slate-200/80 bg-white/80">
            <CardContent className="py-8 text-center text-sm text-slate-400">
              No video clips have been posted yet.
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Show history</h2>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
            {comedian.appearances?.length ?? 0} completed shows
          </Badge>
        </div>
        {comedian.appearances && comedian.appearances.length > 0 ? (
          <div className="grid gap-3">
            {comedian.appearances.map((appearance) => (
              <Card key={appearance.id} className="border-slate-200/80 bg-white/80">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm text-slate-600">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{appearance.showName}</p>
                    <p className="text-xs text-slate-500">
                      {appearance.venueName} • {appearance.city}, {appearance.state}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    {longDate.format(appearance.performedAt)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-slate-200/80 bg-white/80">
            <CardContent className="py-8 text-center text-sm text-slate-400">
              No verified shows recorded yet.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
