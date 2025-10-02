import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canPublishGig } from "@/lib/rbac";
import { gigFormSchema } from "@/lib/zodSchemas";
import { rateLimit } from "@/lib/rateLimit";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`gig:update:${session.user.id}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const gig = await prisma.gig.findUnique({ where: { id: params.id } });
  if (!gig || gig.createdByUserId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = await request.json();
  const parsed = gigFormSchema.partial().safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (typeof parsed.data.isPublished === "boolean" && parsed.data.isPublished === true) {
    const profile = await prisma.promoterProfile.findUnique({ where: { userId: session.user.id } });
    const venueProfile = await prisma.venueProfile.findUnique({ where: { userId: session.user.id } });
    const verificationStatus = profile?.verificationStatus ?? venueProfile?.verificationStatus ?? null;
    if (!canPublishGig(session.user.role, verificationStatus)) {
      return NextResponse.json({ error: "Verification required" }, { status: 403 });
    }
  }

  const updated = await prisma.gig.update({
    where: { id: params.id },
    data: parsed.data
  });
  return NextResponse.json({ gig: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`gig:delete:${session.user.id}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const gig = await prisma.gig.findUnique({ where: { id: params.id } });
  if (!gig || gig.createdByUserId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.gig.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
