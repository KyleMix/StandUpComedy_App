import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  COMMUNITY_BOARD_CATEGORIES,
  createCommunityBoardMessage,
  listCommunityBoardMessages,
  getUserById,
  getPromoterProfile,
  getVenueProfile,
  type CommunityBoardMessage
} from "@/lib/dataStore";
import type { CommunityBoardCategory } from "@/types/database";
import { communityBoardMessageSchema } from "@/lib/zodSchemas";

type AuthorProfilePayload =
  | {
      kind: "PROMOTER";
      organization: string;
      contactName: string;
      phone: string | null;
      website: string | null;
      verificationStatus: string;
    }
  | {
      kind: "VENUE";
      venueName: string;
      address1: string;
      city: string;
      state: string;
      contactEmail: string;
      phone: string | null;
      verificationStatus: string;
    };

async function resolveAuthorContext(authorId: string, role: string) {
  const user = await getUserById(authorId);
  let profile: AuthorProfilePayload | null = null;
  if (role === "PROMOTER") {
    const promoter = await getPromoterProfile(authorId);
    if (promoter) {
      profile = {
        kind: "PROMOTER",
        organization: promoter.organization,
        contactName: promoter.contactName,
        phone: promoter.phone,
        website: promoter.website,
        verificationStatus: promoter.verificationStatus,
      };
    }
  } else if (role === "VENUE") {
    const venue = await getVenueProfile(authorId);
    if (venue) {
      profile = {
        kind: "VENUE",
        venueName: venue.venueName,
        address1: venue.address1,
        city: venue.city,
        state: venue.state,
        contactEmail: venue.contactEmail,
        phone: venue.phone,
        verificationStatus: venue.verificationStatus,
      };
    }
  }
  return {
    name: user?.name ?? user?.email ?? "Community member",
    profile,
  };
}

function serializeMessage(
  message: CommunityBoardMessage,
  authorName: string | null,
  authorProfile: AuthorProfilePayload | null
) {
  return {
    ...message,
    authorName,
    authorProfile,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString()
  };
}

async function attachAuthors(messages: CommunityBoardMessage[]) {
  const uniqueAuthors = new Map<string, string>();
  messages.forEach((message) => {
    if (!uniqueAuthors.has(message.authorId)) {
      uniqueAuthors.set(message.authorId, message.authorRole);
    }
  });
  type AuthorContext = Awaited<ReturnType<typeof resolveAuthorContext>>;
  const contextEntries = await Promise.all(
    Array.from(uniqueAuthors.entries()).map(async ([id, role]) => {
      const context = await resolveAuthorContext(id, role);
      return [id, context] as const;
    })
  );
  const contextMap = new Map<string, AuthorContext>(contextEntries);
  return messages.map((message) => {
    const context = contextMap.get(message.authorId);
    return serializeMessage(message, context?.name ?? "Community member", context?.profile ?? null);
  });
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
  const category = parsed.data.category as CommunityBoardCategory;
  if (!allowed.includes(category)) {
    return NextResponse.json({ error: "Category not allowed for your role" }, { status: 400 });
  }

  const message = await createCommunityBoardMessage({
    authorId: session.user.id,
    authorRole: session.user.role,
    content: parsed.data.content,
    category,
    gigTitle: parsed.data.gigTitle ?? null,
    gigAddress: parsed.data.gigAddress ?? null,
    gigCity: parsed.data.gigCity ?? null,
    gigState: parsed.data.gigState ?? null,
    gigContactName: parsed.data.gigContactName ?? null,
    gigContactEmail: parsed.data.gigContactEmail ?? null,
    gigSlotsAvailable: parsed.data.gigSlotsAvailable ?? null
  });

  const context = await resolveAuthorContext(session.user.id, session.user.role);
  return NextResponse.json({
    message: serializeMessage(message, context.name ?? "You", context.profile)
  });
}
