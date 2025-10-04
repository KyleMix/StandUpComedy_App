import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { communityBoardMessageUpdateSchema } from "@/lib/zodSchemas";
import { updateCommunityBoardMessage, type CommunityBoardMessage } from "@/lib/dataStore";

function serialize(message: CommunityBoardMessage, authorName: string | null) {
  return {
    ...message,
    authorName,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString()
  };
}

function fieldsAllowedForRole(role: string) {
  if (role === "ADMIN") {
    return ["content", "category", "isPinned"] as const;
  }
  if (role === "COMEDIAN") {
    return ["content"] as const;
  }
  if (role === "PROMOTER") {
    return ["isPinned"] as const;
  }
  if (role === "VENUE") {
    return ["category"] as const;
  }
  return [] as const;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!["COMEDIAN", "PROMOTER", "VENUE", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = communityBoardMessageUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const allowedFields = fieldsAllowedForRole(session.user.role);
  const filteredEntries = Object.entries(parsed.data).filter(([key]) => allowedFields.includes(key as any));
  if (filteredEntries.length === 0) {
    return NextResponse.json({ error: "No editable fields for your role" }, { status: 400 });
  }
  const filtered = Object.fromEntries(filteredEntries) as Partial<{ content: string; category: CommunityBoardMessage["category"]; isPinned: boolean }>;

  const updated = await updateCommunityBoardMessage(params.id, session.user.id, filtered);
  if (!updated) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  return NextResponse.json({
    message: serialize(updated, session.user.name ?? session.user.email ?? "You")
  });
}
