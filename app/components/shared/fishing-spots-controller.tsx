"use client";

import DesktopFishingSpots from "@/app/components/desktop/fishing-spots/desktop-fishing-spots";
import MobileFishingSpots from "@/app/components/mobile/fishing-spots/mobile-fishing-spots";

export default function FishingSpotsController() {
  return (
    <>
      <div className="hidden md:block">
        <DesktopFishingSpots />
      </div>

      <div className="block md:hidden">
        <MobileFishingSpots />
      </div>
    </>
  );
}
