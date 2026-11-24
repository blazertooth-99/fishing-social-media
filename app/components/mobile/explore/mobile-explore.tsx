"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  Compass,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import MobileHeader from "@/app/components/mobile/mobile-header";
import MobileBottomNav from "@/app/components/mobile/mobile-bottom-nav";
import MobileFishingPost from "@/app/components/mobile/mobile-fishing-post";
import ExploreSearchResults from "@/app/components/shared/explore/explore-search-results";
import TrendingPosts from "@/app/components/shared/explore/trending-posts";
import TrendingSearches from "@/app/components/shared/explore/trending-searches";
import type { ExploreFeedState } from "@/app/components/shared/explore/use-explore-feed";
import type { ExploreSearchState } from "@/app/components/shared/explore/use-explore-search";
import type { ApiPost } from "@/lib/api/posts";

interface MobileExploreProps {
  feed: ExploreFeedState;
  search: ExploreSearchState;
}

export default function MobileExplore({ feed, search }: MobileExploreProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".mobile-explore-header", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  function openPost(post: ApiPost) {
    if (post.community_id) {
      router.push(`/community/${encodeURIComponent(post.community_id)}`);
      return;
    }
    router.push("/feed");
  }

  const showTypingHint =
    search.query.trim().length > 0 && !search.isActive;

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50 pb-24">
      <MobileHeader />

      <div className="px-4 pt-4">
        <div className="mobile-explore-header flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-cyan-600">
              Discover the fishing world
            </p>
            <h1 className="mt-0.5 text-2xl font-bold">Explore</h1>
          </div>

          <Compass size={23} className="text-cyan-500" />
        </div>

        <div className="relative mt-4">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <Input
            value={search.query}
            onChange={(event) => search.setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                search.runSearch(search.query);
                event.currentTarget.blur();
              }
            }}
            placeholder="Search fishing..."
            className="h-10 rounded-full border-0 bg-white pl-9 pr-9 shadow-sm"
            aria-label="Search Explore"
          />

          {search.query.length > 0 && (
            <button
              type="button"
              onClick={search.clear}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {search.isActive ? (
          <div className="mt-4">
            <ExploreSearchResults
              query={search.query.trim()}
              results={search.results}
              isSearching={search.isSearching}
              error={search.error}
              onRetry={search.retry}
              onSelectHashtag={search.runSearch}
            />
          </div>
        ) : showTypingHint ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center text-xs text-slate-400">
            Keep typing — search starts at two characters.
          </div>
        ) : (
          <>
            <div className="mt-4">
              <TrendingSearches
                variant="mobile"
                items={feed.trendingSearches}
                onSelect={search.runSearch}
              />
            </div>

            <div className="mt-3">
              <TrendingPosts
                variant="mobile"
                posts={feed.trendingPosts}
                loading={feed.loading}
                onOpenPost={openPost}
              />
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-end justify-between gap-2 px-1">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600">
                    <Sparkles size={13} />
                    Recommended for you
                  </p>
                  <h2 className="mt-0.5 text-lg font-bold text-slate-900">
                    Fresh catches
                  </h2>
                </div>

                {!feed.loading && feed.recommendedPosts.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-white text-[10px] text-slate-500 shadow-sm"
                  >
                    {feed.recommendedPosts.length} picks
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                {feed.loading && feed.recommendedPosts.length === 0 ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse overflow-hidden rounded-2xl bg-white p-3 shadow-sm"
                    >
                      <div className="h-3 w-1/2 rounded bg-slate-200" />
                      <div className="mt-2 aspect-[4/3] rounded-xl bg-slate-100" />
                    </div>
                  ))
                ) : feed.error && feed.recommendedPosts.length === 0 ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-600">
                    {feed.error}
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void feed.reload()}
                      >
                        <RefreshCw size={13} />
                        Try again
                      </Button>
                    </div>
                  </div>
                ) : feed.recommendedPosts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
                    No recommended posts yet. Share your first catch.
                  </div>
                ) : (
                  feed.recommendedPosts.map((post) => (
                    <MobileFishingPost
                      key={post.id}
                      post={post}
                      currentUserId={feed.currentUserId}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <MobileBottomNav />
    </main>
  );
}
