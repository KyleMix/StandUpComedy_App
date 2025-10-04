import { redirect } from "next/navigation";
import ProfileWorkspace, {
  type BoardMessagePayload,
  type ProfileWorkspaceProps
} from "@/components/profile/ProfileWorkspace";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserById, listCommunityBoardMessages } from "@/lib/dataStore";

async function buildBoardMessages(): Promise<BoardMessagePayload[]> {
  const messages = await listCommunityBoardMessages();
  const authorIds = Array.from(new Set(messages.map((message) => message.authorId)));
  const authorEntries = await Promise.all(
    authorIds.map(async (id) => {
      const author = await getUserById(id);
      return [id, author?.name ?? author?.email ?? "Community member"] as const;
    })
  );
  const authorMap = new Map(authorEntries);
  return messages.map((message) => ({
    id: message.id,
    authorId: message.authorId,
    authorRole: message.authorRole,
    authorName: authorMap.get(message.authorId) ?? "Community member",
    content: message.content,
    category: message.category,
    isPinned: message.isPinned,
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

  const workspaceUser: ProfileWorkspaceProps["user"] = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    comedian: user.comedian
      ? {
          ...user.comedian,
          createdAt: user.comedian.createdAt.toISOString(),
          updatedAt: user.comedian.updatedAt.toISOString()
        }
      : null,
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
