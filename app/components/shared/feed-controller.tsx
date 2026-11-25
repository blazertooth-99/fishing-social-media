"use client";

import { useEffect, useState } from "react";

import DesktopLayout from "@/app/components/desktop/feed/desktop-feed";
import MobileLayout from "@/app/components/mobile/feed/mobile-feed";

export default function FeedController({
  focusedPostId = null,
  requestedCommentId = null,
  highlightRecentComment = false,
}: {
  focusedPostId?: string | null;
  requestedCommentId?: string | null;
  highlightRecentComment?: boolean;
}) {
  const [active, setActive] = useState<"desktop" | "mobile" | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const update = () => setActive(mediaQuery.matches ? "mobile" : "desktop");
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const desktopActive = active === "desktop";
  const mobileActive = active === "mobile";

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:block">
        <DesktopLayout
          focusedPostId={desktopActive ? focusedPostId : null}
          requestedCommentId={desktopActive ? requestedCommentId : null}
          highlightRecentComment={desktopActive && highlightRecentComment}
          allowAutoOpen={desktopActive}
        />
      </div>

      {/* MOBILE */}
      <div className="block lg:hidden">
        <MobileLayout
          focusedPostId={mobileActive ? focusedPostId : null}
          requestedCommentId={mobileActive ? requestedCommentId : null}
          highlightRecentComment={mobileActive && highlightRecentComment}
          allowAutoOpen={mobileActive}
        />
      </div>
    </>
  );
}
