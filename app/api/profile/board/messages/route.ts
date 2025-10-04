import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  COMMUNITY_BOARD_CATEGORIES,
  createCommunityBoardMessage,
  listCommunityBoardMessages,
  getUserById,
  type CommunityBoardMessage
} from "@/lib/dataStore";
import type { CommunityBoardCategory } from "@/types/database";
import { communityBoardMessageSchema } from "@/lib/zodSchemas";

function serializeMessage(message: CommunityBoardMessage, authorName: string | null) {
  return {
    ...message,
    authorName,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString()
  };
}

async function attachAuthors(messages: CommunityBoardMessage[]) {
  const uniqueIds = Array.from(new Set(messages.map((item) => item.authorId)));
  const authorEntries = await Promise.all(
    uniqueIds.map(async (id) => {
      const user = await getUserById(id);
      return [id, user?.name ?? user?.email ?? "Community member"] as const;
    })
  );
  const authorMap = new Map(authorEntries);
  return messages.map((message) => serializeMessage(message, authorMap.get(message.authorId) ?? "Community member"));
}

function allowedCategoriesForRole(role: string): CommunityBoardCategory[] {
  switch (role) {
    case "COMEDIAN":
      return ["ASK", "ANNOUNCEMENT"] as CommunityBoardCategory[];
    case "PROMOTER":
      return ["OFFER", "ANNOUNCEMENT"] as CommunityBoardCategory[];
    case "VENUE":
      return ["OFFER", "ANNOUNCEMENT"] as CommunityBoardCategory[];
    default:
      return COMMUNITY_BOARD_CATEGORIES;
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await listCommunityBoardMessages();
  const payload = await attachAuthors(messages);
  return NextResponse.json({ messages: payload });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!["COMEDIAN", "PROMOTER", "VENUE", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = communityBoardMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const allowed = allowedCategoriesForRole(session.user.role);
  if (!allowed.includes(parsed.data.category)) {
    return NextResponse.json({ error: "Category not allowed for your role" }, { status: 400 });
  }

  const message = await createCommunityBoardMessage({
    authorId: session.user.id,
    authorRole: session.user.role,
    content: parsed.data.content,
    category: parsed.data.category
  });

  return NextResponse.json({
    message: serializeMessage(message, session.user.name ?? session.user.email ?? "You")
  });
}
