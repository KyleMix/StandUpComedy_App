import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateUser } from "@/lib/dataStore";
import { profileAvatarSchema } from "@/lib/zodSchemas";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    payload = {};
  }

  const rawAvatar =
    typeof (payload as { avatar?: unknown }).avatar === "string"
      ? ((payload as { avatar?: string }).avatar ?? "").trim()
      : (payload as { avatar?: unknown }).avatar === null
        ? null
        : undefined;

  const normalized = {
    avatar:
      typeof rawAvatar === "string"
        ? rawAvatar.length > 0
          ? rawAvatar
          : null
        : rawAvatar === null
          ? null
          : undefined,
  } as { avatar?: string | null };

  const parsed = profileAvatarSchema.safeParse(normalized);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const avatarValue = parsed.data.avatar ?? null;
  const user = await updateUser(session.user.id, { avatarUrl: avatarValue });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
