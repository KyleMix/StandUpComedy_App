import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verificationRequestSchema } from "@/lib/zodSchemas";
import { rateLimit } from "@/lib/rateLimit";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const request = await prisma.verificationRequest.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ request });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`verification:${session.user.id}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const data = await request.json();
  const parsed = verificationRequestSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.verificationRequest.create({
    data: {
      userId: session.user.id,
      roleRequested: parsed.data.role,
      message: parsed.data.message,
      documents: parsed.data.documents,
      status: "PENDING"
    }
  });

  return NextResponse.json({ request: created }, { status: 201 });
}
