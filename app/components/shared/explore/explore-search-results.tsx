"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Fish,
  Hash,
  MapPin,
  MapPinned,
  MessageCircle,
  SearchX,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { getAvatarUrl } from "@/lib/api/media";
import { formatRelativeTime, resolveMediaUrl } from "@/lib/api/posts";
import {
  formatSpotDistance,
  formatSpotRating,
} from "@/lib/api/fishing-spots";
import {
  getSearchMediaThumbnailUrl,
  type SearchCommunity,
  type SearchEvent,
  type SearchGear,
  type SearchHashtag,
  type SearchPlace,
  type SearchPost,
  type SearchSpecies,
  type SearchSpot,
  type SearchUser,
  type UnifiedSearchResults,
} from "@/lib/api/search";

const CATEGORY_ORDER = [
  { key: "users", label: "Anglers", icon: UserRound },
  { key: "posts", label: "Posts", icon: MessageCircle },
  { key: "communities", label: "Communities", icon: Users },
  { key: "spots", label: "Spots", icon: MapPin },
  { key: "places", label: "Places", icon: MapPinned },
  { key: "species", label: "Species", icon: Fish },
  { key: "gear", label: "Gear", icon: Wrench },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "hashtags", label: "Hashtags", icon: Hash },
] as const;

type SearchCategory = (typeof CATEGORY_ORDER)[number]["key"];

interface ExploreSearchResultsProps {
  query: string;
  results: UnifiedSearchResults;
  isSearching: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectHashtag: (tag: string) => void;
}

function initials(name: string): string {
  return name
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ResultRow({
  visual,
  title,
  subtitle,
  meta,
  multiline = false,
  onClick,
}: {
  visual: ReactNode;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  multiline?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="shrink-0">{visual}</span>

      <span className="min-w-0 flex-1 text-left">
        <span
          className={
            multiline
              ? "line-clamp-2 text-xs font-medium leading-5 text-slate-700"
              : "block truncate text-sm font-semibold text-slate-800"
          }
        >
          {title}
        </span>

        {subtitle && (
          <span className="mt-0.5 block truncate text-xs text-slate-400">
            {subtitle}
          </span>
        )}

        {meta && (
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
            {meta}
          </span>
        )}
      </span>

      {onClick && (
        <ArrowUpRight
          size={15}
          className="shrink-0 text-slate-300 transition-colors group-hover:text-cyan-500"
        />
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-white"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex w-full items-center gap-2.5 rounded-xl p-2">
      {content}
    </div>
  );
}

function PersonAvatar({
  avatarMediaId,
  name,
}: {
  avatarMediaId: string | null;
  name: string;
}) {
  return (
    <Avatar className="h-10 w-10 border border-slate-100">
      <AvatarImage
        src={getAvatarUrl(avatarMediaId) ?? undefined}
        alt={name}
        className="object-cover"
      />
      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-xs font-bold text-white">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

function CommunityAvatar({
  avatarMediaId,
  name,
}: {
  avatarMediaId: string | null;
  name: string;
}) {
  return (
    <Avatar className="h-10 w-10 rounded-xl border border-slate-100">
      <AvatarImage
        src={getAvatarUrl(avatarMediaId) ?? undefined}
        alt={name}
        className="rounded-xl object-cover"
      />
      <AvatarFallback className="rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

function PostThumbnail({ mediaThumbnailId }: { mediaThumbnailId: string | null }) {
  const src = getSearchMediaThumbnailUrl(mediaThumbnailId);

  if (!src) {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
        <MessageCircle size={16} />
      </span>
    );
  }

  return (
    <span className="relative block h-10 w-10 overflow-hidden rounded-xl bg-slate-100">
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

function SpeciesThumbnail({
  photoUrl,
  name,
}: {
  photoUrl: string | null;
  name: string;
}) {
  const src = resolveMediaUrl(photoUrl);

  if (!src) {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white">
        <Fish size={16} />
      </span>
    );
  }

  return (
    <span className="relative block h-10 w-10 overflow-hidden rounded-xl bg-slate-100">
      <Image
        src={src}
        alt={name}
        fill
        sizes="40px"
        className="object-cover"
        unoptimized
      />
    </span>
  );
}

function IconBubble({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
      {children}
    </span>
  );
}

function formatEventDate(startsAt: string, endsAt: string | null): string {
  const start = Date.parse(startsAt);
  if (Number.isNaN(start)) return "";

  const startLabel = new Date(start).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!endsAt) return startLabel;

  const end = Date.parse(endsAt);
  if (Number.isNaN(end) || end === start) return startLabel;

  return `${startLabel} – ${new Date(end).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;
}

function tabClass(isActive: boolean): string {
  return `shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
    isActive
      ? "bg-cyan-500 text-white"
      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
  }`;
}

export default function ExploreSearchResults({
  query,
  results,
  isSearching,
  error,
  onRetry,
  onSelectHashtag,
}: ExploreSearchResultsProps) {
  const router = useRouter();
  const [active, setActive] = useState<SearchCategory | "all">("all");

  const available = CATEGORY_ORDER.filter(
    ({ key }) => results[key].length > 0,
  );
  const total = available.reduce(
    (sum, { key }) => sum + results[key].length,
    0,
  );
  const current =
    active !== "all" && available.some(({ key }) => key === active)
      ? active
      : "all";
  const sections =
    current === "all"
      ? available
      : available.filter(({ key }) => key === current);

  function renderItem(
    category: SearchCategory,
    item: unknown,
    index: number,
  ): ReactNode {
    switch (category) {
      case "users": {
        const user = item as SearchUser;
        return (
          <ResultRow
            key={`users-${user.id}-${index}`}
            visual={
              <PersonAvatar
                avatarMediaId={user.avatar_media_id}
                name={user.display_name || user.username}
              />
            }
            title={user.display_name || user.username}
            subtitle={`@${user.username}`}
            meta={user.bio ? <span>{user.bio}</span> : undefined}
            onClick={() =>
              router.push(`/users/${encodeURIComponent(user.username)}`)
            }
          />
        );
      }

      case "posts": {
        const post = item as SearchPost;
        return (
          <ResultRow
            key={`posts-${post.id}-${index}`}
            visual={<PostThumbnail mediaThumbnailId={post.media_thumbnail_id} />}
            title={post.content_snippet || "Photo post"}
            subtitle={`@${post.author.username} · ${formatRelativeTime(post.created_at)}`}
            multiline
            onClick={() => router.push("/feed")}
          />
        );
      }

      case "communities": {
        const community = item as SearchCommunity;
        return (
          <ResultRow
            key={`communities-${community.id}-${index}`}
            visual={
              <CommunityAvatar
                avatarMediaId={community.avatar_media_id}
                name={community.name}
              />
            }
            title={community.name}
            subtitle={community.description || "Community"}
            meta={
              <>
                <span>
                  {(community.member_count ?? 0).toLocaleString()} members
                </span>
                {community.slug && <span>·</span>}
                {community.slug && <span>/{community.slug}</span>}
              </>
            }
            onClick={() =>
              router.push(
                `/community/${encodeURIComponent(
                  community.slug || community.id,
                )}`,
              )
            }
          />
        );
      }

      case "spots": {
        const spot = item as SearchSpot;
        return (
          <ResultRow
            key={`spots-${spot.id}-${index}`}
            visual={
              <IconBubble>
                <MapPin size={16} />
              </IconBubble>
            }
            title={spot.name}
            subtitle={`${spot.water_type} · ${formatSpotRating(
              spot.rating_average,
              spot.review_count,
            )} rating`}
            meta={
              <>
                <span>
                  {spot.review_count} review
                  {spot.review_count === 1 ? "" : "s"}
                </span>
                {spot.distance_meters !== null && (
                  <>
                    <span>·</span>
                    <span>{formatSpotDistance(spot.distance_meters)}</span>
                  </>
                )}
              </>
            }
            onClick={() => router.push("/fishing-spots")}
          />
        );
      }

      case "places": {
        const place = item as SearchPlace;
        return (
          <ResultRow
            key={`places-${place.id}-${index}`}
            visual={
              <IconBubble>
                <MapPinned size={16} />
              </IconBubble>
            }
            title={place.name}
            subtitle={place.address}
            meta={
              <>
                <span>{place.water_type}</span>
                {place.is_verified && (
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-emerald-50 px-1.5 text-[10px] text-emerald-700"
                  >
                    Verified
                  </Badge>
                )}
                <span>
                  {formatSpotRating(
                    place.rating_average,
                    place.review_count,
                  )}{" "}
                  rating
                </span>
                {place.distance_meters !== null && (
                  <>
                    <span>·</span>
                    <span>{formatSpotDistance(place.distance_meters)}</span>
                  </>
                )}
              </>
            }
            onClick={() => router.push("/fishing-spots")}
          />
        );
      }

      case "species": {
        const species = item as SearchSpecies;
        return (
          <ResultRow
            key={`species-${species.id}-${index}`}
            visual={
              <SpeciesThumbnail
                photoUrl={species.photo_url}
                name={species.common_name}
              />
            }
            title={species.common_name}
            subtitle={species.scientific_name}
            meta={<span>{species.water_type}</span>}
            onClick={() => router.push("/fishing-spots")}
          />
        );
      }

      case "gear": {
        const gear = item as SearchGear;
        const name = [gear.brand, gear.model].filter(Boolean).join(" ");
        return (
          <ResultRow
            key={`gear-${gear.brand}-${gear.model}-${index}`}
            visual={
              <IconBubble>
                <Wrench size={16} />
              </IconBubble>
            }
            title={name || "Fishing gear"}
            subtitle={gear.gear_type}
          />
        );
      }

      case "events": {
        const event = item as SearchEvent;
        const date = formatEventDate(event.starts_at, event.ends_at);
        const communityId = event.community_id;
        return (
          <ResultRow
            key={`events-${event.id}-${index}`}
            visual={
              <IconBubble>
                <CalendarDays size={16} />
              </IconBubble>
            }
            title={event.title}
            subtitle={event.description_snippet}
            meta={
              <>
                {date && <span>{date}</span>}
                {date && event.status && <span>·</span>}
                <span>{event.status}</span>
                {event.location_name && <span>·</span>}
                {event.location_name && <span>{event.location_name}</span>}
              </>
            }
            onClick={
              communityId
                ? () =>
                    router.push(
                      `/community/${encodeURIComponent(communityId)}`,
                    )
                : undefined
            }
          />
        );
      }

      case "hashtags": {
        const hashtag = item as SearchHashtag;
        const tag = hashtag.tag.replace(/^#/, "");
        return (
          <ResultRow
            key={`hashtags-${hashtag.tag}-${index}`}
            visual={
              <IconBubble>
                <Hash size={16} />
              </IconBubble>
            }
            title={`#${tag}`}
            subtitle={`${hashtag.post_count} post${
              hashtag.post_count === 1 ? "" : "s"
            }`}
            onClick={() => onSelectHashtag(tag)}
          />
        );
      }
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">
            Search results
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            &ldquo;{query}&rdquo;
          </h2>
        </div>

        {!isSearching && !error && total > 0 && (
          <Badge
            variant="secondary"
            className="rounded-full bg-slate-100 text-slate-600"
          >
            {total} result{total === 1 ? "" : "s"}
          </Badge>
        )}
      </div>

      {isSearching ? (
        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex animate-pulse items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 rounded bg-slate-100" />
                <div className="h-2.5 w-1/2 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-5 rounded-2xl bg-red-50 p-4 text-xs text-red-600">
          <p>{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-1.5 font-semibold underline"
          >
            Try again
          </button>
        </div>
      ) : total === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <SearchX size={24} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            No matches for &ldquo;{query}&rdquo;
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Try a different keyword, fish species, angler, community, or spot.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActive("all")}
              className={tabClass(current === "all")}
            >
              All {total}
            </button>

            {available.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                className={tabClass(current === key)}
              >
                {label} {results[key].length}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {sections.map(({ key, label, icon: Icon }) => {
              const items = results[key];
              const shown = current === "all" ? items.slice(0, 3) : items;

              return (
                <section
                  key={key}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                >
                  <div className="mb-1 flex items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-2">
                      <Icon size={15} className="text-cyan-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        {label}
                      </h3>
                      <span className="rounded-full bg-white px-1.5 text-[10px] font-semibold text-slate-400">
                        {items.length}
                      </span>
                    </div>

                    {current === "all" && items.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setActive(key)}
                        className="text-[11px] font-semibold text-cyan-600 hover:text-cyan-700"
                      >
                        View all
                      </button>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {shown.map((item, index) => renderItem(key, item, index))}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
