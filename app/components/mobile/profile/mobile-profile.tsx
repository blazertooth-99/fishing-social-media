"use client";

import MobileBottomNav from "@/app/components/mobile/mobile-bottom-nav";
import { ThreadsProfileView, ProfileUpdateData } from "@/app/components/shared/profile/threads-profile-view";
import type { UserProfile } from "@/lib/api/profile";

interface MobileProfileProps {
  profile: UserProfile;
  saving?: boolean;
  onUpdateProfile?: (data: ProfileUpdateData) => Promise<void>;
}

export default function MobileProfile({
  profile,
  saving = false,
  onUpdateProfile,
}: MobileProfileProps) {
  return (
    <main className="min-h-dvh bg-white dark:bg-slate-950 text-slate-900 dark:text-white pb-24 px-4 transition-colors duration-200">
      {/* THREADS PROFILE MAIN VIEW (MATCHING WIREFRAME) */}
      <ThreadsProfileView
        profile={profile}
        saving={saving}
        onUpdateProfile={onUpdateProfile}
        isDesktop={false}
      />

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileBottomNav />
    </main>
  );
}
