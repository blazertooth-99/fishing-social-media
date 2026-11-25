"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import {
  extractSpotErrorMessage,
  listSpots,
  type ApiFishingSpot,
} from "@/lib/api/fishing-spots";
import {
  extractApiErrorMessage,
  getFeed,
  type ApiPost,
} from "@/lib/api/posts";
import { getMyProfile } from "@/lib/api/profile";
import {
  extractSocialErrorMessage,
  followUser,
  listFollowers,
  listFollowing,
  type ApiFollowUser,
} from "@/lib/api/social";

const FEED_LIMIT = 40;
const SPOT_LIMIT = 50;
const TRENDING_POST_LIMIT = 4;
const TRENDING_HASHTAG_LIMIT = 6;
const RECOMMENDED_SPOT_LIMIT = 3;
const SUGGESTION_LIMIT = 4;
const FOLLOWING_LIMIT = 100;
const FOLLOWERS_LIMIT = 50;
const SPOT_BBOX = "95,-11,141,6";

const HASHTAG_PATTERN = /#[\p{L}\p{N}_]+/gu;

export interface TrendingHashtag {
  tag: string;
  count: number;
}

export interface FollowSuggestion {
  id: string;
  username: string;
  displayName: string;
  avatarMediaId: string | null;
  engagement: number;
  postCount: number;
}

export interface HomeSidebarErrors {
  trending: string | null;
  spots: string | null;
}

function engagement(post: ApiPost): number {
  return (post.like_count ?? 0) + (post.comment_count ?? 0);
}

function recency(post: ApiPost): number {
  return Date.parse(post.created_at) || 0;
}

export function extractHashtags(content: string): string[] {
  const tags = content.match(HASHTAG_PATTERN) ?? [];
  const unique = new Set<string>();
  for (const raw of tags) {
    const tag = raw.slice(1).toLowerCase();
    if (tag.length >= 2) unique.add(tag);
  }
  return [...unique];
}

function comparePosts(a: ApiPost, b: ApiPost): number {
  const score = engagement(b) - engagement(a);
  if (score !== 0) return score;
  return recency(b) - recency(a);
}

function compareSpots(a: ApiFishingSpot, b: ApiFishingSpot): number {
  const rating = (b.average_rating ?? -1) - (a.average_rating ?? -1);
  if (rating !== 0) return rating;
  const reviews = (b.review_count ?? 0) - (a.review_count ?? 0);
  if (reviews !== 0) return reviews;
  return a.name.localeCompare(b.name);
}

function buildTrendingHashtags(posts: ApiPost[]): TrendingHashtag[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of extractHashtags(post.content)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TRENDING_HASHTAG_LIMIT)
    .map(([tag, count]) => ({ tag, count }));
}

function buildSuggestions(
  posts: ApiPost[],
  followers: ApiFollowUser[],
  currentUserId: string | null,
  following: Set<string>,
): FollowSuggestion[] {
  const byUsername = new Map<string, FollowSuggestion>();

  for (const post of posts) {
    if (currentUserId && post.author_id === currentUserId) continue;
    const username = post.author_username?.trim();
    if (!username) continue;
    const key = username.toLowerCase();
    const score = engagement(post);
    const existing = byUsername.get(key);
    if (existing) {
      existing.engagement += score;
      existing.postCount += 1;
    } else {
      byUsername.set(key, {
        id: post.author_id,
        username,
        displayName: post.author_display_name || username,
        avatarMediaId: post.author_avatar_media_id ?? null,
        engagement: score,
        postCount: 1,
      });
    }
  }

  for (const follower of followers) {
    if (currentUserId && follower.user_id === currentUserId) continue;
    const username = follower.username?.trim();
    if (!username) continue;
    const key = username.toLowerCase();
    if (byUsername.has(key)) continue;
    byUsername.set(key, {
      id: follower.user_id,
      username,
      displayName: follower.display_name || username,
      avatarMediaId: follower.avatar_media_id ?? null,
      engagement: 0,
      postCount: 0,
    });
  }

  return [...byUsername.values()]
    .filter(
      (item) =>
        !following.has(item.username.toLowerCase()) &&
        (!currentUserId || item.id !== currentUserId),
    )
    .sort(
      (a, b) =>
        b.engagement - a.engagement ||
        b.postCount - a.postCount ||
        a.displayName.localeCompare(b.displayName),
    )
    .slice(0, SUGGESTION_LIMIT);
}

async function loadFollowContext(): Promise<{
  following: Set<string>;
  followers: ApiFollowUser[];
}> {
  try {
    const profile = await getMyProfile();
    const [following, followers] = await Promise.all([
      listFollowing(profile.username, { limit: FOLLOWING_LIMIT }).catch(
        () => [] as ApiFollowUser[],
      ),
      listFollowers(profile.username, { limit: FOLLOWERS_LIMIT }).catch(
        () => [] as ApiFollowUser[],
      ),
    ]);
    return {
      following: new Set(following.map((user) => user.username.toLowerCase())),
      followers,
    };
  } catch {
    return { following: new Set(), followers: [] };
  }
}

export function useHomeSidebar() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [spots, setSpots] = useState<ApiFishingSpot[]>([]);
  const [followers, setFollowers] = useState<ApiFollowUser[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<HomeSidebarErrors>({
    trending: null,
    spots: null,
  });
  const [followPending, setFollowPending] = useState<string | null>(null);
  const [followError, setFollowError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [feedResult, spotsResult, sessionResult, followResult] =
        await Promise.allSettled([
          getFeed({ limit: FEED_LIMIT }),
          listSpots({ bbox: SPOT_BBOX, limit: SPOT_LIMIT }),
          api.getSession(),
          loadFollowContext(),
        ]);

      if (cancelled) return;

      setPosts(feedResult.status === "fulfilled" ? feedResult.value.items : []);
      setSpots(spotsResult.status === "fulfilled" ? spotsResult.value : []);

      if (sessionResult.status === "fulfilled") {
        setCurrentUserId(sessionResult.value?.data?.user_id ?? null);
      }

      if (followResult.status === "fulfilled") {
        setFollowing(followResult.value.following);
        setFollowers(followResult.value.followers);
      }

      setErrors({
        trending:
          feedResult.status === "rejected"
            ? extractApiErrorMessage(
                feedResult.reason,
                "Failed to load trending posts",
              )
            : null,
        spots:
          spotsResult.status === "rejected"
            ? extractSpotErrorMessage(
                spotsResult.reason,
                "Failed to load recommended spots",
              )
            : null,
      });
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const trendingPosts = useMemo(
    () =>
      posts
        .filter((post) => extractHashtags(post.content).length > 0)
        .sort(comparePosts)
        .slice(0, TRENDING_POST_LIMIT),
    [posts],
  );

  const trendingHashtags = useMemo(
    () => buildTrendingHashtags(posts),
    [posts],
  );

  const recommendedSpots = useMemo(
    () => [...spots].sort(compareSpots).slice(0, RECOMMENDED_SPOT_LIMIT),
    [spots],
  );

  const suggestions = useMemo(
    () => buildSuggestions(posts, followers, currentUserId, following),
    [posts, followers, currentUserId, following],
  );

  const follow = useCallback(async (suggestion: FollowSuggestion) => {
    setFollowPending(suggestion.username);
    setFollowError(null);
    try {
      await followUser(suggestion.username);
      setFollowing((prev) => {
        const next = new Set(prev);
        next.add(suggestion.username.toLowerCase());
        return next;
      });
    } catch (err) {
      setFollowError(
        extractSocialErrorMessage(err, "Could not follow this angler"),
      );
    } finally {
      setFollowPending(null);
    }
  }, []);

  return {
    trendingPosts,
    trendingHashtags,
    recommendedSpots,
    suggestions,
    loading,
    errors,
    currentUserId,
    follow,
    followPending,
    followError,
  };
}

export type HomeSidebarState = ReturnType<typeof useHomeSidebar>;
