import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canPublishGig } from "@/lib/rbac";
import { gigFormSchema } from "@/lib/zodSchemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function submitGig(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = gigFormSchema.safeParse({
    title: raw.title,
    description: raw.description,
    compensationType: raw.compensationType,
    payoutUsd: raw.payoutUsd ? Number(raw.payoutUsd) : undefined,
    dateStart: raw.dateStart,
    dateEnd: raw.dateEnd || undefined,
    timezone: raw.timezone,
    city: raw.city,
    state: raw.state,
    minAge: raw.minAge ? Number(raw.minAge) : undefined,
    isPublished: raw.isPublished === "true"
  });
  if (!parsed.success) {
    throw new Error("Invalid gig data");
  }

  const profile = await prisma.promoterProfile.findUnique({ where: { userId: session.user.id } });
  const venueProfile = await prisma.venueProfile.findUnique({ where: { userId: session.user.id } });
  const verificationStatus = profile?.verificationStatus ?? venueProfile?.verificationStatus ?? null;

  const canPublish = canPublishGig(session.user.role, verificationStatus);

  const gig = await prisma.gig.create({
    data: {
      createdByUserId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      compensationType: parsed.data.compensationType,
      payoutUsd: parsed.data.payoutUsd ?? null,
      dateStart: parsed.data.dateStart,
      dateEnd: parsed.data.dateEnd ?? null,
      timezone: parsed.data.timezone,
      city: parsed.data.city,
      state: parsed.data.state,
      minAge: parsed.data.minAge ?? null,
      isPublished: canPublish && parsed.data.isPublished === true,
      status: "OPEN"
    }
  });

  revalidatePath("/dashboard");
  redirect(`/gigs/${gig.id}`);
}

export default async function PostGigPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const profile = await prisma.promoterProfile.findUnique({ where: { userId: session.user.id } });
  const venueProfile = await prisma.venueProfile.findUnique({ where: { userId: session.user.id } });
  const verificationStatus = profile?.verificationStatus ?? venueProfile?.verificationStatus ?? null;
  const canPublish = canPublishGig(session.user.role, verificationStatus);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post a new gig</CardTitle>
      </CardHeader>
      <CardContent>
        {!canPublish && (
          <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            Your account is awaiting verification. You can save this gig as a draft but cannot publish
            yet.
          </p>
        )}
        <form action={submitGig} className="space-y-4">
          <Input name="title" placeholder="Gig title" required />
          <Textarea name="description" placeholder="Describe the show" required minLength={20} />
          <div className="grid gap-4 md:grid-cols-2">
            <select name="compensationType" className="rounded-md border border-slate-200 p-2 text-sm" required>
              <option value="FLAT">Flat</option>
              <option value="DOOR_SPLIT">Door split</option>
              <option value="TIPS">Tips</option>
              <option value="UNPAID">Unpaid</option>
            </select>
            <Input name="payoutUsd" type="number" placeholder="Payout in USD" min={0} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="dateStart" type="date" required />
            <Input name="dateEnd" type="date" />
          </div>
          <Input name="timezone" placeholder="Timezone" required />
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="city" placeholder="City" required />
            <Input name="state" placeholder="State" required />
          </div>
          <Input name="minAge" type="number" placeholder="Minimum age" min={0} />
          <div className="flex gap-3">
            <Button type="submit">Save draft</Button>
            {canPublish && (
              <Button type="submit" name="isPublished" value="true" variant="outline">
                Publish now
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
