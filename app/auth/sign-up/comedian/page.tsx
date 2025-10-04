import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/prismaEnums";
import { comedianSignUpSchema } from "@/lib/zodSchemas";

const TRAVEL_RADIUS_OPTIONS = [25, 50, 100, 250, 500] as const;

const signupHighlights = [
  {
    title: "Pitch-ready profile",
    description: "Share your stage name, reel, and home base so promoters know exactly where you shine.",
  },
  {
    title: "Aligned with the workspace",
    description: "Everything you submit here flows straight into the booking pipeline once you sign in.",
  },
  {
    title: "Room to grow",
    description: "Start with the essentials today and layer in press kits, clips, and availability whenever you are ready.",
  },
];

const onboardingSteps = [
  "Submit the essentials below so we can build your workspace skeleton.",
  "Sign in to confirm your email and unlock the comedian dashboard.",
  "Layer on availability, clips, and bookings once you are inside.",
];

function sanitizeOptionalString(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function sanitizeHandle(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const handle = value.startsWith("@") ? value.slice(1) : value;
  const trimmed = handle.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//iu.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

async function registerComedian(formData: FormData) {
  "use server";

  const stageNameValue = formData.get("stageName");
  const legalNameValue = formData.get("legalName");
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  if (
    typeof stageNameValue !== "string" ||
    typeof legalNameValue !== "string" ||
    typeof emailValue !== "string" ||
    typeof passwordValue !== "string"
  ) {
    throw new Error("Invalid registration details");
  }

  const travelRadiusRaw = formData.get("travelRadiusMiles");
  const travelRadiusNumber =
    typeof travelRadiusRaw === "string" && travelRadiusRaw.length > 0
      ? Number.parseInt(travelRadiusRaw, 10)
      : undefined;
  const travelRadiusMiles =
    typeof travelRadiusNumber === "number" && Number.isInteger(travelRadiusNumber) &&
    TRAVEL_RADIUS_OPTIONS.includes(travelRadiusNumber as (typeof TRAVEL_RADIUS_OPTIONS)[number])
      ? travelRadiusNumber
      : undefined;

  const sanitized = {
    stageName: stageNameValue.trim(),
    legalName: legalNameValue.trim(),
    email: emailValue.trim().toLowerCase(),
    password: passwordValue,
    bio: sanitizeOptionalString(formData.get("bio")),
    homeCity: sanitizeOptionalString(formData.get("homeCity")),
    homeState: sanitizeOptionalString(formData.get("homeState"))?.toUpperCase(),
    credits: sanitizeOptionalString(formData.get("credits")),
    travelRadiusMiles,
    website: normalizeUrl(sanitizeOptionalString(formData.get("website"))),
    youtube: normalizeUrl(sanitizeOptionalString(formData.get("youtube"))),
    instagram: sanitizeHandle(sanitizeOptionalString(formData.get("instagram"))),
    tiktok: sanitizeHandle(sanitizeOptionalString(formData.get("tiktok"))),
  };

  const parsed = comedianSignUpSchema.safeParse({
    stageName: sanitized.stageName,
    legalName: sanitized.legalName,
    email: sanitized.email,
    password: sanitized.password,
    bio: sanitized.bio,
    homeCity: sanitized.homeCity,
    homeState: sanitized.homeState,
    travelRadiusMiles: sanitized.travelRadiusMiles,
    website: sanitized.website,
    instagram: sanitized.instagram,
    tiktok: sanitized.tiktok,
    youtube: sanitized.youtube,
    credits: sanitized.credits,
  });

  if (!parsed.success) {
    throw new Error("Invalid registration details");
  }

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const hashedPassword = await hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.legalName,
      email: parsed.data.email,
      hashedPassword,
      role: Role.COMEDIAN,
    },
  });

  await prisma.comedianProfile.create({
    data: {
      userId: user.id,
      stageName: parsed.data.stageName,
      bio: parsed.data.bio,
      credits: parsed.data.credits,
      website: parsed.data.website,
      instagram: parsed.data.instagram,
      tiktokHandle: parsed.data.tiktok,
      youtubeChannel: parsed.data.youtube,
      travelRadiusMiles: parsed.data.travelRadiusMiles ?? null,
      homeCity: parsed.data.homeCity,
      homeState: parsed.data.homeState,
    },
  });

  redirect("/auth/sign-in?from=comedian");
}

export const metadata: Metadata = {
  title: "Join the-funny as a comedian",
  description: "Set up your comedian workspace skeleton with the essentials promoters need to book you.",
};

export default async function ComedianSignUpPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-12 px-4 py-16 sm:px-6 lg:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <section className="space-y-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Comedian onboarding</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Join the-funny roster</h1>
          <p className="max-w-2xl text-base text-slate-600">
            This is the skeleton for comedians. Start with the core details so promoters and venues can book you with
            confidence once you sign in.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {signupHighlights.map((highlight) => (
            <article key={highlight.title} className="space-y-2 rounded-lg border border-slate-200 p-5">
              <h2 className="text-base font-semibold text-slate-900">{highlight.title}</h2>
              <p className="text-sm text-slate-600">{highlight.description}</p>
            </article>
          ))}
        </div>
        <div className="space-y-4 rounded-lg border border-dashed border-slate-200 p-6">
          <h2 className="text-base font-medium text-slate-900">How the skeleton evolves</h2>
          <ol className="space-y-3 text-sm text-slate-600">
            {onboardingSteps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-500">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Card className="lg:sticky lg:top-24 lg:h-fit">
        <CardHeader className="space-y-1">
          <CardTitle>Create your comedian account</CardTitle>
          <p className="text-sm text-slate-600">
            We will send a confirmation link to your email once you submit this form.
          </p>
        </CardHeader>
        <CardContent>
          <form action={registerComedian} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="stageName" className="text-sm font-medium text-slate-700">
                  Stage name
                </label>
                <Input id="stageName" name="stageName" required autoComplete="nickname" />
              </div>
              <div className="space-y-2">
                <label htmlFor="legalName" className="text-sm font-medium text-slate-700">
                  Legal name
                </label>
                <Input id="legalName" name="legalName" required autoComplete="name" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <Input id="email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium text-slate-700">
                Bio (optional)
              </label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell bookers about your voice, credits, and what audiences can expect."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="homeCity" className="text-sm font-medium text-slate-700">
                  Home base city
                </label>
                <Input id="homeCity" name="homeCity" autoComplete="address-level2" />
              </div>
              <div className="space-y-2">
                <label htmlFor="homeState" className="text-sm font-medium text-slate-700">
                  State / province
                </label>
                <Input id="homeState" name="homeState" maxLength={2} placeholder="e.g. NY" autoComplete="address-level1" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="travelRadiusMiles" className="text-sm font-medium text-slate-700">
                  Travel radius (optional)
                </label>
                <select
                  id="travelRadiusMiles"
                  name="travelRadiusMiles"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                  defaultValue=""
                >
                  <option value="">Select how far you will travel</option>
                  {TRAVEL_RADIUS_OPTIONS.map((miles) => (
                    <option key={miles} value={miles}>
                      Up to {miles} miles
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="credits" className="text-sm font-medium text-slate-700">
                  Notable credits (optional)
                </label>
                <Input id="credits" name="credits" placeholder="Festivals, TV spots, podcasts" />
              </div>
              <div className="space-y-2">
                <label htmlFor="website" className="text-sm font-medium text-slate-700">
                  Website (optional)
                </label>
                <Input id="website" name="website" type="url" placeholder="https://" autoComplete="url" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="instagram" className="text-sm font-medium text-slate-700">
                  Instagram (optional)
                </label>
                <Input id="instagram" name="instagram" placeholder="@handle" />
              </div>
              <div className="space-y-2">
                <label htmlFor="tiktok" className="text-sm font-medium text-slate-700">
                  TikTok (optional)
                </label>
                <Input id="tiktok" name="tiktok" placeholder="@handle" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="youtube" className="text-sm font-medium text-slate-700">
                  YouTube or reel link (optional)
                </label>
                <Input id="youtube" name="youtube" type="url" placeholder="https://" />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Create comedian account
            </Button>
          </form>
          <p className="text-center text-sm text-slate-600">
            Already joined the roster?{' '}
            <Link href="/auth/sign-in" className="font-medium text-brand">
              Sign in instead
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
