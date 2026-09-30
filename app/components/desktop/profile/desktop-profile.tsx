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
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="mx-auto max-w-6xl grid min-h-screen grid-cols-[240px_minmax(0,680px)] justify-center gap-10 px-6 py-4">
        {/* DESKTOP LEFT SIDEBAR */}
        <aside className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <DesktopSidebar />
        </aside>

        {/* THREADS PROFILE MAIN VIEW */}
        <section className="min-w-0 max-w-xl w-full py-6">
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
