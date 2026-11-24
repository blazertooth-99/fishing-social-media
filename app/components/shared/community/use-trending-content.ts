"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  COMMUNITY_MEMBERSHIP_EVENT,
  extractCommunityErrorMessage,
  listCommunities,
  type ApiCommunity,
} from "@/lib/api/communities";
import {
  extractApiErrorMessage,
  getFeed,
  type ApiPost,
} from "@/lib/api/posts";
import {
  extractSpotErrorMessage,
  listSpots,
  type ApiFishingSpot,
} from "@/lib/api/fishing-spots";

const COMMUNITY_LIMIT = 50;
const FEED_LIMIT = 40;
const SPOT_LIMIT = 20;

export interface TrendingPerson {
  id: string;
  username: string;
  displayName: string;
  avatarMediaId: string | null;
  engagement: number;
  postCount: number;
}

export interface TrendingErrors {
  communities: string | null;
  posts: string | null;
  spots: string | null;
}

interface TrendingData {
  communities: ApiCommunity[];
  posts: ApiPost[];
  spots: ApiFishingSpot[];
  errors: TrendingErrors;
}

const EMPTY_DATA: TrendingData = {
  communities: [],
  posts: [],
  spots: [],
  errors: { communities: null, posts: null, spots: null },
};

function engagementScore(post: ApiPost): number {
  return (post.like_count ?? 0) + (post.comment_count ?? 0);
}

function compareCommunities(a: ApiCommunity, b: ApiCommunity): number {
  const members = (b.member_count ?? 0) - (a.member_count ?? 0);
  if (members !== 0) return members;

  const posts = (b.post_count ?? 0) - (a.post_count ?? 0);
  if (posts !== 0) return posts;

  const events = (b.event_count ?? 0) - (a.event_count ?? 0);
  if (events !== 0) return events;

  return a.name.localeCompare(b.name);
}

function comparePosts(a: ApiPost, b: ApiPost): number {
  const score = engagementScore(b) - engagementScore(a);
  if (score !== 0) return score;

  const aTime = Date.parse(a.created_at) || 0;
  const bTime = Date.parse(b.created_at) || 0;
  return bTime - aTime;
}

function compareSpots(a: ApiFishingSpot, b: ApiFishingSpot): number {
  const rating = (b.average_rating ?? -1) - (a.average_rating ?? -1);
  if (rating !== 0) return rating;

  const reviews = (b.review_count ?? 0) - (a.review_count ?? 0);
  if (reviews !== 0) return reviews;

  return a.name.localeCompare(b.name);
}

async function fetchTrendingData(): Promise<TrendingData> {
  const [communitiesResult, feedResult, spotsResult] = await Promise.allSettled([
    listCommunities({ limit: COMMUNITY_LIMIT }),
    getFeed({ limit: FEED_LIMIT }),
    listSpots({ lat: 0, lng: 1, limit: SPOT_LIMIT }),
  ]);

  return {
    communities:
      communitiesResult.status === "fulfilled"
        ? communitiesResult.value.items
        : [],
    posts: feedResult.status === "fulfilled" ? feedResult.value.items : [],
    spots: spotsResult.status === "fulfilled" ? spotsResult.value : [],
    errors: {
      communities:
        communitiesResult.status === "rejected"
          ? extractCommunityErrorMessage(
              communitiesResult.reason,
              "Failed to load trending communities",
            )
          : null,
      posts:
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
              "Failed to load trending spots",
            )
          : null,
    },
  };
}

function buildPeople(posts: ApiPost[], limit: number): TrendingPerson[] {
  const byAuthor = new Map<string, TrendingPerson>();

  for (const post of posts) {
    const score = engagementScore(post);
    const current = byAuthor.get(post.author_id);
    if (current) {
      byAuthor.set(post.author_id, {
        ...current,
        engagement: current.engagement + score,
        postCount: current.postCount + 1,
      });
    } else {
      byAuthor.set(post.author_id, {
        id: post.author_id,
        username: post.author_username,
        displayName: post.author_display_name || post.author_username,
        avatarMediaId: post.author_avatar_media_id ?? null,
        engagement: score,
        postCount: 1,
      });
    }
  }

  return [...byAuthor.values()]
    .sort(
      (a, b) =>
        b.engagement - a.engagement || b.postCount - a.postCount,
    )
    .slice(0, limit);
}

export function useTrendingContent(limit = 5) {
  const [data, setData] = useState<TrendingData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      setData(await fetchTrendingData());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchTrendingData()
      .then((next) => {
        if (cancelled) return;
        setData(next);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setData({
          ...EMPTY_DATA,
          errors: {
            communities: extractCommunityErrorMessage(
              err,
              "Failed to load trending communities",
            ),
            posts: extractApiErrorMessage(err, "Failed to load trending posts"),
            spots: extractSpotErrorMessage(
              err,
              "Failed to load trending spots",
            ),
          },
        });
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onMembershipChanged() {
      void load(false);
    }
    window.addEventListener(COMMUNITY_MEMBERSHIP_EVENT, onMembershipChanged);
    return () => {
      window.removeEventListener(
        COMMUNITY_MEMBERSHIP_EVENT,
        onMembershipChanged,
      );
    };
  }, [load]);

  const communities = useMemo(
    () => [...data.communities].sort(compareCommunities).slice(0, limit),
    [data.communities, limit],
  );

  const posts = useMemo(
    () => [...data.posts].sort(comparePosts).slice(0, limit),
    [data.posts, limit],
  );

  const spots = useMemo(
    () => [...data.spots].sort(compareSpots).slice(0, limit),
    [data.spots, limit],
  );

  const people = useMemo(
    () => buildPeople(data.posts, limit),
    [data.posts, limit],
  );

  return {
    communities,
    posts,
    people,
    spots,
    errors: data.errors,
    loading,
    reload: useCallback(() => void load(), [load]),
  };
}
