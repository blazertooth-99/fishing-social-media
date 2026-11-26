"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  broadcastNotificationsRead,
  getNotificationCommentId,
  getNotificationPostId,
  listNotifications,
  markNotificationAsRead,
} from "@/lib/api/notifications";
import {
  getCommentPostId,
  getFeed,
  getPostById,
  listComments,
} from "@/lib/api/posts";
import { setPendingCommentFocus } from "@/lib/notification-focus";

export default function NotificationDeepLink({
  id,
  postId,
  commentId,
  highlight = false,
}: {
  id: string;
  postId?: string | null;
  commentId?: string | null;
  highlight?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function openNotification() {
      let target = postId ?? null;
      let commentToOpen = commentId ?? null;
      let shouldHighlight = highlight || Boolean(commentId);

      if (!target || !commentToOpen) {
        try {
          const { items } = await listNotifications({ limit: 100 });
          if (cancelled) return;
          const found = items.find((item) => item.id === id);
          if (found) {
            if (!target) target = getNotificationPostId(found);
            if (!commentToOpen) {
              const notificationComment = getNotificationCommentId(found);
              if (notificationComment) {
                commentToOpen = notificationComment;
                shouldHighlight = true;
              }
            }
            const eventType = found.event_type.toUpperCase();
            if (eventType === "COMMENT" || eventType === "REPLY") {
              shouldHighlight = true;
            }
          }
        } catch {}
      }

      // Never trust a candidate id until it resolves to a real post: for
      // comment notifications the backend's `entity_id` is the comment id,
      // not the post id, so an unvalidated target would keep the post hidden.
      const candidates = Array.from(
        new Set([target, commentToOpen].filter(Boolean) as string[]),
      );
      let resolvedTarget: string | null = null;
      for (const candidate of candidates) {
        const post = await getPostById(candidate).catch(() => null);
        if (post?.id) {
          resolvedTarget = post.id;
          break;
        }
      }
      target = resolvedTarget;

      if (!target && commentToOpen) {
        const resolved = await getCommentPostId(commentToOpen).catch(() => null);
        if (resolved) target = resolved;
      }

      if (!target && commentToOpen) {
        const { items: feedPosts } = await getFeed({ limit: 20 }).catch(() => ({
          items: [],
        }));
        for (const post of feedPosts) {
          const { items } = await listComments(post.id, { limit: 20 }).catch(
            () => ({ items: [] }),
          );
          if (items.some((comment) => comment.id === commentToOpen)) {
            target = post.id;
            break;
          }
        }
      }

      if (cancelled) return;

      void markNotificationAsRead(id)
        .then(() => {
          if (!cancelled) broadcastNotificationsRead();
        })
        .catch(() => {});

      if (target) {
        setPendingCommentFocus({
          postId: target,
          commentId: commentToOpen,
          highlight: shouldHighlight,
          at: Date.now(),
        });
        const params = new URLSearchParams({ post: target });
        if (commentToOpen) params.set("comment", commentToOpen);
        if (shouldHighlight) params.set("highlight", "1");
        router.replace(`/feed?${params.toString()}`);
        return;
      }
      setError("This notification does not link to a post.");
    }

    void openNotification();
    return () => {
      cancelled = true;
    };
  }, [id, postId, commentId, highlight, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        {error ? (
          <>
            <p className="text-sm text-slate-600">{error}</p>
            <button
              type="button"
              onClick={() => router.push("/notifications")}
              className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              View notifications
            </button>
          </>
        ) : (
          <>
            <Loader2
              size={22}
              className="mx-auto animate-spin text-emerald-600"
            />
            <p className="mt-3 text-sm font-medium text-slate-700">
              Opening post…
            </p>
          </>
        )}
      </div>
    </main>
  );
}
