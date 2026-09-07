"use client";

import DesktopExplore from "@/app/components/desktop/explore/desktop-explore";
import MobileExplore from "@/app/components/mobile/explore/mobile-explore";

export default function ExploreController() {
  return (
    <>
      <div className="hidden md:block">
        <DesktopExplore />
      </div>

      <div className="block md:hidden">
        <MobileExplore />
      </div>
    </>
  );
}
