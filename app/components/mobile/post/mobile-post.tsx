"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import {
  X,
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  Smile,
  MapPin,
  Hash,
  Settings2,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import PostFishingDetails from "@/app/components/shared/post/post-fishing-details";
import PostMediaPicker from "@/app/components/shared/post/post-media-picker";

export interface MobilePostProps {
  onClose?: () => void;
  onSubmit?: () => void;
}

export default function MobilePost({ onClose, onSubmit }: MobilePostProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      tl.from(".mobile-post-header", {
        y: -20,
        opacity: 0,
        duration: 0.35,
      })
        .from(
          ".mobile-post-content",
          {
            y: 20,
            opacity: 0,
            duration: 0.4,
          },
          "-=0.15",
        )
        .from(
          ".mobile-fishing-details",
          {
            y: 20,
            opacity: 0,
            duration: 0.35,
          },
          "-=0.2",
        )
        .from(
          ".mobile-post-tools",
          {
            y: 15,
            opacity: 0,
            duration: 0.3,
          },
          "-=0.15",
        )
        .from(
          ".mobile-post-footer",
          {
            y: 15,
            opacity: 0,
            duration: 0.3,
          },
          "-=0.15",
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-white text-slate-950">
      {/* =========================================================
          HEADER
      ========================================================== */}

      <header className="mobile-post-header sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur-md">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-slate-500"
          onClick={onClose}
          aria-label="Close post"
        >
          <X size={20} />
        </Button>

        <div className="text-center">
          <p className="text-sm font-semibold leading-none">New Catch</p>

          <p className="mt-1 text-[10px] text-slate-400">
            Share your fishing story
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-slate-500"
          aria-label="More options"
        >
          <MoreHorizontal size={20} />
        </Button>
      </header>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}

      <section className="mobile-post-content px-4 pt-5">
        <div className="flex gap-3">
          {/* Avatar */}

          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-emerald-600 text-sm font-semibold text-white">
              CS
            </AvatarFallback>
          </Avatar>

          {/* User + textarea */}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold">csatrio</span>

              <span className="text-xs text-slate-300">›</span>

              <span className="truncate text-xs text-slate-400">
                Fishing Community
              </span>
            </div>

            <Textarea
              placeholder="What's your catch today?"
              className="mt-3 min-h-[120px] resize-none border-none p-0 text-[15px] leading-6 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        {/* =====================================================
            MEDIA
        ====================================================== */}

        <div className="mt-4">
          <PostMediaPicker />
        </div>
      </section>

      {/* =========================================================
          FISHING DETAILS
      ========================================================== */}

      <section className="mobile-fishing-details px-4 py-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Catch details</h2>

          <p className="mt-1 text-xs text-slate-400">
            Tell the community about your catch
          </p>
        </div>

        <PostFishingDetails />
      </section>

      {/* =========================================================
          TOOLS
      ========================================================== */}

      <div className="mobile-post-tools flex items-center gap-1 border-t border-slate-100 px-3 py-2">
        <PostTool icon={<ImageIcon size={18} />} label="Photo" />

        <PostTool icon={<Video size={18} />} label="Video" />

        <PostTool icon={<Smile size={18} />} label="Emoji" />

        <PostTool icon={<MapPin size={18} />} label="Location" />

        <PostTool icon={<Hash size={18} />} label="Hashtag" />
      </div>

      {/* =========================================================
          FOOTER
      ========================================================== */}

      <footer className="mobile-post-footer flex items-center justify-between border-t border-slate-100 px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 px-2 text-xs text-slate-500"
        >
          <Settings2 size={16} />

          <span>Post options</span>
        </Button>

        <Button
          onClick={onSubmit}
          className="rounded-full bg-emerald-600 px-5 text-xs font-semibold hover:bg-emerald-700"
        >
          Post Catch 🎣
        </Button>
      </footer>
    </main>
  );
}

/* ===============================================================
   POST TOOL
================================================================ */

interface PostToolProps {
  icon: React.ReactNode;
  label: string;
}

function PostTool({ icon, label }: PostToolProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-full text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
      aria-label={label}
    >
      {icon}
    </Button>
  );
}
