"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Flame,
  Hash,
  Heart,
  Loader2,
  MapPin,
  Search,
  Star,
  TrendingUp,
  UserPlus,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  extractHashtags,
  useHomeSidebar,
} from "@/app/components/shared/feed/use-home-sidebar";
import {
  formatSpotDistance,
  formatSpotRating,
} from "@/lib/api/fishing-spots";
import { getAvatarUrl } from "@/lib/api/media";
import type { ApiPost } from "@/lib/api/posts";

function initials(name: string): string {
  return name
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function snippet(content: string): string {
  return content.trim().replace(/\s+/g, " ") || "Photo post";
}

function waterTypeLabel(value: string): string {
  const normalized = value.toLowerCase().replace(/_/g, " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-slate-100" />
            <div className="h-2.5 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RightSidebar() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const {
    trendingPosts,
    trendingHashtags,
    recommendedSpots,
    suggestions,
    loading,
    errors,
    follow,
    followPending,
    followError,
  } = useHomeSidebar();

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/explore?q=${encodeURIComponent(query)}` : "/explore");
  }

  function openHashtag(tag: string) {
    router.push(`/explore?q=${encodeURIComponent(tag)}`);
  }

  function openTrendingPost(post: ApiPost) {
    const [tag] = extractHashtags(post.content);
    if (tag) {
      openHashtag(tag);
      return;
    }
    router.push(`/feed?post=${encodeURIComponent(post.id)}`);
  }

  return (
    <div className="sticky top-0 h-screen overflow-y-auto px-5 py-7">
      <form onSubmit={handleSearch} role="search" className="relative">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search anglers, fish, spots..."
          aria-label="Search anglers, posts, and spots"
          className="h-11 rounded-2xl border-none bg-slate-100 pl-11 pr-10 shadow-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        />

        {search.length > 0 && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </form>

      <section className="scroll-reveal mt-6 rounded-3xl bg-slate-50 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-600" />
            <div>
              <h2 className="font-bold text-slate-900">Trending this week</h2>
              <p className="text-[11px] text-slate-400">
                Hashtag posts anglers love
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/explore")}
            className="text-xs font-semibold text-emerald-600"
          >
            See all
          </button>
        </div>

        {loading ? (
          <ListSkeleton rows={4} />
        ) : errors.trending ? (
          <p className="rounded-2xl bg-white px-3 py-2 text-[11px] text-red-600">
            {errors.trending}
          </p>
        ) : trendingPosts.length === 0 ? (
          <p className="rounded-2xl bg-white px-3 py-2 text-[11px] text-slate-400">
            No hashtag posts this week yet.
          </p>
        ) : (
          <>
            {trendingHashtags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {trendingHashtags.map((hashtag) => (
                  <button
                    key={hashtag.tag}
                    type="button"
                    onClick={() => openHashtag(hashtag.tag)}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    <Hash size={10} />
                    {hashtag.tag}
                    <span className="text-slate-400">{hashtag.count}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-1">
              {trendingPosts.map((post, index) => {
                const tags = extractHashtags(post.content).slice(0, 2);

                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => openTrendingPost(post)}
                    className="group flex w-full items-start gap-2.5 rounded-2xl p-2 text-left transition hover:bg-white"
                  >
                    <span className="w-4 shrink-0 pt-0.5 text-center text-xs font-bold text-slate-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-xs font-semibold leading-4 text-slate-700">
                        {snippet(post.content)}
                      </span>

                      <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="truncate">@{post.author_username}</span>
                        {tags.map((tag) => (
                          <span key={tag} className="text-emerald-600">
                            #{tag}
                          </span>
                        ))}
                        <span className="inline-flex shrink-0 items-center gap-0.5">
                          <Heart size={9} />
                          {post.like_count ?? 0}
                        </span>
                      </span>
                    </span>

                    <ArrowUpRight
                      size={13}
                      className="mt-0.5 shrink-0 text-slate-300 transition group-hover:text-emerald-500"
                    />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>

      <section className="scroll-reveal mt-5 rounded-3xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={17} className="text-cyan-600" />
            <h2 className="font-bold text-slate-900">Recommended spots</h2>
          </div>

          <button
            type="button"
            onClick={() => router.push("/fishing-spots")}
            className="text-xs font-semibold text-cyan-600"
          >
            See all
          </button>
        </div>

        {loading ? (
          <ListSkeleton rows={3} />
        ) : errors.spots ? (
          <p className="rounded-2xl bg-red-50 px-3 py-2 text-[11px] text-red-600">
            {errors.spots}
          </p>
        ) : recommendedSpots.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-3 py-2 text-[11px] text-slate-400">
            No fishing spots to recommend yet.
          </p>
        ) : (
          <div className="space-y-1">
            {recommendedSpots.map((spot) => (
              <button
                key={spot.id}
                type="button"
                onClick={() => router.push("/fishing-spots")}
                className="group flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-slate-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <MapPin size={15} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800">
                    {spot.name}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                    <span className="truncate">
                      {waterTypeLabel(String(spot.water_type))}
                    </span>
                    {spot.distance_meters != null && (
                      <>
                        <span>·</span>
                        <span className="shrink-0">
                          {formatSpotDistance(spot.distance_meters)}
                        </span>
                      </>
                    )}
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                  <Star size={10} fill="currentColor" />
                  {formatSpotRating(spot.average_rating, spot.review_count)}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="scroll-reveal mt-5 rounded-3xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <UserPlus size={17} className="text-emerald-600" />
          <div>
            <h2 className="font-bold text-slate-900">Follow suggestions</h2>
            <p className="text-[11px] text-slate-400">
              Anglers you might want to follow
            </p>
          </div>
        </div>

        {loading ? (
          <ListSkeleton rows={4} />
        ) : suggestions.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-3 py-2 text-[11px] text-slate-400">
            No follow suggestions right now.
          </p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((angler) => {
              const avatarUrl = getAvatarUrl(angler.avatarMediaId);

              return (
                <div key={angler.id} className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/users/${encodeURIComponent(angler.username)}`,
                      )
                    }
                    aria-label={`Open ${angler.displayName}'s profile`}
                  >
                    <Avatar className="h-9 w-9">
                      {avatarUrl && (
                        <AvatarImage src={avatarUrl} alt={angler.displayName} />
                      )}
                      <AvatarFallback className="bg-emerald-100 text-[10px] font-bold text-emerald-700">
                        {initials(angler.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/users/${encodeURIComponent(angler.username)}`,
                      )
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {angler.displayName}
                    </p>
                    <p className="truncate text-[11px] text-slate-400">
                      @{angler.username}
                      {angler.postCount > 0
                        ? ` · ${angler.postCount} post${
                            angler.postCount === 1 ? "" : "s"
                          }`
                        : ""}
                    </p>
                  </button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void follow(angler)}
                    disabled={followPending === angler.username}
                    className="shrink-0 rounded-full border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
                  >
                    {followPending === angler.username ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      "Follow"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {followError && (
          <p role="alert" className="mt-3 text-[11px] font-medium text-red-600">
            {followError}
          </p>
        )}
      </section>

      <div className="px-2 py-8 text-center">
        <p className="flex items-center justify-center gap-1 text-xs text-slate-400">
          <Flame size={12} className="text-emerald-500" />
          2026 AnglerHub
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Fish · Explore · Connect
        </p>
      </div>
    </div>
  );
}
