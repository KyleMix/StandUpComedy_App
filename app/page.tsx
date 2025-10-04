import { auth } from "@/lib/auth";
import Link from "next/link";

interface Highlight {
  title: string;
  description: string;
}

interface SignedInSection extends Highlight {
  items: string[];
}

const guestHighlights: Highlight[] = [
  {
    title: "Shared show pipeline",
    description:
      "Keep booking details, running orders, and contacts together so the team understands what is locked and what still needs work.",
  },
  {
    title: "Role-aware workspace",
    description:
      "Producers, comics, and venue partners get a single source of truth without wading through abandoned docs or threads.",
  },
  {
    title: "Add layers intentionally",
    description:
      "Start with the skeleton today. Layer in budgets, marketing assets, and feedback flows once the base rhythm feels right.",
  },
];

const guestSteps: string[] = [
  "Sign in to unlock the collaborative workspace.",
  "Outline your upcoming shows and invite co-producers when you are ready.",
  "Iterate on tasks, assets, and analytics as you grow the operation.",
];

const guestWorkspaceSections: Highlight[] = [
  {
    title: "Plan shows together",
    description:
      "Collect details about rooms, lineups, and schedules in one shared workspace so everyone knows what happens next.",
  },
  {
    title: "Keep responsibilities clear",
    description:
      "Outline who is booking, who is promoting, and what each night requires without getting lost in extra features.",
  },
  {
    title: "Grow when you are ready",
    description:
      "This foundation keeps the essentials in view. Add the pieces you need later without rebuilding from scratch.",
  },
];

const signedInSections: SignedInSection[] = [
  {
    title: "This week at a glance",
    description:
      "Review the shows you have committed to, the talent that still needs confirmation, and the rooms waiting on tech notes.",
    items: [
      "Confirm host and closer assignments for each night.",
      "Share updated run-of-show with venues 48 hours out.",
      "Highlight promo pushes that need social assets today.",
    ],
  },
  {
    title: "Strengthen the lineup",
    description:
      "Track submissions, auditions, and drop-in requests so you can quickly fill gaps without double-booking comics.",
    items: [
      "Tag new submissions with tone, credits, and availability.",
      "Log audience feedback to inform future booking decisions.",
      "Surface rising talent to share with partners and hosts.",
    ],
  },
  {
    title: "Promote with intent",
    description:
      "Coordinate design, copy, and channel assignments to keep every show visible without burning out the team.",
    items: [
      "Lock artwork requests and deliverables in one place.",
      "Schedule newsletter and paid boosts from the same view.",
      "Capture post-show metrics so you can iterate next week.",
    ],
  },
];

const followUpCheckpoints: Highlight[] = [
  {
    title: "Tighten coordination",
    description:
      "Log your weekly stand-up, share blockers, and flag resource needs so everyone leaves the meeting with the same priorities.",
  },
  {
    title: "Invite collaborators",
    description:
      "Producers, photographers, and venue partners can join the workspace to update their deliverables without chasing messages.",
  },
  {
    title: "Document your playbook",
    description:
      "Turn the workflows you repeat every week into checklists, forms, and templates ready for the next show run.",
  },
];

export default async function LandingPage() {
  const session = await auth();

  if (!session) {
    return <GuestLanding />;
  }

  return <SignedInLanding name={session.user.name ?? session.user.email} />;
}

function GuestLanding() {
  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Workspace access required</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Plan every standup night together</h1>
        <p className="max-w-2xl text-base text-slate-600">
          This is the skeleton of the-funny workspace. Sign in to start from the essentials—lineups, venues, and promo cadences—before layering on deeper tooling.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/auth/sign-in"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Sign in to continue
          </Link>
          <Link
            href="/auth/sign-up/comedian"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Need an account?
          </Link>
        </div>
      </section>

      <section className="grid gap-8 sm:grid-cols-2">
        {guestHighlights.map((section) => (
          <article key={section.title} className="space-y-3 rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-900">{section.title}</h2>
            <p className="text-sm text-slate-600">{section.description}</p>
          </article>
        ))}
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Skeleton</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">the-funny workspace</h2>
          <p className="max-w-2xl text-base text-slate-600">
            A clean outline for connecting comedians, promoters, and venues. Start here, agree on the essentials, and layer in more when the structure feels right.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          {guestWorkspaceSections.map((section) => (
            <article key={section.title} className="space-y-3 rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-medium text-slate-900">{section.title}</h3>
              <p className="text-sm text-slate-600">{section.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-dashed border-slate-200 p-6">
        <h2 className="text-base font-medium text-slate-900">How the skeleton comes to life</h2>
        <ol className="space-y-3 text-sm text-slate-600">
          {guestSteps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-500">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function SignedInLanding({ name }: { name: string }) {
  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Welcome back</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your standup command center</h1>
        <p className="max-w-3xl text-base text-slate-600">
          Hey {name}, the skeleton is ready for new muscle. Use these quick-start lanes to keep bookings, show logistics, and promo momentum moving in sync without adding noise.
        </p>
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Jump into the workspace
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {signedInSections.map((section) => (
          <article key={section.title} className="flex flex-col gap-4 rounded-lg border border-slate-200 p-6">
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-slate-900">{section.title}</h2>
              <p className="text-sm text-slate-600">{section.description}</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full bg-slate-400" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="space-y-6 rounded-lg border border-dashed border-slate-200 p-6">
        <h2 className="text-base font-medium text-slate-900">What to layer on next</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {followUpCheckpoints.map((checkpoint) => (
            <article key={checkpoint.title} className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">{checkpoint.title}</h3>
              <p className="text-sm text-slate-600">{checkpoint.description}</p>
            </article>
          ))}
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Keep iterating—add tooling only when it elevates the show.
        </p>
      </section>
    </div>
  );
}
