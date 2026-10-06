// components/shared/profile/user-profile-controller.tsx
// Controller for viewing ANOTHER user's public profile:
// /users/[username] — used from new-follower notifications and
// follower/following lists.

"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import DesktopSidebar from "@/app/components/desktop/desktop-sidebar";
import MobileBottomNav from "@/app/components/mobile/mobile-bottom-nav";
import { PublicProfileView } from "@/app/components/shared/profile/public-profile-view";
import {
  getPublicProfile,
  type UserProfile,
} from "@/lib/api/profile";
import { getSessionToken } from "@/lib/api/client";

export default function UserProfileController() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const username = Array.isArray(params?.username)
    ? params.username[0]
    : params?.username;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!username) return;
    try {
      setLoading(true);
      setError(null);

      const token = getSessionToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      const data = await getPublicProfile(decodeURIComponent(username));

      // Opening your own username → canonical own-profile page.
      if (data.relationship === "SELF") {
        router.replace("/profile");
        return;
      }

      setProfile(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (
        message.includes("401") ||
        message.toLowerCase().includes("unauthorized")
      ) {
        router.replace("/login");
        return;
      }
      setError(message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [username, router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <main className="min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-[1400px] grid grid-cols-[240px_minmax(0,680px)_300px] gap-8 px-8 py-8">
          <aside className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <DesktopSidebar />
          </aside>
          <div className="flex w-full flex-col items-center justify-center">
            <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-300" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950 px-6">
        <div className="max-w-md text-center">
          <div className="mb-4 text-4xl">🎣</div>
          <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
            Profile not found
          </h1>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            {error ?? `User @${username} could not be found.`}
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
              onClick={() => router.back()}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:block">
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
          <div className="mx-auto max-w-[1400px] grid grid-cols-[240px_minmax(0,680px)_300px] gap-8 px-8 py-8">
            <aside className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <DesktopSidebar />
            </aside>
            <section className="min-w-0 max-w-3xl w-full min-h-screen">
              <PublicProfileView
                profile={profile}
                isDesktop
                onRelationshipChange={setProfile}
              />
            </section>
          </div>
        </main>
      </div>

      {/* MOBILE */}
      <div className="block md:hidden">
        <main className="min-h-dvh bg-white dark:bg-slate-950 text-slate-900 dark:text-white pb-24 px-4 transition-colors duration-200">
          <PublicProfileView
            profile={profile}
            onRelationshipChange={setProfile}
          />
          <MobileBottomNav />
        </main>
      </div>
    </>
  );
}
