import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicationSchema } from "@/lib/zodSchemas";
import { canApplyToGig } from "@/lib/rbac";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canApplyToGig(session.user.role)) {
    return NextResponse.json({ error: "Only comedians can apply" }, { status: 403 });
  }

  if (!rateLimit(`application:create:${session.user.id}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const data = await request.json();
  const parsed = applicationSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const gig = await prisma.gig.findUnique({ where: { id: parsed.data.gigId } });
  if (!gig || !gig.isPublished) {
    return NextResponse.json({ error: "Gig unavailable" }, { status: 404 });
  }

  const application = await prisma.application.create({
    data: {
      gigId: parsed.data.gigId,
      comedianUserId: session.user.id,
      message: parsed.data.message,
      status: "SUBMITTED"
    }
  });

  return NextResponse.json({ application }, { status: 201 });
}
