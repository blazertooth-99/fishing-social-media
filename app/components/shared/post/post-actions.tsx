"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Heart, Loader2, MessageCircle, Share2, X } from "lucide-react";

import Image from "next/image";

import CommunityTag from "@/app/components/shared/post/community-tag";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import {
  createComment,
  extractApiErrorMessage,
  formatRelativeTime,
  likePost,
  listComments,
  resolveMediaUrl,
  unlikePost,
  type ApiComment,
  type ApiPost,
} from "@/lib/api/posts";
import {
  getPostShareCount,
  POST_SHARE_EVENT,
  recordPostShare,
} from "@/lib/post-shares";
import { getAvatarUrl } from "@/lib/api/media";

interface PostActionsProps {
  post: ApiPost;
  currentUserId?: string | null;
  onPostUpdated?: (post: ApiPost) => void;
  compact?: boolean;
}

function interactionError(err: unknown, fallback: string): string {
  const status = (err as { status?: number })?.status;
  if (status === 401) return "Please log in to continue.";
  return extractApiErrorMessage(err, fallback);
}

function initials(name: string): string {
  return name
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function CommentItem({
  comment,
  nested,
  onReply,
}: {
  comment: ApiComment;
  nested?: boolean;
  onReply: (comment: ApiComment) => void;
}) {
  const name =
    comment.author_display_name || comment.author_username || "Angler";
  const avatarUrl = getAvatarUrl(comment.author_avatar_media_id ?? null);

  return (
    <div className={`flex gap-2.5 ${nested ? "ml-8" : ""}`}>
      <Avatar className="h-8 w-8 shrink-0">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback className="bg-emerald-100 text-[10px] font-bold text-emerald-700">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 rounded-2xl bg-slate-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <p className="truncate text-xs font-semibold text-slate-900">{name}</p>
          {comment.created_at && (
            <span className="shrink-0 text-[10px] text-slate-400">
              {formatRelativeTime(comment.created_at)}
            </span>
          )}
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-700">
          {comment.content}
        </p>
        {!nested && (
          <button
            type="button"
            onClick={() => onReply(comment)}
            className="mt-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Reply
          </button>
        )}
      </div>
    </div>
  );
}

function PostPreview({
  post,
  likeCount,
  commentCount,
  shareCount,
  liked,
  liking,
  onLike,
  onShare,
}: {
  post: ApiPost;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  liked: boolean;
  liking: boolean;
  onLike: () => void;
  onShare: () => void;
}) {
  const name = post.author_display_name || post.author_username || "Angler";
  const avatarUrl = getAvatarUrl(post.author_avatar_media_id);
  const cover = post.media?.[0]
    ? resolveMediaUrl(
        post.media[0].display_url || post.media[0].thumbnail_url,
      )
    : null;
  const locationLabel = !post.location
    ? null
    : post.location.privacy === "PRIVATE"
      ? "Private location"
      : (post.location.name ?? "Shared location");

  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-3 p-4">
        <Avatar className="h-10 w-10 shrink-0 ring-2 ring-emerald-50">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-xs text-white">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">{name}</p>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
            <span className="truncate">@{post.author_username}</span>
            <span>·</span>
            <span>{formatRelativeTime(post.created_at)}</span>
          </div>
          {post.community_id && (
            <div className="mt-1.5">
              <CommunityTag communityId={post.community_id} />
            </div>
          )}
        </div>
      </div>

      {post.content && (
        <p className="whitespace-pre-wrap break-words px-4 pb-3 text-sm leading-6 text-slate-700">
          {post.content}
        </p>
      )}

      {cover && (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
          <Image
            src={cover}
            alt={`Catch by ${name}`}
            fill
            loading="eager"
            sizes="(max-width: 768px) 95vw, 600px"
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="flex items-center gap-1 border-t border-slate-100 px-3 py-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onLike}
          disabled={liking}
          aria-pressed={liked}
          className={`gap-1.5 rounded-xl text-xs ${
            liked ? "text-red-500" : "text-slate-500 hover:text-red-500"
          }`}
        >
          {liking ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Heart size={15} fill={liked ? "currentColor" : "none"} />
          )}
          Like{likeCount > 0 ? ` · ${likeCount}` : ""}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="gap-1.5 rounded-xl text-xs text-slate-500"
        >
          <Share2 size={15} />
          Share{shareCount > 0 ? ` · ${shareCount}` : ""}
        </Button>

        <span className="ml-auto flex items-center gap-1.5 px-2 text-[11px] font-medium text-slate-500">
          <MessageCircle size={14} /> {commentCount}
        </span>
      </div>

      {locationLabel && (
        <div className="flex items-center gap-1 px-4 pb-3 text-[11px] text-emerald-600">
          <span className="truncate">📍 {locationLabel}</span>
        </div>
      )}
    </div>
  );
}

export default function PostActions({
  post,
  currentUserId,
  onPostUpdated,
  compact = false,
}: PostActionsProps) {
  const [override, setOverride] = useState<{
    key: string;
    patch: Partial<ApiPost>;
  } | null>(null);
  const [shareCount, setShareCount] = useState(0);
  const [liking, setLiking] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<ApiComment | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const propKey = `${post.like_count ?? 0}|${post.is_liked ? "1" : "0"}|${
    post.comment_count ?? 0
  }`;
  const activePatch = override?.key === propKey ? override.patch : null;
  const likeCount = activePatch?.like_count ?? post.like_count ?? 0;
  const liked = activePatch?.is_liked ?? Boolean(post.is_liked);
  const commentCount = activePatch?.comment_count ?? post.comment_count ?? 0;

  useEffect(() => {
    const sync = () =>
      setShareCount(
        Math.max(getPostShareCount(post.id), post.share_count ?? 0),
      );
    sync();
    window.addEventListener(POST_SHARE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(POST_SHARE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [post.id, post.share_count]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function applyPatch(patch: Partial<ApiPost>) {
    setOverride({
      key: propKey,
      patch: { ...(activePatch ?? {}), ...patch },
    });
  }

  function emitUpdate(patch: Partial<ApiPost>) {
    onPostUpdated?.({ ...post, ...(activePatch ?? {}), ...patch });
  }

  async function handleLike() {
    if (liking) return;
    const nextLiked = !liked;
    const nextCount = Math.max(0, likeCount + (nextLiked ? 1 : -1));
    setLiking(true);
    applyPatch({ is_liked: nextLiked, like_count: nextCount });
    setActionError(null);
    emitUpdate({ is_liked: nextLiked, like_count: nextCount });

    try {
      const status = nextLiked
        ? await likePost(post.id, {
            is_liked: true,
            like_count: nextCount,
          })
        : await unlikePost(post.id, {
            is_liked: false,
            like_count: nextCount,
          });
      const finalLiked = Boolean(status.is_liked);
      const finalCount =
        typeof status.like_count === "number" ? status.like_count : nextCount;
      applyPatch({ is_liked: finalLiked, like_count: finalCount });
      emitUpdate({ is_liked: finalLiked, like_count: finalCount });
    } catch (err) {
      applyPatch({ is_liked: !nextLiked, like_count: likeCount });
      emitUpdate({ is_liked: !nextLiked, like_count: likeCount });
      setActionError(interactionError(err, "Could not update like"));
    } finally {
      setLiking(false);
    }
  }

  async function loadComments(cursor?: string | null, append = false) {
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const result = await listComments(post.id, { limit: 20, cursor });
      setComments((prev) =>
        append
          ? [
              ...prev,
              ...result.items.filter(
                (item) => !prev.some((existing) => existing.id === item.id),
              ),
            ]
          : result.items,
      );
      setNextCursor(result.nextCursor);
      setHasMoreComments(result.hasMore);
    } catch (err) {
      setCommentsError(interactionError(err, "Could not load comments"));
    } finally {
      setCommentsLoading(false);
    }
  }

  function handleOpenComments() {
    setCommentsOpen(true);
    setReplyTo(null);
    setCommentText("");
    setComments([]);
    setNextCursor(null);
    setHasMoreComments(false);
    setCommentsError(null);
    void loadComments(null, false);
  }

  async function handleSubmitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = commentText.trim();
    if (!content || submittingComment) return;

    setSubmittingComment(true);
    setActionError(null);
    try {
      const created = await createComment(post.id, content, replyTo?.id ?? null);
      setComments((prev) =>
        prev.some((item) => item.id === created.id) ? prev : [...prev, created],
      );
      const nextCount = commentCount + 1;
      applyPatch({ comment_count: nextCount });
      emitUpdate({ comment_count: nextCount });
      setCommentText("");
      setReplyTo(null);
    } catch (err) {
      setActionError(interactionError(err, "Could not post comment"));
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/feed?post=${encodeURIComponent(post.id)}`;
    let shared = false;
    let message = "Post shared";

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `Catch by ${post.author_display_name}`,
          text: post.content.slice(0, 180),
          url,
        });
        shared = true;
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
      }
    }

    if (!shared) {
      try {
        await navigator.clipboard.writeText(url);
        shared = true;
        message = "Link copied";
      } catch {
        shared = false;
      }
    }

    if (!shared) {
      setActionError("Unable to share this post.");
      return;
    }

    const count = recordPostShare(post.id);
    setShareCount(Math.max(count, post.share_count ?? 0));
    setNotice(message);
    setActionError(null);
  }

  const repliesByParent = new Map<string, ApiComment[]>();
  for (const comment of comments) {
    if (!comment.parent_comment_id) continue;
    const replies = repliesByParent.get(comment.parent_comment_id) ?? [];
    replies.push(comment);
    repliesByParent.set(comment.parent_comment_id, replies);
  }
  const rootComments = comments.filter(
    (comment) =>
      !comment.parent_comment_id ||
      !comments.some((item) => item.id === comment.parent_comment_id),
  );
  const iconSize = compact ? 14 : 19;

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void handleLike()}
          disabled={liking}
          aria-pressed={liked}
          aria-label={`${liked ? "Unlike" : "Like"} post`}
          className={`gap-2 rounded-xl px-2 ${
            compact ? "h-8 gap-1 px-2 text-[11px]" : ""
          } ${
            liked ? "text-red-500" : "text-slate-500 hover:text-red-500"
          }`}
        >
          {liking ? (
            <Loader2 size={iconSize} className="animate-spin" />
          ) : (
            <Heart size={iconSize} fill={liked ? "currentColor" : "none"} />
          )}
          {likeCount}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleOpenComments}
          aria-label="View comments"
          className={`gap-2 rounded-xl px-2 text-slate-500 ${
            compact ? "h-8 gap-1 px-2 text-[11px]" : ""
          }`}
        >
          <MessageCircle size={iconSize} />
          {commentCount}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void handleShare()}
          aria-label="Share post"
          className={`gap-2 rounded-xl px-2 text-slate-500 ${
            compact ? "h-8 gap-1 px-2 text-[11px]" : ""
          }`}
        >
          <Share2 size={compact ? 14 : 18} />
          {shareCount}
        </Button>
      </div>

      {(actionError || notice) && (
        <div className="mt-1 px-2">
          {actionError ? (
            <p role="alert" className="text-[11px] font-medium text-red-600">
              {actionError}
            </p>
          ) : (
            <p role="status" className="text-[11px] font-medium text-emerald-600">
              {notice}
            </p>
          )}
        </div>
      )}

      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent className="w-[95vw] max-w-2xl overflow-hidden rounded-3xl p-0">
          <div className="flex max-h-[90vh] flex-col">
            <div className="min-h-0 max-h-[45vh] shrink-0 overflow-y-auto border-b border-slate-100 bg-slate-50/50">
              <PostPreview
                post={post}
                likeCount={likeCount}
                commentCount={commentCount}
                shareCount={shareCount}
                liked={liked}
                liking={liking}
                onLike={() => void handleLike()}
                onShare={() => void handleShare()}
              />
              {(actionError || notice) && (
                <div className="px-4 pb-2">
                  {actionError ? (
                    <p
                      role="alert"
                      className="text-[11px] font-medium text-red-600"
                    >
                      {actionError}
                    </p>
                  ) : (
                    <p
                      role="status"
                      className="text-[11px] font-medium text-emerald-600"
                    >
                      {notice}
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogHeader className="border-b border-slate-100 px-5 py-4 pr-14">
              <DialogTitle>Comments</DialogTitle>
              <DialogDescription>
                {commentCount} {commentCount === 1 ? "comment" : "comments"} on
                this post
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-3">
                {commentsLoading && comments.length === 0 && (
                  <p className="py-4 text-center text-xs text-slate-400">
                    Loading comments…
                  </p>
                )}

                {commentsError && (
                  <div className="space-y-2 rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600">
                    <p>{commentsError}</p>
                    <button
                      type="button"
                      onClick={() => void loadComments(null, false)}
                      className="font-semibold underline"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!commentsLoading && !commentsError && comments.length === 0 && (
                  <p className="py-4 text-center text-xs text-slate-400">
                    No comments yet. Be the first to comment.
                  </p>
                )}

                {rootComments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <CommentItem comment={comment} onReply={setReplyTo} />
                    {(repliesByParent.get(comment.id) ?? []).map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        nested
                        onReply={setReplyTo}
                      />
                    ))}
                  </div>
                ))}

                {hasMoreComments && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void loadComments(nextCursor, true)}
                    disabled={commentsLoading}
                    className="w-full rounded-full text-xs"
                  >
                    {commentsLoading ? "Loading…" : "Load more comments"}
                  </Button>
                )}
              </div>

              <form
                onSubmit={handleSubmitComment}
                className="space-y-2 border-t border-slate-100 px-5 py-3"
              >
                {replyTo && (
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                    <span>
                      Replying to{" "}
                      <strong className="text-slate-800">
                        {replyTo.author_display_name || replyTo.author_username}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      aria-label="Cancel reply"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <Textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  maxLength={1000}
                  rows={2}
                  placeholder="Write a comment…"
                  className="resize-none rounded-2xl text-sm"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    {currentUserId ? "" : "Log in to comment"}
                  </span>
                  <Button
                    type="submit"
                    disabled={submittingComment || commentText.trim().length === 0}
                    className="gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {submittingComment && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    Comment
                  </Button>
                </div>
              </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
