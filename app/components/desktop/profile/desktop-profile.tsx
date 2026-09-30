"use client";

import DesktopSidebar from "@/app/components/desktop/desktop-sidebar";
import { ThreadsProfileView, ProfileUpdateData } from "@/app/components/shared/profile/threads-profile-view";
import type { UserProfile } from "@/lib/api/profile";

interface DesktopProfileProps {
  profile: UserProfile;
  saving?: boolean;
  onUpdateProfile?: (data: ProfileUpdateData) => Promise<void>;
}

export default function DesktopProfile({
  profile,
  saving = false,
  onUpdateProfile,
}: DesktopProfileProps) {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="mx-auto max-w-[1400px] grid grid-cols-[240px_minmax(0,680px)_300px] gap-8 px-8 py-8">
        {/* DESKTOP LEFT SIDEBAR */}
        <aside className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <DesktopSidebar />
        </aside>

        {/* THREADS PROFILE MAIN VIEW */}
        <section className="min-w-0 max-w-3xl w-full min-h-screen">
          <ThreadsProfileView
            profile={profile}
            saving={saving}
            onUpdateProfile={onUpdateProfile}
            isDesktop={true}
          />
        </section>
      </div>
    </main>
  );
}
