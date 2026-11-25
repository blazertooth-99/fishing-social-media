"use client";

import { useEffect, useState } from "react";

import { getAvatarUrl } from "@/lib/api/media";
import { getMyProfile, type UserProfile } from "@/lib/api/profile";

export function useViewerProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let cancelled = false;

    getMyProfile()
      .then((next) => {
        if (!cancelled) setProfile(next);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const displayName =
    profile?.display_name || profile?.username || "Angler";
  const avatarUrl = getAvatarUrl(profile?.avatar_media_id ?? null);

  return { profile, displayName, avatarUrl };
}
