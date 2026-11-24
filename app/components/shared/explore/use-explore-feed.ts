"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import {
  extractApiErrorMessage,
  getFeed,
  type ApiPost,
} from "@/lib/api/posts";

const DEFAULT_FEED_LIMIT = 40;
const RECOMMENDED_LIMIT = 4;
const TRENDING_LIMIT = 5;

export interface TrendingSearch {
  label: string;
  query: string;
  meta: string;
}

const FALLBACK_TRENDING_SEARCHES: TrendingSearch[] = [
  { label: "Barramundi", query: "barramundi", meta: "Popular search" },
  { label: "Peacock bass", query: "peacock bass", meta: "Popular search" },
  { label: "Casting", query: "casting", meta: "Popular search" },
  { label: "Lure fishing", query: "lure fishing", meta: "Popular search" },
  { label: "Snakehead", query: "snakehead", meta: "Popular search" },
];

function engagement(post: ApiPost): number {
  return (post.like_count ?? 0) + (post.comment_count ?? 0);
}

function hasMedia(post: ApiPost): boolean {
  return Array.isArray(post.media) && post.media.length > 0;
}

function recency(post: ApiPost): number {
  return Date.parse(post.created_at) || 0;
}

function compareEngagement(a: ApiPost, b: ApiPost): number {
  return engagement(b) - engagement(a) || recency(b) - recency(a);
}

function pickRecommended(posts: ApiPost[], limit: number): ApiPost[] {
  const sorted = [...posts].sort((a, b) => {
    const media = Number(hasMedia(b)) - Number(hasMedia(a));
    if (media !== 0) return media;
    return compareEngagement(a, b);
  });

  const picked: ApiPost[] = [];
  const authors = new Set<string>();

  for (const post of sorted) {
    if (picked.length >= limit) break;
    if (authors.has(post.author_id)) continue;
    authors.add(post.author_id);
    picked.push(post);
  }

  for (const post of sorted) {
    if (picked.length >= limit) break;
    if (!picked.includes(post)) picked.push(post);
  }

  return picked;
}

function buildTrendingSearches(posts: ApiPost[]): TrendingSearch[] {
  const counts = new Map<string, number>();

  for (const post of posts) {
    const tags = post.content.match(/#[\p{L}\p{N}_]+/gu) ?? [];
    for (const raw of tags) {
      const tag = raw.slice(1).toLowerCase();
      if (tag.length < 2) continue;
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  const items: TrendingSearch[] = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TRENDING_LIMIT)
    .map(([tag, count]) => ({
      label: `#${tag}`,
      query: tag,
      meta: `${count} recent post${count === 1 ? "" : "s"}`,
    }));

  const seen = new Set(items.map((item) => item.query.toLowerCase()));
  for (const fallback of FALLBACK_TRENDING_SEARCHES) {
    if (items.length >= TRENDING_LIMIT) break;
    if (seen.has(fallback.query.toLowerCase())) continue;
    items.push(fallback);
    seen.add(fallback.query.toLowerCase());
  }

  return items;
}

export function useExploreFeed(opts?: { limit?: number }) {
  const limit = opts?.limit ?? DEFAULT_FEED_LIMIT;
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { items } = await getFeed({ limit });
      setPosts(items);
      setError(null);
    } catch (err) {
      setError(
        extractApiErrorMessage(err, "Failed to load recommended posts"),
      );
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    let cancelled = false;

    getFeed({ limit })
      .then(({ items }) => {
        if (cancelled) return;
        setPosts(items);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          extractApiErrorMessage(err, "Failed to load recommended posts"),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    api
      .getSession()
      .then((session) => {
        if (!cancelled) {
          setCurrentUserId(session?.data?.user_id ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setCurrentUserId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [limit]);

  const recommendedPosts = useMemo(
    () => pickRecommended(posts, RECOMMENDED_LIMIT),
    [posts],
  );

  const trendingPosts = useMemo(
    () => [...posts].sort(compareEngagement).slice(0, TRENDING_LIMIT),
    [posts],
  );

  const trendingSearches = useMemo(
    () => buildTrendingSearches(posts),
    [posts],
  );

  return {
    recommendedPosts,
    trendingPosts,
    trendingSearches,
    currentUserId,
    loading,
    error,
    reload,
  };
}

export type ExploreFeedState = ReturnType<typeof useExploreFeed>;
