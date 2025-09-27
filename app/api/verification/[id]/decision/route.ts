import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verificationDecisionSchema } from "@/lib/zodSchemas";
import { mailTemplates, sendMail } from "@/lib/mailer";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await request.json();
  const parsed = verificationDecisionSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.verificationRequest.findUnique({
    where: { id: params.id },
    include: { user: { include: { promoter: true, venue: true } } }
  });

  if (!existing) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const verification = await prisma.verificationRequest.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      reviewedBy: session.user.id
    }
  });

  if (existing.user.promoter && parsed.data.status !== existing.user.promoter.verificationStatus) {
    await prisma.promoterProfile.update({
      where: { userId: existing.userId },
      data: { verificationStatus: parsed.data.status }
    });
  }

  if (existing.user.venue && parsed.data.status !== existing.user.venue.verificationStatus) {
    await prisma.venueProfile.update({
      where: { userId: existing.userId },
      data: { verificationStatus: parsed.data.status }
    });
  }

  if (existing.user.email) {
    const template = mailTemplates.verificationDecision(existing.user.name ?? "there", parsed.data.status);
    await sendMail({ to: existing.user.email, ...template });
  }

  return NextResponse.json({ request: verification });
}
