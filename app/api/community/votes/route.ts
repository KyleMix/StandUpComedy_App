import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getCommunityPostById,
  getCommunityReplyById,
  setCommunityVote,
} from "@/lib/dataStore";
import {
  buildCommunityPostView,
  buildCommunityReplyView,
} from "@/lib/communityFeed";
import { communityVoteSchema } from "@/lib/zodSchemas";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = communityVoteSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { targetType, targetId, value } = parsed.data;

  if (targetType === "POST") {
    const post = await getCommunityPostById(targetId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    await setCommunityVote({
      userId: session.user.id,
      targetType,
      targetId,
      value,
    });
    const postView = await buildCommunityPostView(targetId, session.user.id);
    if (!postView) {
      return NextResponse.json({ error: "Unable to load post" }, { status: 500 });
    }
    return NextResponse.json({ post: postView });
  }

  const reply = await getCommunityReplyById(targetId);
  if (!reply) {
    return NextResponse.json({ error: "Reply not found" }, { status: 404 });
  }

  await setCommunityVote({
    userId: session.user.id,
    targetType,
    targetId,
    value,
  });

  const replyView = await buildCommunityReplyView(targetId, session.user.id);
  if (!replyView) {
    return NextResponse.json({ error: "Unable to load reply" }, { status: 500 });
  }

  return NextResponse.json({ reply: replyView });
}
