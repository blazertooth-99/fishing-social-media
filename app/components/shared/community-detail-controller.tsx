"use client";

import DesktopCommunityDetail from "@/app/components/desktop/community/desktop-community-detail";
import MobileCommunityDetail from "@/app/components/mobile/community/mobile-community-detail";

export default function CommunityDetailController({ slug }: { slug: string }) {
  return (
    <>
      <div className="hidden md:block">
        <DesktopCommunityDetail slug={slug} />
      </div>

      <div className="block md:hidden">
        <MobileCommunityDetail slug={slug} />
      </div>
    </>
  );
}
