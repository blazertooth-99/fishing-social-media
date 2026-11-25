"use client";

import DesktopExplore from "@/app/components/desktop/explore/desktop-explore";
import MobileExplore from "@/app/components/mobile/explore/mobile-explore";
import { useExploreFeed } from "@/app/components/shared/explore/use-explore-feed";
import { useExploreSearch } from "@/app/components/shared/explore/use-explore-search";

export default function ExploreController({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const feed = useExploreFeed({ limit: 40 });
  const search = useExploreSearch({ initialQuery });

  return (
    <>
      <div className="hidden md:block">
        <DesktopExplore feed={feed} search={search} />
      </div>

      <div className="block md:hidden">
        <MobileExplore feed={feed} search={search} />
      </div>
    </>
  );
}
