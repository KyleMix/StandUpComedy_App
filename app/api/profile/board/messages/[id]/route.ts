import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { communityBoardMessageUpdateSchema } from "@/lib/zodSchemas";
import {
  updateCommunityBoardMessage,
  getPromoterProfile,
  getVenueProfile,
  getUserById,
  type CommunityBoardMessage
} from "@/lib/dataStore";

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

function serialize(
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

type EditableMessageField = "content" | "category" | "isPinned";

function fieldsAllowedForRole(role: string): EditableMessageField[] {
  if (role === "ADMIN") {
    return ["content", "category", "isPinned"];
  }
  if (role === "COMEDIAN") {
    return ["content"];
  }
  if (role === "PROMOTER") {
    return ["isPinned"];
  }
  if (role === "VENUE") {
    return ["category"];
  }
  return [];
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
  const filteredEntries = Object.entries(parsed.data).filter(([key]) =>
    allowedFields.includes(key as EditableMessageField)
  );
  if (filteredEntries.length === 0) {
    return NextResponse.json({ error: "No editable fields for your role" }, { status: 400 });
  }
  const filtered = Object.fromEntries(filteredEntries) as Partial<{ content: string; category: CommunityBoardMessage["category"]; isPinned: boolean }>;

  const updated = await updateCommunityBoardMessage(params.id, session.user.id, filtered);
  if (!updated) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const context = await resolveAuthorContext(session.user.id, session.user.role);
  return NextResponse.json({
    message: serialize(updated, context.name ?? "You", context.profile)
  });
}
