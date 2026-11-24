"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Compass,
  Flame,
  Heart,
  MapPin,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  Users,
  Waves,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getAvatarUrl } from "@/lib/api/media";
import type { ApiCommunity } from "@/lib/api/communities";
import {
  resolveMediaUrl,
  type ApiPost,
} from "@/lib/api/posts";
import { formatSpotRating } from "@/lib/api/fishing-spots";
import { useJoinedCommunities } from "@/app/components/shared/community/use-joined-communities";
import {
  useTrendingContent,
  type TrendingPerson,
} from "@/app/components/shared/community/use-trending-content";

type TrendingTab = "communities" | "posts" | "people" | "spots";

const TRENDING_TABS = [
  { id: "communities" as const, label: "Communities", icon: Users },
  { id: "posts" as const, label: "Posts", icon: MessageCircle },
  { id: "people" as const, label: "Anglers", icon: UserRound },
  { id: "spots" as const, label: "Spots", icon: MapPin },
];

interface DesktopCommunityRightSidebarProps {
  onCreateCommunity?: () => void;
  onFocusSearch?: () => void;
}

function initials(name: string): string {
  return name
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function communityPath(community: ApiCommunity): string {
  return `/community/${encodeURIComponent(community.slug || community.id)}`;
}

function CommunityAvatar({ community }: { community: ApiCommunity }) {
  return (
    <Avatar className="h-10 w-10 rounded-xl border border-slate-100">
      <AvatarImage
        src={getAvatarUrl(community.avatar_media_id) ?? undefined}
        alt={community.name}
        className="rounded-xl object-cover"
      />
      <AvatarFallback className="rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">
        {initials(community.name)}
      </AvatarFallback>
    </Avatar>
  );
}

function PersonAvatar({ person }: { person: TrendingPerson }) {
  return (
    <Avatar className="h-10 w-10 border border-slate-100">
      <AvatarImage
        src={getAvatarUrl(person.avatarMediaId) ?? undefined}
        alt={person.displayName}
        className="object-cover"
      />
      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-xs font-bold text-white">
        {initials(person.displayName || person.username)}
      </AvatarFallback>
    </Avatar>
  );
}

function PostThumbnail({ post }: { post: ApiPost }) {
  const media = post.media?.[0];
  const src = media
    ? resolveMediaUrl(media.thumbnail_url || media.display_url)
    : null;

  if (!src) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
        <MessageCircle size={16} />
      </span>
    );
  }

  return (
    <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100">
      <Image
        src={src}
        alt=""
        fill
        sizes="40px"
        className="object-cover"
        unoptimized
      />
    </span>
  );
}

function SidebarSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded bg-slate-100" />
            <div className="h-2.5 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendingEmpty({
  tab,
  onCreateCommunity,
  onFocusSearch,
}: {
  tab: TrendingTab;
  onCreateCommunity?: () => void;
  onFocusSearch?: () => void;
}) {
  const copy = {
    communities: {
      title: "No communities yet",
      body: "Start the first fishing community and invite fellow anglers.",
    },
    posts: {
      title: "No posts yet",
      body: "New catches and stories will show up here as they are shared.",
    },
    people: {
      title: "No anglers yet",
      body: "Top anglers appear here as posts start collecting engagement.",
    },
    spots: {
      title: "No spots yet",
      body: "Add the first fishing spot to put it on the community map.",
    },
  }[tab];

  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-center">
      <p className="text-xs font-semibold text-slate-700">{copy.title}</p>
      <p className="mt-1 text-[11px] leading-5 text-slate-400">{copy.body}</p>

      {tab === "communities" && (
        <Button
          type="button"
          size="sm"
          onClick={onCreateCommunity}
          className="mt-3 gap-1.5 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600"
        >
          <Plus size={14} />
          Create community
        </Button>
      )}

      {(tab === "posts" || tab === "people") && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onFocusSearch}
          className="mt-3 rounded-xl border-slate-200"
        >
          Find a community
        </Button>
      )}
    </div>
  );
}

export default function DesktopCommunityRightSidebar({
  onCreateCommunity,
  onFocusSearch,
}: DesktopCommunityRightSidebarProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TrendingTab>("communities");

  const {
    communities,
    posts,
    people,
    spots,
    errors,
    loading: trendingLoading,
    reload: reloadTrending,
  } = useTrendingContent(5);

  const {
    communities: joined,
    isLoading: joinedLoading,
    error: joinedError,
    isLoggedOut,
    reload: reloadJoined,
  } = useJoinedCommunities({ limit: 20, maxPages: 5 });

  const joinedIds = useMemo(
    () => new Set(joined.map((community) => community.id)),
    [joined],
  );

  const primaryJoined = joined[0] ?? null;

  function openCommunity(community: ApiCommunity) {
    router.push(communityPath(community));
  }

  function openPost(post: ApiPost) {
    if (post.community_id) {
      router.push(`/community/${encodeURIComponent(post.community_id)}`);
      return;
    }
    router.push("/feed");
  }

  const activeError =
    activeTab === "communities"
      ? errors.communities
      : activeTab === "spots"
        ? errors.spots
        : errors.posts;

  const activeCount =
    activeTab === "communities"
      ? communities.length
      : activeTab === "posts"
        ? posts.length
        : activeTab === "people"
          ? people.length
          : spots.length;

  const activeLabel =
    TRENDING_TABS.find((tab) => tab.id === activeTab)?.label ?? "trending";

  const isInitialLoading = trendingLoading && activeCount === 0;

  return (
    <aside className="sticky top-8 space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Community shortcuts</h2>
            <p className="mt-1 text-xs text-slate-400">
              Jump straight into the conversation
            </p>
          </div>
          <Compass size={20} className="text-cyan-500" />
        </div>

        <div className="space-y-2">
          <Button
            type="button"
            onClick={onCreateCommunity}
            className="w-full justify-start gap-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600"
          >
            <Plus size={16} />
            Create community
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onFocusSearch}
            className="w-full justify-start gap-2 rounded-xl border-slate-200"
          >
            <Search size={16} />
            Find a community
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Trending now</h2>
            <p className="mt-1 text-xs text-slate-400">
              Live activity across FishConnect
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => void reloadTrending()}
              aria-label="Refresh trending content"
              className="h-8 w-8 rounded-full text-slate-400 hover:text-cyan-600"
            >
              <RefreshCw
                size={15}
                className={trendingLoading ? "animate-spin" : ""}
              />
            </Button>
            <Flame size={20} className="text-orange-500" />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100/70 p-1">
          {TRENDING_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-semibold transition-all ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {isInitialLoading ? (
          <SidebarSkeleton rows={4} />
        ) : activeError && activeCount === 0 ? (
          <div className="rounded-2xl bg-red-50 p-3 text-xs text-red-600">
            <p>{activeError}</p>
            <button
              type="button"
              onClick={() => void reloadTrending()}
              className="mt-1.5 font-semibold underline"
            >
              Try again
            </button>
          </div>
        ) : activeCount === 0 ? (
          <TrendingEmpty
            tab={activeTab}
            onCreateCommunity={onCreateCommunity}
            onFocusSearch={onFocusSearch}
          />
        ) : activeTab === "communities" ? (
          <div className="space-y-1">
            {communities.map((community, index) => {
              const isJoined = joinedIds.has(community.id);

              return (
                <button
                  key={community.id}
                  type="button"
                  onClick={() => openCommunity(community)}
                  className="group flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="w-4 shrink-0 text-center text-xs font-bold text-slate-300">
                    {index + 1}
                  </span>

                  <CommunityAvatar community={community} />

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-slate-800">
                        {community.name}
                      </span>
                      {isJoined && (
                        <Badge
                          variant="secondary"
                          className="shrink-0 rounded-full bg-emerald-50 px-1.5 text-[10px] text-emerald-700"
                        >
                          Joined
                        </Badge>
                      )}
                    </span>

                    <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                      <Users size={11} />
                      {(community.member_count ?? 0).toLocaleString()} members
                    </span>
                  </span>

                  <ArrowUpRight
                    size={16}
                    className="shrink-0 text-slate-300 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-500"
                  />
                </button>
              );
            })}
          </div>
        ) : activeTab === "posts" ? (
          <div className="space-y-1">
            {posts.map((post, index) => (
              <button
                key={post.id}
                type="button"
                onClick={() => openPost(post)}
                className="group flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors hover:bg-slate-50"
              >
                <span className="w-4 shrink-0 text-center text-xs font-bold text-slate-300">
                  {index + 1}
                </span>

                <PostThumbnail post={post} />

                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-xs font-medium leading-5 text-slate-700">
                    {post.content.trim() || "Photo post"}
                  </span>

                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
                    <span className="truncate">@{post.author_username}</span>
                    <span className="inline-flex items-center gap-0.5">
                      <Heart size={10} />
                      {post.like_count ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <MessageCircle size={10} />
                      {post.comment_count ?? 0}
                    </span>
                  </span>
                </span>

                <ArrowUpRight
                  size={16}
                  className="shrink-0 text-slate-300 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-500"
                />
              </button>
            ))}
          </div>
        ) : activeTab === "people" ? (
          <div className="space-y-1">
            {people.map((person, index) => (
              <button
                key={person.id}
                type="button"
                onClick={() =>
                  router.push(`/users/${encodeURIComponent(person.username)}`)
                }
                className="group flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors hover:bg-slate-50"
              >
                <span className="w-4 shrink-0 text-center text-xs font-bold text-slate-300">
                  {index + 1}
                </span>

                <PersonAvatar person={person} />

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800">
                    {person.displayName}
                  </span>

                  <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-slate-400">
                    <span className="truncate">@{person.username}</span>
                    <span>·</span>
                    <span>
                      {person.postCount} post{person.postCount === 1 ? "" : "s"}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <Heart size={10} />
                      {person.engagement}
                    </span>
                  </span>
                </span>

                <ArrowUpRight
                  size={16}
                  className="shrink-0 text-slate-300 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-500"
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {spots.map((spot, index) => (
              <button
                key={spot.id}
                type="button"
                onClick={() => router.push("/fishing-spots")}
                className="group flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors hover:bg-slate-50"
              >
                <span className="w-4 shrink-0 text-center text-xs font-bold text-slate-300">
                  {index + 1}
                </span>

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white">
                  <Waves size={16} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800">
                    {spot.name}
                  </span>

                  <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-slate-400">
                    <span>{spot.water_type}</span>
                    <span>·</span>
                    <span>{formatSpotRating(spot.average_rating, spot.review_count)}</span>
                    {typeof spot.review_count === "number" && (
                      <span>
                        ({spot.review_count} review
                        {spot.review_count === 1 ? "" : "s"})
                      </span>
                    )}
                  </span>
                </span>

                <ArrowUpRight
                  size={16}
                  className="shrink-0 text-slate-300 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-500"
                />
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (activeTab === "communities") {
              onFocusSearch?.();
              return;
            }
            if (activeTab === "spots") {
              router.push("/fishing-spots");
              return;
            }
            router.push("/feed");
          }}
          className="mt-3 w-full border-t border-slate-100 pt-3 text-left text-[11px] font-semibold text-cyan-600 hover:text-cyan-700"
        >
          View all {activeLabel.toLowerCase()}
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Your communities</h2>
            <p className="mt-1 text-xs text-slate-400">
              Quick links to groups you joined
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => void reloadJoined()}
              aria-label="Refresh your communities"
              className="h-8 w-8 rounded-full text-slate-400 hover:text-cyan-600"
            >
              <RefreshCw
                size={15}
                className={joinedLoading ? "animate-spin" : ""}
              />
            </Button>
            <Users size={19} className="text-cyan-500" />
          </div>
        </div>

        {joinedLoading && joined.length === 0 ? (
          <SidebarSkeleton rows={3} />
        ) : joinedError && joined.length === 0 ? (
          <div className="rounded-2xl bg-red-50 p-3 text-xs text-red-600">
            <p>{joinedError}</p>
            <button
              type="button"
              onClick={() => void reloadJoined()}
              className="mt-1.5 font-semibold underline"
            >
              Try again
            </button>
          </div>
        ) : joined.length > 0 ? (
          <div className="space-y-1">
            {joined.slice(0, 4).map((community) => {
              const role =
                typeof community.my_role === "string" && community.my_role
                  ? community.my_role
                  : null;

              return (
                <button
                  key={community.id}
                  type="button"
                  onClick={() => openCommunity(community)}
                  className="group flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors hover:bg-slate-50"
                >
                  <CommunityAvatar community={community} />

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-slate-800">
                        {community.name}
                      </span>
                      {role && (
                        <Badge
                          variant="secondary"
                          className="shrink-0 rounded-full bg-cyan-50 px-1.5 text-[10px] text-cyan-700"
                        >
                          {role}
                        </Badge>
                      )}
                    </span>

                    <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                      <Users size={11} />
                      {(community.member_count ?? 0).toLocaleString()} members
                    </span>
                  </span>

                  <ArrowUpRight
                    size={16}
                    className="shrink-0 text-slate-300 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-500"
                  />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-4 text-center">
            <p className="text-xs font-semibold text-slate-700">
              {isLoggedOut
                ? "Log in to see your communities"
                : "No communities joined yet"}
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              {isLoggedOut
                ? "Your joined communities will appear here as shortcuts."
                : "Join a community and it will show up here for quick access."}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onFocusSearch}
              className="mt-3 rounded-xl border-slate-200"
            >
              Browse communities
            </Button>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5 text-white shadow-sm">
        <Flame size={22} />

        <h3 className="mt-4 font-bold">Share your experience</h3>

        <p className="mt-2 text-sm leading-6 text-cyan-50">
          {primaryJoined
            ? `Post an update in ${primaryJoined.name} and help fellow anglers learn from your catch.`
            : "Start a community, ask a question, or share a catch with fellow anglers."}
        </p>

        <Button
          type="button"
          onClick={() =>
            primaryJoined ? openCommunity(primaryJoined) : onCreateCommunity?.()
          }
          className="mt-4 w-full rounded-xl bg-white text-cyan-700 hover:bg-cyan-50"
        >
          {primaryJoined ? "Start a discussion" : "Create a community"}
        </Button>

        <Badge className="mt-4 rounded-full bg-white/20 text-white hover:bg-white/30">
          Fishing knowledge
        </Badge>
      </section>
    </aside>
  );
}
