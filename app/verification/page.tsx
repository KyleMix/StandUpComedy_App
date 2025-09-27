import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { verificationRequestSchema } from "@/lib/zodSchemas";

async function submitVerification(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }
  const raw = Object.fromEntries(formData.entries());
  const parsed = verificationRequestSchema.safeParse({
    role: raw.role,
    message: raw.message,
    documents: [
      {
        name: "details.txt",
        url: "local-reference",
        size: raw.message ? String(raw.message).length : 0
      }
    ]
  });
  if (!parsed.success) {
    throw new Error("Invalid verification request");
  }
  await prisma.verificationRequest.create({
    data: {
      userId: session.user.id,
      roleRequested: parsed.data.role,
      message: parsed.data.message,
      documents: parsed.data.documents,
      status: "PENDING"
    }
  });
  redirect("/dashboard");
}

export default async function VerificationPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Submit verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Provide context for your venue or promoter organization. An admin will review your request.
        </p>
        <form action={submitVerification} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Role to verify</label>
            <select name="role" className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm">
              <option value="PROMOTER">Promoter</option>
              <option value="VENUE">Venue</option>
            </select>
          </div>
          <Textarea name="message" placeholder="Share details about your organization" required minLength={20} />
          <Button type="submit">Submit</Button>
        </form>
      </CardContent>
    </Card>
  );
}
