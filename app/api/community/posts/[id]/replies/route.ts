import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createCommunityReply,
  getCommunityPostById,
} from "@/lib/dataStore";
import {
  buildCommunityPostView,
  buildCommunityReplyView,
} from "@/lib/communityFeed";
import { communityReplySchema } from "@/lib/zodSchemas";

interface RouteParams {
  params: { id: string };
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const postId = params.id;
  const post = await getCommunityPostById(postId);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const payload = await request.json();
  const parsed = communityReplySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const reply = await createCommunityReply({
    postId,
    authorId: session.user.id,
    content: parsed.data.content,
  });

  if (!reply) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const replyView = await buildCommunityReplyView(reply.id, session.user.id);
  const postView = await buildCommunityPostView(postId, session.user.id);

  if (!replyView || !postView) {
    return NextResponse.json({ error: "Unable to load reply" }, { status: 500 });
  }

  return NextResponse.json({ reply: replyView, post: postView });
}
