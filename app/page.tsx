import Link from "next/link";
import { ArrowRight, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function LandingPage() {
  return (
    <section className="space-y-12">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">Find the next big laugh.</h1>
          <p className="text-lg text-slate-600">
            the-funny helps comedians land paid opportunities, gives promoters and venues a verified
            workflow to post shows, and lets fans discover comedy without the noise.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/gigs">
                Browse gigs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/sign-up">Create an account</Link>
            </Button>
          </div>
        </div>
        <Card className="self-start border-brand/20 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-brand">
              <Star className="h-5 w-5" /> Verified promoters & venues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>Submit documentation once and get access to publish gigs instantly when approved.</p>
            <p>
              the-funny keeps your materials secure and notifies comedians as soon as you post a new
              opportunity.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((role) => (
          <Card key={role.title} className="flex flex-col justify-between border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>{role.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>{role.description}</p>
              <Button asChild variant="outline" className="self-start">
                <Link href={role.href}>
                  Get started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-slate-300 bg-slate-100/60">
        <CardContent className="flex flex-col items-center justify-between gap-4 py-6 text-center md:flex-row">
          <div className="flex items-center gap-3 text-slate-700">
            <Users className="h-8 w-8 text-brand" />
            <div>
              <h2 className="text-xl font-semibold">Ready to extend</h2>
              <p className="text-sm">Add maps, ticketing, and deeper analytics when you need them.</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
