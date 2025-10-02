import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicationStatusSchema } from "@/lib/zodSchemas";
import { rateLimit } from "@/lib/rateLimit";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`application:update:${session.user.id}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: { gig: true }
  });
  if (!application || !application.gig || application.gig.createdByUserId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = await request.json();
  const parsed = applicationStatusSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.application.update({
    where: { id: params.id },
    data: { status: parsed.data.status }
  });

  return NextResponse.json({ application: updated });
}
