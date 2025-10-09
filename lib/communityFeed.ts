import {
  listCommunityPosts,
  listCommunityReplies,
  listCommunityVotes,
  listUsers,
  type CommunityPost,
  type CommunityReply,
  type CommunityVote,
  type User,
} from "@/lib/dataStore";
import type { Role } from "@/lib/prismaEnums";
import type { CommunityVoteTarget } from "@/types/database";

export interface CommunityReplyView {
  id: string;
  postId: string;
  authorId: string;
  authorRole: Role;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  score: number;
  userVote: -1 | 0 | 1;
}

export interface CommunityPostView {
  id: string;
  authorId: string;
  authorRole: Role;
  authorName: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  score: number;
  userVote: -1 | 0 | 1;
  replyCount: number;
  replies: CommunityReplyView[];
}

interface CommunityContext {
  posts: CommunityPost[];
  replies: CommunityReply[];
  votes: CommunityVote[];
  users: Map<string, User>;
  voteTotals: Map<string, number>;
  currentUserVotes: Map<string, -1 | 1>;
  currentUserId: string | null;
}

function voteKey(targetType: CommunityVoteTarget, targetId: string) {
  return `${targetType}:${targetId}`;
}

function getDisplayName(user: User | undefined | null) {
  if (!user) return "Community member";
  return user.name ?? user.email ?? "Community member";
}

function resolveRole(user: User | undefined | null): Role {
  if (user?.role) {
    return user.role;
  }
  return "FAN";
}

async function buildCommunityContext(currentUserId?: string | null): Promise<CommunityContext> {
  const [posts, replies, votes, users] = await Promise.all([
    listCommunityPosts(),
    listCommunityReplies(),
    listCommunityVotes(),
    listUsers(),
  ]);

  const userMap = new Map(users.map((user) => [user.id, user] as const));

  const totals = new Map<string, number>();
  for (const vote of votes) {
    const key = voteKey(vote.targetType, vote.targetId);
    totals.set(key, (totals.get(key) ?? 0) + vote.value);
  }

  const currentVotes = new Map<string, -1 | 1>();
  const normalizedUserId = currentUserId ?? null;
  if (normalizedUserId) {
    for (const vote of votes) {
      if (vote.userId === normalizedUserId) {
        currentVotes.set(voteKey(vote.targetType, vote.targetId), vote.value);
      }
    }
  }

  return {
    posts,
    replies,
    votes,
    users: userMap,
    voteTotals: totals,
    currentUserVotes: currentVotes,
    currentUserId: normalizedUserId,
  };
}

function resolveUserVote(
  context: CommunityContext,
  targetType: CommunityVoteTarget,
  targetId: string
): -1 | 0 | 1 {
  if (!context.currentUserId) {
    return 0;
  }
  return context.currentUserVotes.get(voteKey(targetType, targetId)) ?? 0;
}

function resolveScore(
  context: CommunityContext,
  targetType: CommunityVoteTarget,
  targetId: string
) {
  return context.voteTotals.get(voteKey(targetType, targetId)) ?? 0;
}

function serializeReply(reply: CommunityReply, context: CommunityContext): CommunityReplyView {
  const author = context.users.get(reply.authorId);
  return {
    id: reply.id,
    postId: reply.postId,
    authorId: reply.authorId,
    authorRole: resolveRole(author),
    authorName: getDisplayName(author),
    content: reply.content,
    createdAt: reply.createdAt.toISOString(),
    updatedAt: reply.updatedAt.toISOString(),
    score: resolveScore(context, "REPLY", reply.id),
    userVote: resolveUserVote(context, "REPLY", reply.id),
  };
}

function serializePost(post: CommunityPost, context: CommunityContext): CommunityPostView {
  const author = context.users.get(post.authorId);
  const replies = context.replies
    .filter((reply) => reply.postId === post.id)
    .map((reply) => serializeReply(reply, context));

  return {
    id: post.id,
    authorId: post.authorId,
    authorRole: resolveRole(author),
    authorName: getDisplayName(author),
    title: post.title,
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    score: resolveScore(context, "POST", post.id),
    userVote: resolveUserVote(context, "POST", post.id),
    replyCount: replies.length,
    replies,
  };
}

export async function buildCommunityFeed(
  currentUserId?: string | null
): Promise<CommunityPostView[]> {
  const context = await buildCommunityContext(currentUserId);
  return context.posts
    .map((post) => serializePost(post, context))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export async function buildCommunityPostView(
  postId: string,
  currentUserId?: string | null
): Promise<CommunityPostView | null> {
  const context = await buildCommunityContext(currentUserId);
  const post = context.posts.find((item) => item.id === postId);
  if (!post) return null;
  return serializePost(post, context);
}

export async function buildCommunityReplyView(
  replyId: string,
  currentUserId?: string | null
): Promise<CommunityReplyView | null> {
  const context = await buildCommunityContext(currentUserId);
  const reply = context.replies.find((item) => item.id === replyId);
  if (!reply) return null;
  return serializeReply(reply, context);
}
