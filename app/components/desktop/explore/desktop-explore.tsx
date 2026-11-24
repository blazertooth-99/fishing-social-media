"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Compass,
  Flame,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import DesktopSidebar from "../desktop-sidebar";
import DesktopFishingPost from "../desktop-fishing-post";
import ExploreSearchResults from "@/app/components/shared/explore/explore-search-results";
import TrendingPosts from "@/app/components/shared/explore/trending-posts";
import TrendingSearches from "@/app/components/shared/explore/trending-searches";
import type { ExploreFeedState } from "@/app/components/shared/explore/use-explore-feed";
import type { ExploreSearchState } from "@/app/components/shared/explore/use-explore-search";
import type { ApiPost } from "@/lib/api/posts";

gsap.registerPlugin(ScrollTrigger);

interface DesktopExploreProps {
  feed: ExploreFeedState;
  search: ExploreSearchState;
}

export default function DesktopExplore({ feed, search }: DesktopExploreProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".explore-header", {
        y: 25,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
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
    <main ref={containerRef} className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[240px_minmax(0,680px)_300px] gap-8 px-8 py-8">
        <aside className="border-r border-slate-200 bg-white">
          <DesktopSidebar />
        </aside>

        <section className="col-start-2 min-w-0">
          <header className="explore-header mb-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-600">
                  Discover the fishing world
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  Explore
                </h1>
              </div>

              <Compass size={26} className="text-cyan-500" />
            </div>

            <div className="relative mt-5">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
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
                placeholder="Search anglers, posts, communities, spots..."
                className="h-11 rounded-xl border-0 bg-white pl-10 pr-10 shadow-sm"
                aria-label="Search Explore"
              />

              {search.query.length > 0 && (
                <button
                  type="button"
                  onClick={search.clear}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Search posts, anglers, communities, spots, places, species, gear,
              events, and hashtags.
            </p>
          </header>

          {search.isActive ? (
            <ExploreSearchResults
              query={search.query.trim()}
              results={search.results}
              isSearching={search.isSearching}
              error={search.error}
              onRetry={search.retry}
              onSelectHashtag={search.runSearch}
            />
          ) : showTypingHint ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
              Keep typing — search starts at two characters.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-cyan-600">
                    <Sparkles size={15} />
                    Recommended for you
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Fresh catches worth a look
                  </h2>
                </div>

                {!feed.loading && feed.recommendedPosts.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-white text-slate-500 shadow-sm"
                  >
                    {feed.recommendedPosts.length} picks
                  </Badge>
                )}
              </div>

              {feed.loading && feed.recommendedPosts.length === 0 ? (
                <div className="space-y-5">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5"
                    >
                      <div className="h-4 w-1/3 rounded bg-slate-200" />
                      <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                      <div className="mt-2 aspect-[4/3] rounded-2xl bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : feed.error && feed.recommendedPosts.length === 0 ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                  {feed.error}
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void feed.reload()}
                    >
                      <RefreshCw size={14} />
                      Try again
                    </Button>
                  </div>
                </div>
              ) : feed.recommendedPosts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                  No recommended posts yet. Join a community or share your first
                  catch.
                </div>
              ) : (
                feed.recommendedPosts.map((post) => (
                  <DesktopFishingPost
                    key={post.id}
                    post={post}
                    currentUserId={feed.currentUserId}
                  />
                ))
              )}
            </div>
          )}
        </section>

        <aside className="col-start-3">
          <div className="sticky top-8 space-y-5">
            <TrendingSearches
              items={feed.trendingSearches}
              onSelect={search.runSearch}
            />

            <TrendingPosts
              posts={feed.trendingPosts}
              loading={feed.loading}
              onOpenPost={openPost}
            />

            <section className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5 text-white shadow-sm">
              <Flame size={22} />

              <h3 className="mt-4 font-bold">Share your best catch</h3>

              <p className="mt-2 text-sm leading-6 text-cyan-50">
                Post your latest trip and help fellow anglers discover new
                spots, patterns, and techniques.
              </p>

              <Button
                type="button"
                onClick={() => router.push("/post")}
                className="mt-4 w-full rounded-xl bg-white text-cyan-700 hover:bg-cyan-50"
              >
                Create a post
              </Button>
            </section>
          </div>
        </aside>
      </div>
    </main>
  );
}
