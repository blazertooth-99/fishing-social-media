// components/shared/profile-controller.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DesktopProfile from "@/app/components/desktop/profile/desktop-profile";
import MobileProfile from "@/app/components/mobile/profile/mobile-profile";

import {
  getMyProfile,
  updateMyProfile,
  type UserProfile,
} from "@/lib/api/profile";

import { uploadMedia } from "@/lib/api/media";
import { getSessionToken } from "@/lib/api/client";
import DesktopSidebar from "../../desktop/desktop-sidebar";

export interface ProfileUpdateData {
  display_name: string;
  bio: string;
  avatar_file?: File | null;
}

export default function ProfileController() {
  const router = useRouter();

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

      const token = getSessionToken();
      if (!token) {
        console.warn("No session token found, redirecting to /login");
        router.replace("/login");
        return;
      }

      const profileData = await getMyProfile();

      console.log("PROFILE DATA:", profileData);

      setProfile(profileData);
    } catch (error) {
      console.error("PROFILE LOAD ERROR:", error);

      const message = error instanceof Error ? error.message : String(error);
      if (
        message.includes("401") ||
        message.toLowerCase().includes("unauthorized")
      ) {
        console.warn("Session expired or unauthorized (401), redirecting to /login");
        router.replace("/login");
        return;
      }

      setError(
        error instanceof Error ? error.message : "Failed to load profile.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

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
      <main className="min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-[1400px] grid grid-cols-[240px_minmax(0,680px)_300px] gap-8 px-8 py-8">
          <aside className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <DesktopSidebar />
          </aside>
          <div className="flex w-full flex-col items-center justify-center">
            <div className=" mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-300" />

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading your profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /**
   * Error state
   */
  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950 px-6">
        <div className="max-w-md text-center">
          <div className="mb-4 text-4xl">🎣</div>

          <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
            Unable to load profile
          </h1>

          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            {error ?? "Profile data is unavailable."}
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={loadProfile}
              className="rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Log In
            </button>
          </div>
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
