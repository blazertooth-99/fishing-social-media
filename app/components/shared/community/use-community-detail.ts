"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createCommunityPost,
  extractCommunityErrorMessage,
  extractCommunityErrorMessages,
  getCommunityByIdOrSlug,
  joinCommunity,
  leaveCommunity,
  listCommunityMembers,
  listCommunityPosts,
  markCommunityJoined,
  markCommunityLeft,
  notifyCommunityMembershipChanged,
  withMembershipFlag,
  type ApiCommunity,
  type ApiCommunityMember,
  type ApiCommunityPost,
} from "@/lib/api/communities";

export type CommunityDetailTab = "posts" | "members";

export function useCommunityDetail(slug: string) {
  const [community, setCommunity] = useState<ApiCommunity | null>(null);
  const [members, setMembers] = useState<ApiCommunityMember[]>([]);
  const [posts, setPosts] = useState<ApiCommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<CommunityDetailTab>("posts");

  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipError, setMembershipError] = useState<string | null>(null);

  const [composer, setComposer] = useState("");
  const [posting, setPosting] = useState(false);
  const [postErrors, setPostErrors] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const detail = await getCommunityByIdOrSlug(slug);
      setCommunity(detail);
      setError(null);

      const [memberList, postPage] = await Promise.all([
        listCommunityMembers(detail.slug || detail.id).catch(
          () => [] as ApiCommunityMember[],
        ),
        listCommunityPosts(detail.slug || detail.id)
          .catch(() => ({ items: [] as ApiCommunityPost[] }))
          .then((r) => r.items),
      ]);
      setMembers(memberList);
      setPosts(postPage);
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 404) {
        setNotFound(true);
        setCommunity(null);
      } else {
        setError(extractCommunityErrorMessage(err, "Failed to load community"));
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const detail = await getCommunityByIdOrSlug(slug);
        if (cancelled) return;
        setCommunity(detail);

        const [memberList, postPage] = await Promise.all([
          listCommunityMembers(detail.slug || detail.id).catch(
            () => [] as ApiCommunityMember[],
          ),
          listCommunityPosts(detail.slug || detail.id)
            .catch(() => ({ items: [] as ApiCommunityPost[] }))
            .then((r) => r.items),
        ]);
        if (cancelled) return;
        setMembers(memberList);
        setPosts(postPage);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const status = (err as { status?: number })?.status;
        if (status === 404) {
          setNotFound(true);
          setCommunity(null);
        } else {
          setError(extractCommunityErrorMessage(err, "Failed to load community"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleJoin() {
    if (!community || membershipLoading) return;
    setMembershipLoading(true);
    setMembershipError(null);
    try {
      await joinCommunity(community.slug || community.id);
      markCommunityJoined(community);
      setCommunity((prev) =>
        prev
          ? withMembershipFlag(
              { ...prev, member_count: (prev.member_count ?? 0) + 1 },
              "MEMBER",
            )
          : prev,
      );
      notifyCommunityMembershipChanged();
      const fresh = await listCommunityMembers(community.slug || community.id).catch(
        () => null,
      );
      if (fresh) setMembers(fresh);
    } catch (err) {
      const status = (err as { status?: number })?.status;
      const body = (err as { data?: unknown })?.data as
        | { error?: { code?: string } }
        | undefined;
      // Already a member — still Joined, still sync the sidebar.
      if (status === 409 || body?.error?.code === "RESOURCE_CONFLICT") {
        markCommunityJoined(community);
        setCommunity((prev) => (prev ? withMembershipFlag(prev, "MEMBER") : prev));
        notifyCommunityMembershipChanged();
      } else {
        setMembershipError(extractCommunityErrorMessage(err, "Failed to join community"));
      }
    } finally {
      setMembershipLoading(false);
    }
  }

  async function handleLeave() {
    if (!community || membershipLoading) return;
    setMembershipLoading(true);
    setMembershipError(null);
    try {
      await leaveCommunity(community.slug || community.id);
      markCommunityLeft(community.slug || community.id);
      setCommunity((prev) =>
        prev
          ? {
              ...prev,
              is_member: false,
              my_role: null,
              member_count: Math.max(0, (prev.member_count ?? 1) - 1),
            }
          : prev,
      );
      notifyCommunityMembershipChanged();
      const fresh = await listCommunityMembers(community.slug || community.id).catch(
        () => null,
      );
      if (fresh) setMembers(fresh);
    } catch (err) {
      setMembershipError(extractCommunityErrorMessage(err, "Failed to leave community"));
    } finally {
      setMembershipLoading(false);
    }
  }

  async function handleCreatePost() {
    if (!community || posting) return;
    setPostErrors([]);
    const content = composer.trim();
    if (!content) {
      setPostErrors(["Write something before posting."]);
      return;
    }
    if (content.length > 1000) {
      setPostErrors(["Post must not exceed 1000 characters."]);
      return;
    }
    setPosting(true);
    try {
      const created = await createCommunityPost(community.slug || community.id, {
        content,
      });
      setPosts((prev) =>
        prev.some((p) => p.id === created.id) ? prev : [created, ...prev],
      );
      setComposer("");
      setCommunity((prev) =>
        prev ? { ...prev, post_count: (prev.post_count ?? 0) + 1 } : prev,
      );
    } catch (err) {
      setPostErrors(extractCommunityErrorMessages(err, "Failed to publish post"));
    } finally {
      setPosting(false);
    }
  }

  return {
    community,
    members,
    posts,
    loading,
    notFound,
    error,
    tab,
    setTab,
    membershipLoading,
    membershipError,
    composer,
    setComposer,
    posting,
    postErrors,
    handleJoin,
    handleLeave,
    handleCreatePost,
    reload: load,
  };
}
