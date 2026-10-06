"use client";

import { useCallback, useEffect, useState } from "react";
import {
  COMMUNITY_MEMBERSHIP_EVENT,
  extractCommunityErrorMessage,
  listJoinedCommunities,
  type ApiCommunity,
} from "@/lib/api/communities";
import { api } from "@/lib/api";

/**
 * "Your communities" loader for /feed sidebars.
 * Membership is resolved from server flags + creator ownership + the local
 * join cache (see listJoinedCommunities), so joined communities show up even
 * though the live list omits `is_member`/`my_role`.
 * Refreshes on COMMUNITY_MEMBERSHIP_EVENT (join / leave / create).
 *
 * Never wipes a loaded list on a failed reload (stale list + retry beats an
 * empty sidebar), and `isLoggedOut` is only a hint — consumers must still
 * render `communities` when non-empty (cached joins survive logout text).
 */
export function useJoinedCommunities(opts?: { limit?: number; maxPages?: number }) {
  const [communities, setCommunities] = useState<ApiCommunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      // Best-effort viewer id for creator-ownership inference; null when logged out.
      // A failed session check alone must NOT clear anything — the list call
      // below still resolves cached joins via detail backfill.
      const session = await api.getSession().catch(() => null);
      const currentUserId = session?.data?.user_id ?? null;
      setIsLoggedOut(!currentUserId);
      const items = await listJoinedCommunities({
        limit: opts?.limit ?? 20,
        maxPages: opts?.maxPages ?? 5,
        currentUserId,
      });
      setCommunities(items);
      setError(null);
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 401) {
        setIsLoggedOut(true);
        // Keep cached list; empty state (not an error banner) covers no-data.
      } else {
        setError(extractCommunityErrorMessage(err, "Failed to load your communities"));
      }
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts?.limit, opts?.maxPages]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await load();
    })();
    function onMembershipChanged() {
      if (!cancelled) void load();
    }
    window.addEventListener(COMMUNITY_MEMBERSHIP_EVENT, onMembershipChanged);
    return () => {
      cancelled = true;
      window.removeEventListener(COMMUNITY_MEMBERSHIP_EVENT, onMembershipChanged);
    };
  }, [load]);

  return { communities, isLoading, error, isLoggedOut, reload: load };
}
