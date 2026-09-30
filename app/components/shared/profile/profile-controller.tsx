// components/shared/profile-controller.tsx

"use client";

import { useCallback, useEffect, useState } from "react";

import DesktopProfile from "@/app/components/desktop/profile/desktop-profile";
import MobileProfile from "@/app/components/mobile/profile/mobile-profile";

import {
  getMyProfile,
  updateMyProfile,
  type UserProfile,
} from "@/lib/api/profile";

import { uploadMedia } from "@/lib/api/media";

export interface ProfileUpdateData {
  display_name: string;
  bio: string;
  avatar_file?: File | null;
}

export default function ProfileController() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * Load profile
   */
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const profileData = await getMyProfile();

      console.log("PROFILE DATA:", profileData);

      setProfile(profileData);
    } catch (error) {
      console.error("PROFILE LOAD ERROR:", error);

      setError(
        error instanceof Error ? error.message : "Failed to load profile.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initial load
   */
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /**
   * Update profile
   */
  const handleUpdateProfile = async (data: ProfileUpdateData) => {
    if (!profile) return;

    try {
      setSaving(true);
      setError(null);

      let avatarMediaId = profile.avatar_media_id;

      /**
       * 1. Upload avatar apabila user memilih file baru
       */
      if (data.avatar_file) {
        const uploadedMedia = await uploadMedia(data.avatar_file);

        avatarMediaId = uploadedMedia.id;
      }

      /**
       * 2. PATCH profile
       */
      const updatedProfile = await updateMyProfile({
        display_name: data.display_name.trim(),
        bio: data.bio.trim(),
        avatar_media_id: avatarMediaId,
      });

      /**
       * 3. Update React state
       *
       * Tidak perlu reload halaman.
       */
      setProfile(updatedProfile);

      console.log("PROFILE UPDATED:", updatedProfile);
    } catch (error) {
      console.error("PROFILE UPDATE ERROR:", error);

      throw error;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Loading state
   */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />

          <p className="text-sm font-medium text-slate-500">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  /**
   * Error state
   */
  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md text-center">
          <div className="mb-4 text-4xl">🎣</div>

          <h1 className="mb-2 text-xl font-bold text-slate-900">
            Unable to load profile
          </h1>

          <p className="mb-6 text-sm text-slate-500">
            {error ?? "Profile data is unavailable."}
          </p>

          <button
            type="button"
            onClick={loadProfile}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  /**
   * Main profile
   */
  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:block">
        <DesktopProfile
          profile={profile}
          saving={saving}
          onUpdateProfile={handleUpdateProfile}
        />
      </div>

      {/* MOBILE */}
      <div className="block md:hidden">
        <MobileProfile
          profile={profile}
          saving={saving}
          onUpdateProfile={handleUpdateProfile}
        />
      </div>
    </>
  );
}
