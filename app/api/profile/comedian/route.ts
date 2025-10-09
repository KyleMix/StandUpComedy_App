import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { comedianProfileFormSchema } from "@/lib/zodSchemas";
import { createComedianProfile, updateUser } from "@/lib/dataStore";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "COMEDIAN" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = comedianProfileFormSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const updatedUser = await updateUser(session.user.id, { name: data.legalName });
  if (!updatedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const profile = await createComedianProfile({
    userId: session.user.id,
    stageName: data.stageName,
    bio: data.bio ?? null,
    credits: data.credits ?? null,
    website: data.website ?? null,
    reelUrl: data.reelUrl ?? null,
    instagram: data.instagram ?? null,
    tiktokHandle: data.tiktokHandle ?? null,
    youtubeChannel: data.youtubeChannel ?? null,
    travelRadiusMiles: data.travelRadiusMiles ?? null,
    homeCity: data.homeCity ?? null,
    homeState: data.homeState ?? null,
    styles: data.styles,
    cleanRating: data.cleanRating,
    rateMin: data.rateMin ?? null,
    rateMax: data.rateMax ?? null,
    reelUrls: data.reelUrls,
    photoUrls: data.photoUrls,
    notableClubs: data.notableClubs,
    availability: data.availability,
  });

  return NextResponse.json({
    profile,
    user: updatedUser
  });
}
