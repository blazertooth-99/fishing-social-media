"use client";

import { useEffect, useState } from "react";

import DesktopPost from "@/app/components/desktop/post/desktop-post";
import MobilePost from "@/app/components/mobile/post/mobile-post";

export default function PostController() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const handleResize = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleResize();

    mediaQuery.addEventListener("change", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  // Prevent hydration mismatch
  if (isMobile === null) {
    return <main className="min-h-screen bg-[#0c0f0e]" />;
  }

  return isMobile ? <MobilePost /> : <DesktopPost />;
}
