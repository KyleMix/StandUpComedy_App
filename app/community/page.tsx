import CommunityBoard from "@/components/community/CommunityBoard";
import { auth } from "@/lib/auth";
import { buildCommunityFeed } from "@/lib/communityFeed";
import type { Role } from "@/lib/prismaEnums";

function resolveDisplayName(user: { name?: string | null; email?: string | null }) {
  return user.name ?? user.email ?? "You";
}

export default async function CommunityPage() {
  const session = await auth();
  const posts = await buildCommunityFeed(session?.user?.id ?? null);

  const currentUser = session?.user
    ? {
        id: session.user.id,
        name: resolveDisplayName(session.user),
        role: session.user.role as Role,
      }
    : null;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Community Message Board</h1>
        <p className="text-base-content/80">
          Trade booking leads, request feedback, and cheer on other performers. Share a post or upvote your
          favorite replies to grow the funniest network on the internet.
        </p>
      </header>
      <CommunityBoard currentUser={currentUser} initialPosts={posts} />
    </div>
  );
}
