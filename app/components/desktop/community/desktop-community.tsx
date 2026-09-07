"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Search,
  Users,
  Globe2,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { communities } from "@/app/utils/discovery-data";
import DesktopSidebar from "../desktop-sidebar";

export default function DesktopCommunity() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".community-header", {
        opacity: 0,
        y: 25,
        duration: 0.7,
      });

      gsap.from(".community-card", {
        opacity: 0,
        y: 35,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-[240px_minmax(0,1fr)_320px]">
        <aside className="border-r border-slate-200 bg-white">
          <DesktopSidebar />
        </aside>
        <section className="min-w-0 p-8">
          <div className="mx-auto max-w-3xl">
            <header className="community-header mb-8">
              <p className="text-sm font-medium text-cyan-600">
                Meet fellow anglers
              </p>

              <h1 className="mt-1 text-3xl font-bold">Communities</h1>

              <p className="mt-2 text-sm text-slate-500">
                Find communities that share your fishing passion.
              </p>

              <div className="relative mt-6">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  placeholder="Search communities..."
                  className="h-11 rounded-xl border-0 bg-white pl-10 shadow-sm"
                />
              </div>
            </header>

            <div className="mt-8 space-y-5">
              {communities.map((community) => (
                <article
                  key={community.id}
                  className="community-card overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-2xl text-white">
                        🎣
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="font-bold">{community.name}</h2>

                          {community.active && (
                            <CheckCircle2 size={16} className="text-cyan-500" />
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Users size={13} />
                            {community.members.toLocaleString()} members
                          </span>

                          <span className="flex items-center gap-1">
                            <Globe2 size={13} />
                            {community.privacy}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-slate-600">
                          {community.description}
                        </p>
                      </div>

                      <Button className="rounded-xl">Join</Button>
                    </div>

                    {/* PREVIEW POST */}
                    <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-500">
                          Latest post
                        </p>

                        <span className="text-xs text-slate-400">
                          {community.latestPost.time}
                        </span>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm font-semibold">
                          {community.latestPost.user}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {community.latestPost.content}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center gap-1 text-xs text-slate-400">
                        <MessageCircle size={14} />
                        {community.latestPost.comments} comments
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
