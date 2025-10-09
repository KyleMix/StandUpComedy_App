import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CalendarDays,
  Heart,
  LayoutDashboard,
  Megaphone,
  PenLine,
  Sparkles
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import { GigCard } from "@/components/GigCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/prismaEnums";
import { roleLabelMap } from "@/lib/rbac";
import { gigs } from "@/lib/sample";

const trendingGigs = gigs.slice(0, 4);

type HomeUser = NonNullable<Awaited<ReturnType<typeof prisma.user.findUnique>>>;

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

type Stat = {
  label: string;
  value: string;
};

type ActivityItem = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  href?: string;
};

type ActivityContent = {
  title: string;
  empty: string;
  items: ActivityItem[];
};

const roleMessages: Record<Role, string> = {
  [Role.COMEDIAN]: "Your applications, saved shows, and open mics are all in one place.",
  [Role.PROMOTER]: "Keep your rooms packed—here's what's happening with your gigs today.",
  [Role.VENUE]: "Spotlight your stage and keep upcoming nights organized.",
  [Role.FAN]: "Pick up where you left off and never miss a night of laughs.",
  [Role.ADMIN]: "Monitor the community and keep creators and venues supported."
};

const trendingHeadingMap: Record<Role, string> = {
  [Role.COMEDIAN]: "Gigs to keep you on stage",
  [Role.PROMOTER]: "Community booking trends",
  [Role.VENUE]: "What other venues are hosting",
  [Role.FAN]: "Recommended shows for you",
  [Role.ADMIN]: "Community highlights"
};

const trendingDescriptionMap: Record<Role, string> = {
  [Role.COMEDIAN]: "Fresh spots with open slots across the network.",
  [Role.PROMOTER]: "See the shows your peers are putting together.",
  [Role.VENUE]: "Inspiration from rooms across the region.",
  [Role.FAN]: "Add these crowd-pleasers to your calendar.",
  [Role.ADMIN]: "A quick pulse on what's live across The Funny."
};

const quickActionMap: Record<Role, QuickAction[]> = {
  [Role.COMEDIAN]: [
    {
      title: "Browse gigs",
      description: "Find shows looking for comics right now.",
      href: "/gigs",
      icon: CalendarDays
    },
    {
      title: "Update profile",
      description: "Keep your booking info and reel current.",
      href: "/profile",
      icon: PenLine
    },
    {
      title: "Track applications",
      description: "Review responses from promoters.",
      href: "/dashboard",
      icon: Megaphone
    }
  ],
  [Role.PROMOTER]: [
    {
      title: "Post a gig",
      description: "Share a new show and start taking submissions.",
      href: "/post-gig",
      icon: Megaphone
    },
    {
      title: "Manage gigs",
      description: "See applications and update your lineups.",
      href: "/dashboard",
      icon: LayoutDashboard
    },
    {
      title: "Discover comedians",
      description: "Scout talent ready for your room.",
      href: "/comedians",
      icon: Sparkles
    }
  ],
  [Role.VENUE]: [
    {
      title: "Create an event",
      description: "List your next night and fill the bill.",
      href: "/post-gig",
      icon: Megaphone
    },
    {
      title: "Review your calendar",
      description: "Check progress on your upcoming dates.",
      href: "/dashboard",
      icon: CalendarDays
    },
    {
      title: "Find promoters & comics",
      description: "Connect with the people who pack rooms.",
      href: "/profiles",
      icon: Sparkles
    }
  ],
  [Role.FAN]: [
    {
      title: "See saved gigs",
      description: "Jump back into shows you bookmarked.",
      href: "/dashboard",
      icon: Heart
    },
    {
      title: "Explore upcoming shows",
      description: "Find new rooms to laugh in this week.",
      href: "/gigs",
      icon: CalendarDays
    },
    {
      title: "Follow comedians",
      description: "Discover voices you don't want to miss.",
      href: "/comedians",
      icon: Sparkles
    }
  ],
  [Role.ADMIN]: [
    {
      title: "Open admin console",
      description: "Review reports and keep things running.",
      href: "/admin",
      icon: LayoutDashboard
    },
    {
      title: "Monitor activity",
      description: "Check gig submissions and applications.",
      href: "/dashboard",
      icon: Megaphone
    },
    {
      title: "Review profiles",
      description: "See who's joining the community.",
      href: "/profiles",
      icon: Sparkles
    }
  ]
};

function formatStatusLabel(value?: string | null) {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getFirstName(name: string | null, email: string) {
  if (name && name.trim().length > 0) {
    return name.split(" ")[0];
  }
  return email.split("@")[0];
}

function getStatsForUser(user: HomeUser): Stat[] {
  const stats: Stat[] = [
    { label: "Member since", value: format(user.createdAt, "MMM d, yyyy") }
  ];

  switch (user.role) {
    case Role.COMEDIAN: {
      const applications = user.applications ?? [];
      const latestApplication = applications[0];
      stats.push({ label: "Applications sent", value: String(applications.length) });
      stats.push({
        label: "Last application",
        value: latestApplication
          ? formatDistanceToNow(latestApplication.createdAt, { addSuffix: true })
          : "Apply to a gig"
      });
      stats.push({
        label: "Stage name",
        value: user.comedian ? user.comedian.stageName : "Complete your profile"
      });
      break;
    }
    case Role.PROMOTER: {
      const gigs = user.gigs ?? [];
      const openGigs = gigs.filter((gig) => gig.status === "OPEN").length;
      stats.push({ label: "Published gigs", value: String(gigs.length) });
      stats.push({ label: "Open slots", value: String(openGigs) });
      stats.push({
        label: "Verification",
        value: formatStatusLabel(user.promoter?.verificationStatus ?? null)
      });
      break;
    }
    case Role.VENUE: {
      const gigs = user.gigs ?? [];
      const nextGig = [...gigs].sort((a, b) => a.dateStart.getTime() - b.dateStart.getTime())[0];
      stats.push({ label: "Gigs hosted", value: String(gigs.length) });
      stats.push({ label: "Next event", value: nextGig ? format(nextGig.dateStart, "MMM d") : "Schedule one" });
      stats.push({
        label: "Verification",
        value: formatStatusLabel(user.venue?.verificationStatus ?? null)
      });
      break;
    }
    case Role.FAN: {
      const favorites = user.favorites ?? [];
      const latestFavorite = favorites[0];
      stats.push({ label: "Saved gigs", value: String(favorites.length) });
      stats.push({
        label: "Latest save",
        value: latestFavorite
          ? formatDistanceToNow(latestFavorite.createdAt, { addSuffix: true })
          : "Save a gig"
      });
      break;
    }
    case Role.ADMIN: {
      stats.push({ label: "Role", value: "Community admin" });
      stats.push({ label: "Focus", value: "Review requests" });
      break;
    }
    default:
      break;
  }

  return stats;
}

async function buildActivitySection(user: HomeUser): Promise<ActivityContent> {
  if (user.role === Role.COMEDIAN) {
    const applications = user.applications ?? [];
    const recent = applications.slice(0, 3);
    const items = await Promise.all(
      recent.map(async (application) => {
        const gig = await prisma.gig.findUnique({ where: { id: application.gigId } });
        return {
          id: application.id,
          title: gig?.title ?? "Gig application",
          subtitle: gig ? `${gig.city}, ${gig.state}` : undefined,
          meta: `Status: ${formatStatusLabel(application.status)} • Applied ${formatDistanceToNow(application.createdAt, { addSuffix: true })}`,
          href: gig ? `/gigs/${gig.id}` : undefined
        } satisfies ActivityItem;
      })
    );
    return {
      title: "Recent applications",
      empty: "No applications yet. Browse gigs to send your first pitch.",
      items
    };
  }

  if (user.role === Role.PROMOTER || user.role === Role.VENUE) {
    const gigs = [...(user.gigs ?? [])]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3)
      .map((gig) => ({
        id: gig.id,
        title: gig.title,
        subtitle: `${gig.city}, ${gig.state}`,
        meta: `Status: ${formatStatusLabel(gig.status)} • Posted ${format(gig.createdAt, "MMM d")}`,
        href: `/gigs/${gig.id}`
      } satisfies ActivityItem));
    return {
      title: "Your latest gigs",
      empty: "No gigs yet. Post one to get the word out.",
      items: gigs
    };
  }

  if (user.role === Role.FAN) {
    const favorites = user.favorites ?? [];
    const items = (
      await Promise.all(
        favorites.slice(0, 3).map(async (favorite) => {
          if (favorite.gigId) {
            const gig = await prisma.gig.findUnique({ where: { id: favorite.gigId } });
            if (!gig) return null;
            return {
              id: favorite.id,
              title: gig.title,
              subtitle: `${gig.city}, ${gig.state}`,
              meta: `Saved ${formatDistanceToNow(favorite.createdAt, { addSuffix: true })}`,
              href: `/gigs/${gig.id}`
            } satisfies ActivityItem;
          }
          if (favorite.venueId) {
            const venue = await prisma.venueProfile.findUnique({ where: { userId: favorite.venueId } });
            if (!venue) return null;
            return {
              id: favorite.id,
              title: venue.venueName,
              subtitle: `${venue.city}, ${venue.state}`,
              meta: `Saved ${formatDistanceToNow(favorite.createdAt, { addSuffix: true })}`,
              href: "/profiles"
            } satisfies ActivityItem;
          }
          return null;
        })
      )
    ).filter((item): item is ActivityItem => item !== null);

    return {
      title: "Saved gigs & venues",
      empty: "Save a gig to keep it on your radar.",
      items
    };
  }

  const gigs = await prisma.gig.findMany({
    where: { isPublished: true },
    orderBy: { dateStart: "asc" },
    take: 3
  });
  const items = gigs.map((gig) => ({
    id: gig.id,
    title: gig.title,
    subtitle: `${gig.city}, ${gig.state}`,
    meta: `Starts ${format(gig.dateStart, "MMM d")}`,
    href: `/gigs/${gig.id}`
  } satisfies ActivityItem));

  return {
    title: "Community highlights",
    empty: "No gigs are published yet.",
    items
  };
}

async function buildPersonalizedContent(user: HomeUser) {
  const role = user.role;
  return {
    heroMessage: roleMessages[role] ?? roleMessages[Role.FAN],
    quickActions: quickActionMap[role] ?? quickActionMap[Role.FAN],
    stats: getStatsForUser(user),
    activity: await buildActivitySection(user),
    trendingHeading: trendingHeadingMap[role] ?? "Trending gigs",
    trendingDescription:
      trendingDescriptionMap[role] ?? "Fresh shows from Olympia, Tacoma, Seattle, and Portland to keep your calendar hot."
  };
}

function QuickActionLink({ action }: { action: QuickAction }) {
  const Icon = action.icon;
  return (
    <Link
      href={action.href}
      className="group flex items-start gap-4 rounded-2xl border border-base-300 bg-white/80 px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:bg-white hover:shadow-lg"
    >
      <span className="mt-1 rounded-full bg-brand/10 p-2 text-brand group-hover:bg-brand/20">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="font-medium text-base-content">{action.title}</p>
        <p className="text-sm text-base-content/70">{action.description}</p>
      </div>
      <ArrowRight className="mt-1 h-4 w-4 text-base-content/40 transition group-hover:translate-x-1 group-hover:text-brand" />
    </Link>
  );
}

function StatsPanel({ stats }: { stats: Stat[] }) {
  return (
    <div className="rounded-2xl border border-base-300 bg-white/90 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-base-content/70">Your status</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <div key={stat.label} className="space-y-1">
            <dt className="text-xs uppercase tracking-wide text-base-content/50">{stat.label}</dt>
            <dd className="text-lg font-semibold text-base-content">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ActivitySection({ data }: { data: ActivityContent }) {
  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {data.items.length === 0 ? (
            <p className="text-sm text-base-content/70">{data.empty}</p>
          ) : (
            <ul className="space-y-4">
              {data.items.map((item) => (
                <li key={item.id}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="group block rounded-xl border border-base-300 bg-base-100/80 px-4 py-3 transition hover:border-brand hover:bg-white hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-base-content">{item.title}</p>
                          {item.subtitle ? (
                            <p className="text-sm text-base-content/70">{item.subtitle}</p>
                          ) : null}
                          {item.meta ? <p className="text-xs text-base-content/60">{item.meta}</p> : null}
                        </div>
                        <ArrowRight className="mt-1 h-4 w-4 text-base-content/40 transition group-hover:translate-x-1 group-hover:text-brand" />
                      </div>
                    </Link>
                  ) : (
                    <div className="rounded-xl border border-base-300 bg-base-100/80 px-4 py-3">
                      <p className="font-medium text-base-content">{item.title}</p>
                      {item.subtitle ? (
                        <p className="text-sm text-base-content/70">{item.subtitle}</p>
                      ) : null}
                      {item.meta ? <p className="text-xs text-base-content/60">{item.meta}</p> : null}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function HeroShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-base-300 bg-base-200/60 px-6 py-16 sm:px-10">
      <div className="absolute inset-0 -z-10 opacity-70">
        <svg
          className="absolute -left-24 -top-24 h-72 w-72 text-secondary/30"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M53.8,-64.3C68.3,-51,79.6,-34.1,82.7,-16.2C85.8,1.7,80.7,20.7,69.9,35.3C59.2,49.9,42.7,60.1,24.7,65.4C6.8,70.7,-12.5,71.1,-30.3,65.2C-48,59.3,-64.2,47,-72,30.7C-79.8,14.4,-79.3,-6,-71.4,-23.2C-63.5,-40.3,-48.1,-54.1,-31.4,-66.4C-14.6,-78.7,3.4,-89.6,20.9,-87.7C38.4,-85.8,56.4,-71.6,53.8,-64.3Z"
            transform="translate(100 100)"
          />
        </svg>
        <div className="absolute inset-0 bg-grid-dots/[0.12] bg-[length:24px_24px]" aria-hidden="true" />
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function TrendingSection({ heading, description }: { heading: string; description: string }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 text-center lg:text-left">
        <h2 className="text-3xl font-manrope">{heading}</h2>
        <p className="text-base text-base-content/70">{description}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {trendingGigs.map((gig) => (
          <GigCard key={gig.id} {...gig} />
        ))}
      </div>
    </section>
  );
}

function PublicHome() {
  return (
    <div className="space-y-16">
      <HeroShell>
        <div className="space-y-6 text-center lg:text-left">
          <span className="badge badge-secondary badge-outline border-secondary/40 px-4 py-3 uppercase tracking-[0.3em]">
            Stand-up made social
          </span>
          <h1 className="font-manrope text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Find gigs, book comics, and pack every room with laughs.
          </h1>
          <p className="mx-auto max-w-2xl text-base text-base-content/80 lg:mx-0">
            The Funny keeps Northwest comics, bookers, and superfans in sync. Discover open mics, secure paid spots, and grow your
            comedy crew—no spreadsheets required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Link
              href="/gigs"
              className="btn btn-primary btn-wide sm:btn-md focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/60"
            >
              Find Gigs
            </Link>
            <Link
              href="/profiles"
              className="btn btn-outline focus-visible:outline-none focus-visible:ring focus-visible:ring-secondary/50"
            >
              Create Profile
            </Link>
          </div>
        </div>
      </HeroShell>

      <TrendingSection
        heading="Trending Gigs"
        description="Fresh shows from Olympia, Tacoma, Seattle, and Portland to keep your calendar hot."
      />
    </div>
  );
}

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    return <PublicHome />;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      comedian: true,
      promoter: true,
      venue: true,
      applications: { take: 5, orderBy: { createdAt: "desc" } },
      gigs: { take: 5, orderBy: { createdAt: "desc" } },
      favorites: { take: 5, orderBy: { createdAt: "desc" } }
    }
  });

  if (!user) {
    return <PublicHome />;
  }

  const firstName = getFirstName(user.name ?? null, user.email);
  const content = await buildPersonalizedContent(user);

  return (
    <div className="space-y-16">
      <HeroShell>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-6">
            <span className="badge badge-secondary badge-outline border-secondary/40 px-4 py-3 uppercase tracking-[0.3em]">
              Signed in as {roleLabelMap[user.role]}
            </span>
            <h1 className="font-manrope text-4xl leading-tight sm:text-5xl lg:text-6xl">Welcome back, {firstName}.</h1>
            <p className="max-w-2xl text-base text-base-content/80">{content.heroMessage}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {content.quickActions.map((action) => (
                <QuickActionLink key={action.href} action={action} />
              ))}
            </div>
          </div>
          <StatsPanel stats={content.stats} />
        </div>
      </HeroShell>

      <ActivitySection data={content.activity} />

      <TrendingSection heading={content.trendingHeading} description={content.trendingDescription} />
    </div>
  );
}
