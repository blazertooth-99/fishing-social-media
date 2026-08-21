"use client";

import DesktopProfile from "@/app/components/desktop/profile/desktop-profile";
import MobileProfile from "@/app/components/mobile/profile/mobile-profile";

export default function ProfileController() {
  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:block">
        <DesktopProfile />
      </div>

      {/* MOBILE */}
      <div className="block md:hidden">
        <MobileProfile />
      </div>
    </>
  );
}
