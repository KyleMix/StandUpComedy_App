import { redirect } from "next/navigation";
import ProfileWorkspace, {
  type BoardMessagePayload,
  type ProfileWorkspaceProps
} from "@/components/profile/ProfileWorkspace";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getUserById,
  listCommunityBoardMessages,
  getPromoterProfile,
  getVenueProfile
} from "@/lib/dataStore";

async function buildBoardMessages(): Promise<BoardMessagePayload[]> {
  const messages = await listCommunityBoardMessages();
  const authorRoles = new Map<string, string>();
  messages.forEach((message) => {
    if (!authorRoles.has(message.authorId)) {
      authorRoles.set(message.authorId, message.authorRole);
    }
  });
  const authorEntries = await Promise.all(
    Array.from(authorRoles.entries()).map(async ([id, role]) => {
      const author = await getUserById(id);
      let profile: BoardMessagePayload["authorProfile"] = null;
      if (role === "PROMOTER") {
        const promoter = await getPromoterProfile(id);
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
        const venue = await getVenueProfile(id);
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
      return [
        id,
        {
          name: author?.name ?? author?.email ?? "Community member",
          profile,
        },
      ] as const;
    })
  );
  const authorMap = new Map(authorEntries);
  return messages.map((message) => ({
    id: message.id,
    authorId: message.authorId,
    authorRole: message.authorRole,
    authorName: authorMap.get(message.authorId)?.name ?? "Community member",
    authorProfile: authorMap.get(message.authorId)?.profile ?? null,
    content: message.content,
    category: message.category,
    isPinned: message.isPinned,
    gigTitle: message.gigTitle,
    gigAddress: message.gigAddress,
    gigCity: message.gigCity,
    gigState: message.gigState,
    gigContactName: message.gigContactName,
    gigContactEmail: message.gigContactEmail,
    gigSlotsAvailable: message.gigSlotsAvailable,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString()
  }));
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { comedian: true, promoter: true, venue: true }
  });

  if (!user) {
    redirect("/");
  }

  const comedianProfile = user.comedian
    ? {
        ...user.comedian,
        styles: Array.isArray(user.comedian.styles) ? user.comedian.styles : [],
        cleanRating: user.comedian.cleanRating ?? "PG13",
        rateMin: user.comedian.rateMin ?? null,
        rateMax: user.comedian.rateMax ?? null,
        reelUrls: Array.isArray(user.comedian.reelUrls) ? user.comedian.reelUrls : [],
        photoUrls: Array.isArray(user.comedian.photoUrls) ? user.comedian.photoUrls : [],
        notableClubs: Array.isArray(user.comedian.notableClubs) ? user.comedian.notableClubs : [],
        availability: Array.isArray(user.comedian.availability)
          ? user.comedian.availability.map((entry) => ({
              ...entry,
              date:
                entry.date instanceof Date
                  ? entry.date.toISOString()
                  : new Date(entry.date).toISOString(),
            }))
          : [],
        createdAt: user.comedian.createdAt.toISOString(),
        updatedAt: user.comedian.updatedAt.toISOString(),
      }
    : null;

  const workspaceUser: ProfileWorkspaceProps["user"] = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    comedian: comedianProfile,
    promoter: user.promoter
      ? {
          ...user.promoter,
          createdAt: user.promoter.createdAt.toISOString(),
          updatedAt: user.promoter.updatedAt.toISOString()
        }
      : null,
    venue: user.venue
      ? {
          ...user.venue,
          createdAt: user.venue.createdAt.toISOString(),
          updatedAt: user.venue.updatedAt.toISOString()
        }
      : null
  };

  const boardMessages = await buildBoardMessages();

  return <ProfileWorkspace user={workspaceUser} boardMessages={boardMessages} />;
}
