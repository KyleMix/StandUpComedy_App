import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { Icon } from "@/components/ui/Icon";

const roles = [
  {
    title: "Comedian",
    description: "Discover gigs curated for your style and apply in a few clicks.",
    href: "/auth/sign-up?role=COMEDIAN"
  },
  {
    title: "Promoter",
    description: "Post paid gigs and manage applicants once you are verified.",
    href: "/auth/sign-up?role=PROMOTER"
  },
  {
    title: "Venue",
    description: "Showcase your rooms, publish shows, and keep talent booked.",
    href: "/auth/sign-up?role=VENUE"
  },
  {
    title: "Fan",
    description: "Save upcoming shows and follow your favorite comedians.",
    href: "/auth/sign-up?role=FAN"
  }
];

const testimonialHighlights = [
  {
    title: "Verified community",
    description: "Identity checks for promoters and venues keep comedians safe and informed.",
    icon: "ShieldCheck" as const
  },
  {
    title: "Effortless booking",
    description: "Centralized calendars, reminders, and contracts make coordination painless.",
    icon: "CalendarCheck" as const
  },
  {
    title: "Audience ready",
    description: "Fans follow their favorites, reserve seats, and spread the word for you.",
    icon: "Megaphone" as const
  }
];

const workflow = [
  {
    title: "Share your vibe",
    description: "Set your availability, drop a reel, and let the algorithm surface perfect matches.",
    icon: "Mic2" as const
  },
  {
    title: "Collaborate in one place",
    description: "Chat, review offers, and confirm logistics without digging through inboxes.",
    icon: "Sparkles" as const
  },
  {
    title: "Showtime insights",
    description: "Post-show dashboards reveal audience feedback, payouts, and future leads.",
    icon: "Ticket" as const
  }
];

const stats = [
  { label: "Active comedians", value: "2.5k+" },
  { label: "Verified hosts", value: "600+" },
  { label: "Monthly gigs", value: "1,200" }
];

const heroHighlights = [
  { label: "Verified promoters", icon: "ShieldCheck" as const },
  { label: "Map-based search", icon: "Map" as const },
  { label: "Community chat", icon: "ChatsCircle" as const, set: "phosphor" as const }
];

export default function LandingPage() {
  return (
    <section className="space-y-16 pb-12">
      <div className="relative overflow-hidden rounded-4xl border border-white/40 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        <HeroBackground pattern="topography" />
        <div className="grid gap-12 p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-16">
          <div className="space-y-9">
            <div className="space-y-3">
              <Badge className="bg-brand/10 text-brand">All-in-one comedy network</Badge>
              <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl md:text-6xl">
                Where comedy careers grow together.
              </h1>
              <p className="max-w-xl text-lg text-slate-600">
                the-funny connects comedians, promoters, venues, and fans with a shared workflow that keeps every show on track from first pitch to encore.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="gap-2 text-base">
                <Link href="/gigs">
                  Browse gigs <Icon name="ArrowRight" className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-brand/30 text-base text-brand">
                <Link href="/auth/sign-up">Create an account</Link>
              </Button>
              <p className="text-sm text-slate-500">
                Free to join • Personalized matches • Trusted by industry leaders
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              {heroHighlights.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-slate-700 shadow-sm">
                  <Icon name={item.icon} set={item.set ?? "lucide"} className="h-4 w-4 text-brand" />
                  {item.label}
                </span>
              ))}
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/60 bg-white/90 p-4 shadow-sm">
                  <p className="text-2xl font-semibold text-brand">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/60 shadow-xl">
              <Image
                src="/assets/hero/stage-lights.svg"
                alt="Stylized spotlights shining on a comedy stage"
                width={1200}
                height={900}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-8 text-slate-100 shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]" />
              <div className="relative space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs uppercase tracking-wide">
                  <Icon name="Star" set="phosphor" className="h-3.5 w-3.5 text-amber-200" /> Trusted talent pipeline
                </div>
                <p className="text-2xl font-semibold leading-snug">
                  “the-funny handles everything from discovery to payout so I can focus on the set.”
                </p>
                <div className="space-y-1 text-sm text-slate-200">
                  <p>Ally Rivera</p>
                  <p className="text-xs text-slate-300">Promoter @ Skyline Rooms</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {testimonialHighlights.map((feature) => (
                    <div key={feature.title} className="rounded-2xl border border-white/20 bg-white/10 p-4">
                      <Icon name={feature.icon} className="mb-3 h-6 w-6 text-amber-200" />
                      <p className="text-sm font-semibold">{feature.title}</p>
                      <p className="mt-1 text-xs text-slate-200/80">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((role) => (
          <Card
            key={role.title}
            className="flex flex-col justify-between border-transparent bg-white/90 shadow-lg shadow-slate-900/5 transition hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xl">
                {role.title}
                <Icon name="ArrowRight" className="h-5 w-5 text-brand/60" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm text-slate-600">
              <p>{role.description}</p>
              <Button asChild variant="outline" className="self-start border-brand/40 text-brand">
                <Link href={role.href}>Get started</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="border-transparent bg-white/90 shadow-lg shadow-slate-900/5">
          <CardHeader className="space-y-2">
            <Badge variant="outline" className="w-fit border-brand/30 text-brand">
              How it works
            </Badge>
            <CardTitle className="text-2xl text-slate-900">Simple workflow from inquiry to encore</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {workflow.map((step, index) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-brand">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Icon name={step.icon} className="h-4 w-4 text-brand" /> {step.title}
                  </p>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-transparent bg-gradient-to-br from-white/95 via-white/80 to-white/60 shadow-lg shadow-slate-900/5">
          <CardContent className="flex h-full flex-col justify-between space-y-6">
            <div className="space-y-3">
              <Badge variant="outline" className="w-fit border-amber-300/50 bg-amber-50 text-amber-700">
                Spotlight
              </Badge>
              <p className="text-lg font-semibold text-slate-900">
                “Our rooms stay booked weeks ahead because comedians trust the-funny’s verification and fans love the smooth ticketing experience.”
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Icon name="Users" className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Marquee Collective</p>
                <p className="text-xs text-slate-500">Venue network partner</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-brand/20 bg-white/90 shadow-xl shadow-slate-900/10">
        <CardContent className="flex flex-col items-center justify-between gap-6 py-8 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-4 text-slate-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Icon name="Users" className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-slate-900">Ready to take the mic?</h2>
              <p className="text-sm text-slate-600">
                Add maps, ticketing, payouts, and deeper analytics whenever you are ready to level up.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
            <Button asChild variant="outline" className="border-brand/40 text-brand">
              <Link href="/post-gig">Post a gig</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
