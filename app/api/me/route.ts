import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { promoter: true, venue: true }
  });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      promoter: user.promoter ? { verificationStatus: user.promoter.verificationStatus } : null,
      venue: user.venue ? { verificationStatus: user.venue.verificationStatus } : null
    }
  });
}
