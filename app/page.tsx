import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/Icon";

const primaryActions = [
  {
    label: "Join as comedian",
    description: "Lock in bookings faster with verified promoter and venue listings.",
    href: "/auth/sign-up?role=COMEDIAN"
  },
  {
    label: "Join as promoter",
    description: "Post rooms, share run-of-show details, and manage applicants in one place.",
    href: "/auth/sign-up?role=PROMOTER"
  },
  {
    label: "Join as venue",
    description: "Keep your calendar full by showcasing specs, payouts, and tech requirements.",
    href: "/auth/sign-up?role=VENUE"
  }
];

const boardThreads = [
  {
    title: "Looking for a late-night host in Chicago",
    excerpt:
      "Skyline Rooms needs a seasoned comic to host our Friday midnight mic. Share your tape and weekday availability.",
    tags: ["Booking", "Chicago"],
    replies: 12,
    updated: "12 minutes ago"
  },
  {
    title: "Room share: fully equipped black box in Austin",
    excerpt:
      "200-seat room available Sunday through Tuesday. Lights, sound, and door staff included. DM for rate sheet.",
    tags: ["Venue", "Texas"],
    replies: 6,
    updated: "47 minutes ago"
  },
  {
    title: "Workshop: building a tight festival set",
    excerpt:
      "Share feedback on 7-minute festival-ready sets. Recording swaps encouraged; constructive notes required.",
    tags: ["Craft", "Feedback"],
    replies: 18,
    updated: "1 hour ago"
  }
];

const quickLinks = [
  {
    label: "Post a gig opportunity",
    icon: "CalendarPlus" as const,
    href: "/gigs/post"
  },
  {
    label: "Request avails from comedians",
    icon: "CalendarSearch" as const,
    href: "/dashboard/availability"
  },
  {
    label: "Share production resources",
    icon: "HardHat" as const,
    href: "/dashboard/resources"
  }
];

const profileHighlights = [
  {
    title: "Comedian profiles",
    description:
      "Keep avails, tech needs, reel, credits, and routing in one place so promoters can book without guesswork.",
    icon: "Mic2" as const,
    href: "/comedians"
  },
  {
    title: "Venue profiles",
    description:
      "Publish room specs, payout models, load-in instructions, and contract templates to streamline every show night.",
    icon: "Building2" as const,
    href: "/venues"
  }
];

const operationsNotes = [
  {
    title: "Background checks & verification",
    description:
      "Every promoter and venue is reviewed before posting so comics can share sensitive routing info with confidence.",
    icon: "ShieldCheck" as const
  },
  {
    title: "Paperwork handled",
    description:
      "Generate deal memos, set payout schedules, and track W-9s right from the thread that kicked off the booking.",
    icon: "FileSpreadsheet" as const
  },
  {
    title: "Stay in sync",
    description:
      "Thread activity feeds directly into calendars, reminders, and group chats for your production team.",
    icon: "BellRing" as const
  }
];

export default function LandingPage() {
  return (
    <section className="space-y-10 pb-16">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="space-y-4">
          <Badge variant="outline" className="w-fit border-brand/30 text-brand">
            Working comedy bulletin
          </Badge>
          <CardTitle className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            the-funny workboard
          </CardTitle>
          <p className="max-w-2xl text-base text-slate-600">
            Built for comedians, promoters, and venues to coordinate shows, swap resources, and keep the run-of-show tight.
            No fan features—just the tools the industry relies on to make nights happen.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2 text-base">
              <Link href="/dashboard">
                Enter message board
                <Icon name="ArrowRight" className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 text-base text-brand">
              <Link href="/gigs/post">
                Post an opportunity
                <Icon name="Plus" className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {primaryActions.map((action) => (
              <div key={action.label} className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4">
                <p className="text-sm font-semibold text-slate-800">{action.label}</p>
                <p className="mt-2 text-sm text-slate-600">{action.description}</p>
                <Button asChild variant="link" className="mt-3 h-auto p-0 text-sm text-brand">
                  <Link href={action.href}>Create profile</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-2">
            <Badge variant="outline" className="w-fit border-slate-200 text-slate-600">
              Live threads
            </Badge>
            <CardTitle className="text-2xl text-slate-900">Today on the board</CardTitle>
            <p className="text-sm text-slate-600">
              Threads stay focused on actionable details—drop avails, negotiate terms, and lock the lineup without leaving the
              conversation.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {boardThreads.map((thread) => (
              <article key={thread.title} className="space-y-3 rounded-2xl border border-slate-200/80 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{thread.title}</h3>
                  <span className="text-xs text-slate-500">Updated {thread.updated}</span>
                </div>
                <p className="text-sm text-slate-600">{thread.excerpt}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Icon name="MessageCircle" className="h-3.5 w-3.5" />
                    {thread.replies} replies
                  </div>
                  {thread.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                      #{tag}
                    </span>
                  ))}
                  <Button asChild variant="ghost" size="sm" className="ml-auto h-7 px-3 text-xs">
                    <Link href="/dashboard">Open thread</Link>
                  </Button>
                </div>
              </article>
            ))}
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-slate-50 shadow-inner">
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg text-slate-800">Quick actions</CardTitle>
            <p className="text-sm text-slate-600">Keep the workflow moving with one-click tools.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickLinks.map((link) => (
              <Button
                key={link.label}
                asChild
                variant="ghost"
                className="w-full justify-start gap-3 border border-slate-200 bg-white text-left text-sm font-medium text-slate-700 hover:border-brand/40"
              >
                <Link href={link.href}>
                  <Icon name={link.icon} className="h-4 w-4 text-brand" />
                  {link.label}
                </Link>
              </Button>
            ))}
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Need something else?</p>
              <p className="mt-1">
                Start a &quot;Help wanted&quot; thread and tag the city or tour leg you&apos;re working on. The community can jump in with
                resources fast.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {profileHighlights.map((profile) => (
          <Card key={profile.title} className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Icon name={profile.icon} className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-xl text-slate-900">{profile.title}</CardTitle>
                <p className="mt-1 text-sm text-slate-600">{profile.description}</p>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="border-brand/40 text-brand">
                <Link href={profile.href}>Explore profiles</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="space-y-2">
          <Badge variant="outline" className="w-fit border-slate-200 text-slate-600">
            Operations essentials
          </Badge>
          <CardTitle className="text-2xl text-slate-900">Why working comics stay here</CardTitle>
          <p className="text-sm text-slate-600">
            Every feature protects the people doing the work—no fan chatter, just logistics, accountability, and faster payouts.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {operationsNotes.map((note) => (
            <div key={note.title} className="space-y-2 rounded-2xl border border-slate-200/80 p-4">
              <div className="flex items-center gap-2 text-slate-700">
                <Icon name={note.icon} className="h-4 w-4 text-brand" />
                <p className="text-sm font-semibold">{note.title}</p>
              </div>
              <p className="text-sm text-slate-600">{note.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
