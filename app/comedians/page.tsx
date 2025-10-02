import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Play, Video } from "lucide-react";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

function formatLocation(city: string | null, state: string | null) {
  if (!city && !state) return null;
  if (city && state) return `${city}, ${state}`;
  return city ?? state ?? null;
}

function tiktokUrl(handle: string) {
  const normalized = handle.startsWith("@") ? handle.slice(1) : handle;
  return `https://www.tiktok.com/@${normalized}`;
}

export default async function ComediansPage() {
  const comedians = await prisma.comedian.findMany({
    include: {
      user: true,
      videos: { take: 2, orderBy: { postedAt: "desc" } },
      appearances: { take: 3, orderBy: { performedAt: "desc" } }
    }
  });

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <Badge variant="outline" className="w-fit border-brand/40 text-brand">
          Talent directory
        </Badge>
        <h1 className="text-3xl font-semibold text-slate-900">Featured comedians</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Discover detailed profiles with reels, TikTok clips, YouTube highlights, and proof of shows already performed
          across the network.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {comedians.map((comedian) => {
          const location = formatLocation(comedian.homeCity, comedian.homeState);
          return (
            <Card key={comedian.userId} className="flex h-full flex-col justify-between border-slate-200/80 bg-white/80">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      {comedian.stageName}
                    </CardTitle>
                    {comedian.user?.name && <p className="text-sm text-slate-500">{comedian.user.name}</p>}
                  </div>
                  <Badge variant="outline" className="border-brand/30 text-[10px] uppercase tracking-wide text-brand">
                    Comedian
                  </Badge>
                </div>
                {location && (
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-brand" />
                    {location}
                    {comedian.travelRadiusMiles ? ` • Travels ${comedian.travelRadiusMiles} mi` : null}
                  </p>
                )}
                {comedian.bio && <p className="text-sm text-slate-600">{comedian.bio}</p>}
                <div className="flex flex-wrap gap-2 text-xs font-medium text-brand">
                  {comedian.website && (
                    <a href={comedian.website} target="_blank" rel="noreferrer" className="hover:underline">
                      Website
                    </a>
                  )}
                  {comedian.instagram && (
                    <a
                      href={`https://www.instagram.com/${comedian.instagram.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      Instagram
                    </a>
                  )}
                  {comedian.tiktokHandle && (
                    <a href={tiktokUrl(comedian.tiktokHandle)} target="_blank" rel="noreferrer" className="hover:underline">
                      TikTok
                    </a>
                  )}
                  {comedian.youtubeChannel && (
                    <a href={comedian.youtubeChannel} target="_blank" rel="noreferrer" className="hover:underline">
                      YouTube
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-5 text-sm text-slate-600">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Featured clips</p>
                  {comedian.videos && comedian.videos.length > 0 ? (
                    <ul className="space-y-2">
                      {comedian.videos.map((video) => (
                        <li key={video.id}>
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm text-brand transition hover:text-brand-dark"
                          >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-brand">
                              {video.platform === "YOUTUBE" ? <Play className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                            </span>
                            <span className="flex-1">
                              {video.title}
                              <span className="ml-2 text-xs uppercase tracking-wide text-slate-400">{video.platform}</span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">No clips shared yet.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent shows</p>
                  {comedian.appearances && comedian.appearances.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {comedian.appearances.map((appearance) => (
                        <li key={appearance.id} className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-700">{appearance.showName}</p>
                            <p className="text-xs text-slate-500">
                              {appearance.venueName} • {appearance.city}, {appearance.state}
                            </p>
                          </div>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {dateFormatter.format(appearance.performedAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">No shows logged yet.</p>
                  )}
                </div>

                <Button asChild variant="outline" className="w-full border-brand/40 text-brand">
                  <Link href={`/comedians/${comedian.userId}`}>View full profile</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
