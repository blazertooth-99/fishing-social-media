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

export default function DesktopPost() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(".post-header", {
        y: -20,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      })
        .from(
          ".post-content",
          {
            y: 25,
            opacity: 0,
            duration: 0.5,
            ease: "power3.out",
          },
          "-=0.2",
        )
        .from(
          ".fishing-details",
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.2",
        )
        .from(
          ".post-footer",
          {
            y: 20,
            opacity: 0,
            duration: 0.4,
          },
          "-=0.2",
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
          {/* HEADER */}

          <header className="post-header flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <Button variant="ghost" className="text-slate-500">
              Cancel
            </Button>

            <div className="text-center">
              <p className="text-sm font-semibold">New Catch</p>

              <p className="text-[11px] text-slate-400">
                Share your fishing story
              </p>
            </div>

            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreHorizontal size={20} />
            </Button>
          </header>

          {/* CONTENT */}

          <section className="post-content px-6 pt-6">
            <div className="flex gap-4">
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-emerald-600 text-white">
                  CS
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">csatrio</span>

                  <span className="text-slate-400">›</span>

                  <span className="text-sm text-slate-400">
                    Fishing Community
                  </span>
                </div>

                <Textarea
                  placeholder="What's your catch today?"
                  className="mt-4 min-h-[140px] resize-none border-none p-0 text-base shadow-none focus-visible:ring-0"
                />
              </div>
            </div>

            {/* MEDIA */}

            <div className="mt-5">
              <PostMediaPicker />
            </div>
          </section>

          {/* FISHING DATA */}

          <section className="fishing-details px-6 py-6">
            <div className="mb-4">
              <h2 className="font-semibold">Catch details</h2>

              <p className="text-xs text-slate-400">
                Tell the community about your catch
              </p>
            </div>

            <PostFishingDetails />
          </section>

          {/* TOOLS */}

          <div className="flex items-center gap-1 border-t border-slate-100 px-6 py-3">
            <PostTool icon={<ImageIcon size={19} />} />
            <PostTool icon={<Video size={19} />} />
            <PostTool icon={<Smile size={19} />} />
            <PostTool icon={<MapPin size={19} />} />
            <PostTool icon={<Hash size={19} />} />
          </div>

          {/* FOOTER */}

          <footer className="post-footer flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <Button variant="ghost" className="gap-2 text-slate-500">
              <Settings2 size={18} />
              Post options
            </Button>

            <Button className="rounded-full bg-emerald-600 px-7 hover:bg-emerald-700">
              Post Catch 🎣
            </Button>
          </footer>
        </div>
      </div>
    </main>
  );
}

function PostTool({ icon }: { icon: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
    >
      {icon}
    </Button>
  );
}
