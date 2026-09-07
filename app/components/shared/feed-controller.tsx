"use client";

import DesktopLayout from "@/app/components/desktop/feed/desktop-feed";
import MobileLayout from "@/app/components/mobile/feed/mobile-feed";

export default function FeedController() {
  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:block">
        <DesktopLayout />
      </div>

      {/* MOBILE */}
      <div className="block lg:hidden">
        <MobileLayout />
      </div>
    </>
  );
}
