import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCommunityPost } from "@/lib/dataStore";
import { buildCommunityFeed, buildCommunityPostView } from "@/lib/communityFeed";
import { communityPostSchema } from "@/lib/zodSchemas";

export async function GET() {
  const session = await auth();
  const posts = await buildCommunityFeed(session?.user?.id ?? null);
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = communityPostSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const post = await createCommunityPost({
    authorId: session.user.id,
    title: parsed.data.title,
    content: parsed.data.content,
  });

  const view = await buildCommunityPostView(post.id, session.user.id);
  if (!view) {
    return NextResponse.json({ error: "Unable to load post" }, { status: 500 });
  }
  return NextResponse.json({ post: view });
}
