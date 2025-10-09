"use client";

import { FormEvent, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import type { Role } from "@/lib/prismaEnums";
import type {
  CommunityPostView,
  CommunityReplyView,
} from "@/lib/communityFeed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CommunityBoardProps {
  currentUser: { id: string; name: string; role: Role } | null;
  initialPosts: CommunityPostView[];
}

type VoteDirection = 1 | -1;

interface BannerState {
  type: "success" | "error";
  message: string;
}

function sortPosts(posts: CommunityPostView[]): CommunityPostView[] {
  return [...posts].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function formatRole(role: Role) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function formatTimestamp(timestamp: string) {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

function makeVoteKey(targetType: "POST" | "REPLY", targetId: string) {
  return `${targetType}:${targetId}`;
}

export default function CommunityBoard({ currentUser, initialPosts }: CommunityBoardProps) {
  const [posts, setPosts] = useState(() => sortPosts(initialPosts));
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyErrors, setReplyErrors] = useState<Record<string, string | null>>({});
  const [submittingReplyFor, setSubmittingReplyFor] = useState<string | null>(null);
  const [pendingVotes, setPendingVotes] = useState<Set<string>>(new Set());

  const isAuthenticated = Boolean(currentUser);

  const postCount = useMemo(() => posts.length, [posts]);

  function handleReplyChange(postId: string, value: string) {
    setReplyDrafts((prev) => ({ ...prev, [postId]: value }));
  }

  function updatePostState(updated: CommunityPostView) {
    setPosts((prev) => sortPosts(prev.map((post) => (post.id === updated.id ? updated : post))));
  }

  function replaceReplyInPost(updatedReply: CommunityReplyView) {
    setPosts((prev) =>
      sortPosts(
        prev.map((post) => {
          if (post.id !== updatedReply.postId) {
            return post;
          }
          const updatedReplies = post.replies.map((reply) =>
            reply.id === updatedReply.id ? updatedReply : reply
          );
          return { ...post, replies: updatedReplies };
        })
      )
    );
  }

  function addReplyToPost(updatedPost: CommunityPostView) {
    setPosts((prev) =>
      sortPosts(prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)))
    );
  }

  function addPendingVote(key: string) {
    setPendingVotes((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }

  function removePendingVote(key: string) {
    setPendingVotes((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }

  async function handleCreatePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBanner(null);
    setPostError(null);

    if (!currentUser) {
      setPostError("Sign in to share a post with the community.");
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      setPostError("Add a title and message before posting.");
      return;
    }

    setIsSubmittingPost(true);
    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle, content: trimmedContent }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.error?.formErrors?.join(" ") ?? payload?.error ?? "Unable to publish your post.";
        setPostError(typeof message === "string" ? message : "Unable to publish your post.");
        return;
      }

      const data = (await response.json()) as { post?: CommunityPostView };
      if (data.post) {
        const newPost = data.post;
        setPosts((prev) => sortPosts([newPost, ...prev.filter((post) => post.id !== newPost.id)]));
        setTitle("");
        setContent("");
        setBanner({ type: "success", message: "Post shared with the community." });
      }
    } catch (error) {
      setPostError("Something went wrong while publishing your post.");
    } finally {
      setIsSubmittingPost(false);
    }
  }

  async function handleCreateReply(event: FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault();
    setBanner(null);
    setReplyErrors((prev) => ({ ...prev, [postId]: null }));

    if (!currentUser) {
      setReplyErrors((prev) => ({ ...prev, [postId]: "Sign in to reply." }));
      return;
    }

    const draft = (replyDrafts[postId] ?? "").trim();
    if (!draft) {
      setReplyErrors((prev) => ({ ...prev, [postId]: "Write a reply before sending." }));
      return;
    }

    setSubmittingReplyFor(postId);
    try {
      const response = await fetch(`/api/community/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.error?.formErrors?.join(" ") ?? payload?.error ?? "Unable to send your reply.";
        setReplyErrors((prev) => ({
          ...prev,
          [postId]: typeof message === "string" ? message : "Unable to send your reply.",
        }));
        return;
      }

      const data = (await response.json()) as {
        post?: CommunityPostView;
        reply?: CommunityReplyView;
      };

      if (data.post) {
        addReplyToPost(data.post);
      }
      setReplyDrafts((prev) => ({ ...prev, [postId]: "" }));
      setBanner({ type: "success", message: "Reply posted." });
    } catch (error) {
      setReplyErrors((prev) => ({ ...prev, [postId]: "Something went wrong while sending your reply." }));
    } finally {
      setSubmittingReplyFor(null);
    }
  }

  async function handleVote(
    targetType: "POST" | "REPLY",
    targetId: string,
    desiredDirection: VoteDirection,
    currentVote: -1 | 0 | 1
  ) {
    if (!currentUser) {
      setBanner({ type: "error", message: "Sign in to cast votes." });
      return;
    }

    const nextValue = currentVote === desiredDirection ? 0 : desiredDirection;
    const voteKey = makeVoteKey(targetType, targetId);

    if (pendingVotes.has(voteKey)) {
      return;
    }

    addPendingVote(voteKey);
    setBanner(null);

    try {
      const response = await fetch("/api/community/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, value: nextValue }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.error ?? "Unable to register your vote.";
        setBanner({ type: "error", message: typeof message === "string" ? message : "Unable to register your vote." });
        return;
      }

      const data = (await response.json()) as {
        post?: CommunityPostView;
        reply?: CommunityReplyView;
      };

      if (data.post) {
        updatePostState(data.post);
      }
      if (data.reply) {
        replaceReplyInPost(data.reply);
      }
    } catch (error) {
      setBanner({ type: "error", message: "Something went wrong while recording your vote." });
    } finally {
      removePendingVote(voteKey);
    }
  }

  return (
    <div className="space-y-6">
      {banner ? (
        <div
          role="status"
          className={`alert ${banner.type === "success" ? "alert-success" : "alert-error"} flex items-center justify-between`}
        >
          <span>{banner.message}</span>
          <Button variant="ghost" size="sm" onClick={() => setBanner(null)}>
            Dismiss
          </Button>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Start a conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleCreatePost}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="post-title">
                Title
              </label>
              <Input
                id="post-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Share a gig lead, question, or announcement"
                disabled={isSubmittingPost}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="post-content">
                Message
              </label>
              <Textarea
                id="post-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Add the full details so the community can jump in"
                disabled={isSubmittingPost}
                rows={5}
              />
            </div>
            {postError ? <p className="text-sm text-error">{postError}</p> : null}
            <div className="flex items-center justify-between">
              <p className="text-sm text-base-content/70">
                {isAuthenticated
                  ? "Posts earn points when the community upvotes your ideas."
                  : "Sign in to publish a post and join the discussion."}
              </p>
              <Button type="submit" disabled={!isAuthenticated || isSubmittingPost}>
                {isSubmittingPost ? "Posting..." : "Publish"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section aria-live="polite" className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest posts</h2>
          <span className="text-sm text-base-content/70">{postCount} active {postCount === 1 ? "discussion" : "discussions"}</span>
        </header>
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-base-content/70">
              Be the first to share something with the community.
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => {
            const replyDraft = replyDrafts[post.id] ?? "";
            const replyError = replyErrors[post.id] ?? null;
            const isReplySubmitting = submittingReplyFor === post.id;
            return (
              <article key={post.id} className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 rounded-full ${post.userVote === 1 ? "bg-primary/10 text-primary" : "text-base-content/70"}`}
                      onClick={() => handleVote("POST", post.id, 1, post.userVote)}
                      disabled={pendingVotes.has(makeVoteKey("POST", post.id))}
                      aria-label="Upvote post"
                    >
                      <ArrowBigUp className="h-5 w-5" />
                    </Button>
                    <span className="text-sm font-semibold">{post.score}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 rounded-full ${post.userVote === -1 ? "bg-secondary/10 text-secondary" : "text-base-content/70"}`}
                      onClick={() => handleVote("POST", post.id, -1, post.userVote)}
                      disabled={pendingVotes.has(makeVoteKey("POST", post.id))}
                      aria-label="Downvote post"
                    >
                      <ArrowBigDown className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/70">
                      <span className="font-medium text-base-content">
                        {post.authorName} · {formatRole(post.authorRole)}
                      </span>
                      <span>•</span>
                      <span>{formatTimestamp(post.createdAt)}</span>
                    </div>
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <p className="whitespace-pre-wrap text-base-content/90">{post.content}</p>
                    <div className="rounded-lg border border-base-300 bg-base-200/40 p-3">
                      <h4 className="text-sm font-semibold text-base-content/80">
                        Replies · {post.replyCount}
                      </h4>
                      <div className="mt-3 space-y-3">
                        {post.replies.length === 0 ? (
                          <p className="text-sm text-base-content/70">No replies yet. Start the conversation!</p>
                        ) : (
                          post.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3 rounded-lg border border-base-300/70 bg-base-100 p-3">
                              <div className="flex flex-col items-center gap-1 pt-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className={`h-7 w-7 rounded-full ${reply.userVote === 1 ? "bg-primary/10 text-primary" : "text-base-content/60"}`}
                                  onClick={() => handleVote("REPLY", reply.id, 1, reply.userVote)}
                                  disabled={pendingVotes.has(makeVoteKey("REPLY", reply.id))}
                                  aria-label="Upvote reply"
                                >
                                  <ArrowBigUp className="h-4 w-4" />
                                </Button>
                                <span className="text-xs font-semibold">{reply.score}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className={`h-7 w-7 rounded-full ${reply.userVote === -1 ? "bg-secondary/10 text-secondary" : "text-base-content/60"}`}
                                  onClick={() => handleVote("REPLY", reply.id, -1, reply.userVote)}
                                  disabled={pendingVotes.has(makeVoteKey("REPLY", reply.id))}
                                  aria-label="Downvote reply"
                                >
                                  <ArrowBigDown className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/70">
                                  <span className="font-medium text-base-content">
                                    {reply.authorName} · {formatRole(reply.authorRole)}
                                  </span>
                                  <span>•</span>
                                  <span>{formatTimestamp(reply.createdAt)}</span>
                                </div>
                                <p className="whitespace-pre-wrap text-sm text-base-content/90">{reply.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <form className="mt-3 space-y-2" onSubmit={(event) => handleCreateReply(event, post.id)}>
                        <Textarea
                          value={replyDraft}
                          onChange={(event) => handleReplyChange(post.id, event.target.value)}
                          placeholder={isAuthenticated ? "Add your reply" : "Sign in to reply"}
                          rows={3}
                          disabled={!isAuthenticated || isReplySubmitting}
                        />
                        {replyError ? <p className="text-xs text-error">{replyError}</p> : null}
                        <div className="flex justify-end">
                          <Button type="submit" size="sm" disabled={!isAuthenticated || isReplySubmitting}>
                            {isReplySubmitting ? "Sending..." : "Reply"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
