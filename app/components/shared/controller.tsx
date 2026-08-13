"use client";

import DesktopLayout from "@/app/components/desktop/desktop-layout";
import MobileLayout from "@/app/components/mobile/mobile-layout";

export default function FishingController() {
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
