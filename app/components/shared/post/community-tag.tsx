"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

import {
  getCommunityByIdOrSlug,
  type ApiCommunity,
} from "@/lib/api/communities";

/**
 * Module-level detail cache: a profile/feed list can render dozens of posts
 * from the same community — resolve each id/slug only once per session.
 */
const detailCache = new Map<string, ApiCommunity>();
const inFlight = new Map<string, Promise<ApiCommunity | null>>();

function loadCommunity(idOrSlug: string): Promise<ApiCommunity | null> {
  const cached = detailCache.get(idOrSlug);
  if (cached) return Promise.resolve(cached);
  const pending = inFlight.get(idOrSlug);
  if (pending) return pending;
  const request = getCommunityByIdOrSlug(idOrSlug)
    .then((detail) => {
      detailCache.set(idOrSlug, detail);
      return detail as ApiCommunity | null;
    })
    .catch(() => null)
    .finally(() => {
      inFlight.delete(idOrSlug);
    });
  inFlight.set(idOrSlug, request);
  return request;
}

interface CommunityTagProps {
  communityId: string;
  className?: string;
}

/**
 * "Posted in {community}" link for post cards. The post DTO only carries
 * `community_id` (flat snake_case DTO per FRONTEND_API_GUIDE), so the name +
 * slug are resolved via `GET /communities/{id}` (cached, best-effort —
 * renders nothing until resolved or when the community is gone).
 * Clicking routes to `/community/{slug}`.
 */
export default function CommunityTag({ communityId, className }: CommunityTagProps) {
  const router = useRouter();
  const [community, setCommunity] = useState<ApiCommunity | null>(
    () => detailCache.get(communityId) ?? null,
  );

  useEffect(() => {
    let cancelled = false;
    if (detailCache.has(communityId)) {
      setCommunity(detailCache.get(communityId) ?? null);
      return;
    }
    void loadCommunity(communityId).then((detail) => {
      if (!cancelled) setCommunity(detail);
    });
    return () => {
      cancelled = true;
    };
  }, [communityId]);

  if (!community) return null;

  function openCommunity(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/community/${encodeURIComponent(community!.slug || community!.id)}`);
  }

  return (
    <button
      type="button"
      onClick={openCommunity}
      title={`Open ${community.name}`}
      className={`inline-flex min-w-0 max-w-full items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 hover:text-emerald-800 ${className ?? ""}`}
    >
      <Users size={11} className="shrink-0" />
      <span className="truncate">{community.name}</span>
    </button>
  );
}
