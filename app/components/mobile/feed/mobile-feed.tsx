"use client";

import { useCallback, useEffect, useState } from "react";

import MobileHeader from "../mobile-header";
import MobileBottomNav from "../mobile-bottom-nav";
import MobileFishingPost from "../mobile-fishing-post";
import CreatePost from "@/app/components/shared/post/create-post";

import { extractApiErrorMessage, getFeed, type ApiPost } from "@/lib/api/posts";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useJoinedCommunities } from "@/app/components/shared/community/use-joined-communities";
import { useRouter } from "next/navigation";

const PAGE_LIMIT = 20;

export default function MobileLayout() {
  const router = useRouter();
  const {
    communities: joinedCommunities,
    isLoading: joinedLoading,
    error: joinedError,
    isLoggedOut: joinedLoggedOut,
  } = useJoinedCommunities({ limit: 20, maxPages: 5 });
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

        {/* YOUR COMMUNITIES — joined by user */}
        <div className="mb-3 rounded-2xl bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900">Your communities</h2>
            <button
              onClick={() => router.push("/community")}
              className="text-[11px] font-semibold text-emerald-600"
            >
              See all
            </button>
          </div>

          {joinedLoading && joinedCommunities.length === 0 ? (
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 w-32 shrink-0 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : joinedCommunities.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {joinedCommunities.slice(0, 10).map((community) => (
                <button
                  key={community.id}
                  onClick={() =>
                    router.push(
                      `/community/${encodeURIComponent(community.slug || community.id)}`,
                    )
                  }
                  className="flex w-36 shrink-0 items-center gap-2 rounded-xl bg-slate-50 p-2 text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    {community.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-slate-800">
                      {community.name}
                    </span>
                    <span className="block truncate text-[10px] text-slate-400">
                      {(community.member_count ?? 0).toLocaleString()} members
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : joinedLoggedOut ? (
            <p className="px-1 text-xs text-slate-400">
              Log in to see communities you joined.
            </p>
          ) : joinedError ? (
            <p className="px-1 text-xs text-red-500">{joinedError}</p>
          ) : (
            <div className="px-1">
              <p className="text-xs text-slate-400">
                You haven&apos;t joined any community yet.
              </p>
              <button
                onClick={() => router.push("/community")}
                className="mt-1 text-xs font-semibold text-emerald-600"
              >
                Browse communities
              </button>
            </div>
          )}
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
