"use client";

import { useCallback, useEffect, useState } from "react";

import MobileHeader from "../mobile-header";
import MobileBottomNav from "../mobile-bottom-nav";
import MobileFishingPost from "../mobile-fishing-post";
import CreatePost from "@/app/components/shared/post/create-post";

import { extractApiErrorMessage, getFeed, type ApiPost } from "@/lib/api/posts";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

const PAGE_LIMIT = 20;

export default function MobileLayout() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadFeed = useCallback(async (cursor?: string | null, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }
      const { items, pagination } = await getFeed({
        limit: PAGE_LIMIT,
        cursor: cursor ?? undefined,
      });
      setPosts((prev) => (append ? [...prev, ...items] : items));
      setNextCursor(pagination?.next_cursor ?? null);
      setHasMore(pagination?.has_more === true && Boolean(pagination?.next_cursor));
    } catch (err) {
      if (!append) setError(extractApiErrorMessage(err, "Failed to load feed"));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      // Best-effort viewer id for owner-only Edit; null when logged out.
      const session = await api.getSession().catch(() => null);
      setCurrentUserId(session?.data?.user_id ?? null);
      await loadFeed(null, false);
    }

    init();
  }, [loadFeed]);

  // Fresh post (already re-fetched via GET /api/v1/posts/{id}) goes on top.
  function handlePostCreated(post: ApiPost) {
    setPosts((prev) =>
      prev.some((p) => p.id === post.id) ? prev : [post, ...prev],
    );
  }

  // Edited post (PATCH + re-fetched detail) replaces the item in place.
  function handlePostUpdated(updated: ApiPost) {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <MobileHeader />

      <section className="px-3 py-4">
        <h1 className="mb-4 px-1 text-xl font-bold">Home</h1>

        {/* POST /api/v1/posts (mobile) */}
        <div className="mb-3">
          <CreatePost onPostCreated={handlePostCreated} />
        </div>

        <div className="space-y-2">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl bg-white p-3 shadow-sm"
              >
                <div className="h-3 w-1/2 rounded bg-slate-200" />
                <div className="mt-2 aspect-[4/3] rounded-xl bg-slate-100" />
              </div>
            ))}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-600">
              {error}
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadFeed(null, false)}
                >
                  Try again
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
              No posts yet. Share your first catch above 🎣
            </div>
          )}

          {/* Feed list — each item is a full PostResponse (GET /api/v1/posts/{id} shape) */}
          {!loading &&
            !error &&
            posts.map((post) => (
              <MobileFishingPost
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onPostUpdated={handlePostUpdated}
              />
            ))}

          {!loading && !error && hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loadingMore}
                onClick={() => loadFeed(nextCursor, true)}
                className="rounded-full"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </div>
      </section>

      <MobileBottomNav />
    </main>
  );
}
