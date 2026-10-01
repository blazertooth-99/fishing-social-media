"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DesktopSidebar from "../desktop-sidebar";
import DesktopRightSidebar from "../desktop-right-sidebar";
import DesktopFishingPost from "../desktop-fishing-post";
import CreatePost from "@/app/components/shared/post/create-post";

import { api } from "@/lib/api";
import { extractApiErrorMessage, getFeed, type ApiPost } from "@/lib/api/posts";
import { Button } from "@/components/ui/button";

const PAGE_LIMIT = 20;

export default function DesktopLayout() {
  const router = useRouter();
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadFeed = useCallback(
    async (cursor?: string | null, append = false) => {
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
        const status = (err as { status?: number })?.status;
        if (status === 401 && !append) {
          router.replace("/login");
          return;
        }
        if (!append) setError(extractApiErrorMessage(err, "Failed to load feed"));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [router],
  );

  useEffect(() => {
    async function check() {
      const session = await api.getSession();
      if (!session?.data) {
        router.replace("/login");
        return;
      }
      setCurrentUserId(session.data.user_id ?? null);
      await loadFeed(null, false);
    }

    check();
  }, [router, loadFeed]);

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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-350 grid min-h-screen grid-cols-[240px_minmax(0,680px)_300px] gap-8 px-8 py-8">
        {/* LEFT SIDEBAR */}
        <aside className="border-r border-slate-200 bg-white">
          <DesktopSidebar />
        </aside>

        {/* MAIN FEED */}
        <section className="min-w-0 px-8 py-8">
          <div className="mx-auto max-w-3xl">
            <header className="mb-8">
              <p className="text-sm font-medium text-emerald-600">
                Welcome back, Angler 👋
              </p>

              <h1 className="mt-1 text-4xl font-bold tracking-tight">
                Fishing Community
              </h1>
            </header>

            {/* POST /api/v1/posts */}
            <CreatePost onPostCreated={handlePostCreated} />

            <div className="mt-8 space-y-6">
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5"
                  >
                    <div className="h-4 w-1/3 rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                    <div className="mt-2 aspect-[4/3] rounded-2xl bg-slate-100" />
                  </div>
                ))}

              {!loading && error && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                  {error}
                  <div className="mt-3">
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
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                  No posts yet. Share your first catch above 🎣
                </div>
              )}

              {/* Feed list — each item is a full PostResponse (GET /api/v1/posts/{id} shape) */}
              {!loading &&
                !error &&
                posts.map((post) => (
                  <DesktopFishingPost
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
                    disabled={loadingMore}
                    onClick={() => loadFeed(nextCursor, true)}
                    className="rounded-full"
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="border-l border-slate-200 bg-white">
          <DesktopRightSidebar />
        </aside>
      </div>
    </main>
  );
}
