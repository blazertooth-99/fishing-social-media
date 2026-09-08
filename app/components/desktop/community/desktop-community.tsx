"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
import DesktopCommunityRightSidebar from "./desktop-community-right-sidebar";

gsap.registerPlugin(ScrollTrigger);

export default function DesktopCommunity() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // HEADER
      gsap.from(".community-header", {
        opacity: 0,
        y: 25,
        duration: 0.8,
        ease: "power3.out",
      });

      // CARD SCROLL REVEAL
      gsap.utils.toArray<HTMLElement>(".community-card").forEach((card) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 45,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",

            scrollTrigger: {
              trigger: card,

              start: "top 88%",

              end: "top 60%",

              toggleActions: "play none none none",

              once: true,
            },
          },
        );
      });

      // RIGHT SIDEBAR
      gsap.from(".community-sidebar", {
        opacity: 0,
        x: 25,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50">
      <div
        className="
          mx-auto
          grid
          max-w-[1400px]
          grid-cols-[240px_minmax(0,680px)_300px]
          gap-8
          px-8
          py-8
        "
      >
        {/* ================================= */}
        {/* LEFT SIDEBAR */}
        {/* ================================= */}

        <aside className="border-r border-slate-200 bg-white">
          <DesktopSidebar />
        </aside>

        {/* ================================= */}
        {/* MAIN CONTENT */}
        {/* ================================= */}

        <section className="min-w-0">
          <div className="mx-auto max-w-3xl">
            {/* HEADER */}

            <header className="community-header mb-8">
              <p className="text-sm font-medium text-cyan-600">
                Meet fellow anglers 🎣
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Communities
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Find communities that share your fishing passion and exchange
                your experience.
              </p>

              {/* SEARCH */}

              <div className="relative mt-6">
                <Search
                  size={18}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <Input
                  placeholder="Search fishing communities..."
                  className="
                    h-11
                    rounded-xl
                    border-0
                    bg-white
                    pl-10
                    shadow-sm
                    focus-visible:ring-2
                    focus-visible:ring-cyan-400
                  "
                />
              </div>
            </header>

            {/* COMMUNITY LIST */}

            <div className="space-y-5">
              {communities.map((community) => (
                <article
                  key={community.id}
                  className="
                    community-card
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-100
                    bg-white
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                  "
                >
                  <div className="p-6">
                    {/* COMMUNITY HEADER */}

                    <div className="flex items-start gap-4">
                      {/* COMMUNITY AVATAR */}

                      <div
                        className="
                          flex
                          h-16
                          w-16
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-gradient-to-br
                          from-cyan-400
                          to-blue-500
                          text-2xl
                          text-white
                          shadow-lg
                          shadow-cyan-500/10
                        "
                      >
                        🎣
                      </div>

                      {/* INFO */}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate font-bold text-slate-900">
                            {community.name}
                          </h2>

                          {community.active && (
                            <CheckCircle2
                              size={16}
                              className="shrink-0 text-cyan-500"
                            />
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

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {community.description}
                        </p>
                      </div>

                      {/* JOIN */}

                      <Button
                        className="
                          shrink-0
                          rounded-xl
                          bg-cyan-500
                          text-white
                          transition-all
                          hover:bg-cyan-600
                          hover:shadow-lg
                          hover:shadow-cyan-500/20
                        "
                      >
                        Join
                      </Button>
                    </div>

                    {/* PREVIEW POST */}

                    <div
                      className="
                        mt-6
                        rounded-2xl
                        bg-slate-50
                        p-5
                        transition-colors
                        duration-300
                        hover:bg-slate-100
                      "
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Latest post
                        </p>

                        <span className="text-xs text-slate-400">
                          {community.latestPost.time}
                        </span>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm font-semibold text-slate-800">
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

        {/* ================================= */}
        {/* RIGHT SIDEBAR */}
        {/* ================================= */}

        <aside className="community-sidebar min-w-0">
          <DesktopCommunityRightSidebar />
        </aside>
      </div>
    </main>
  );
}
