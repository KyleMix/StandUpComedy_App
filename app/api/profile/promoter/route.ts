import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { promoterProfileFormSchema } from "@/lib/zodSchemas";
import { upsertPromoterProfile, updateUser } from "@/lib/dataStore";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "PROMOTER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = promoterProfileFormSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const updatedUser = await updateUser(session.user.id, { name: data.contactName });
  if (!updatedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const profile = await upsertPromoterProfile({
    userId: session.user.id,
    organization: data.organization,
    contactName: data.contactName,
    phone: data.phone ?? null,
    website: data.website ?? null
  });

  return NextResponse.json({
    profile,
    user: updatedUser
  });
}
