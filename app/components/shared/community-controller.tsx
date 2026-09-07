"use client";

import DesktopCommunity from "@/app/components/desktop/community/desktop-community";
import MobileCommunity from "@/app/components/mobile/community/mobile-community";

export default function ExploreController() {
  return (
    <>
      <div className="hidden md:block">
        <DesktopCommunity />
      </div>

      <div className="block md:hidden">
        <MobileCommunity />
      </div>
    </>
  );
}
