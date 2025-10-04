import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { venueProfileFormSchema } from "@/lib/zodSchemas";
import { upsertVenueProfile, updateUser } from "@/lib/dataStore";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "VENUE" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = venueProfileFormSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const updatedUser = await updateUser(session.user.id, { name: data.venueName });
  if (!updatedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const profile = await upsertVenueProfile({
    userId: session.user.id,
    venueName: data.venueName,
    address1: data.address1,
    address2: data.address2 ?? null,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    capacity: data.capacity ?? null,
    contactEmail: data.contactEmail,
    phone: data.phone ?? null
  });

  return NextResponse.json({
    profile,
    user: updatedUser
  });
}
