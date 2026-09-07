"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Search,
  Users,
  Globe2,
  MessageCircle,
  CheckCircle2,
  SlidersHorizontal,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { communities } from "@/app/utils/discovery-data";

export default function MobileCommunity() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      tl.from(".mobile-community-header", {
        opacity: 0,
        y: -20,
        duration: 0.5,
      })
        .from(
          ".mobile-community-search",
          {
            opacity: 0,
            y: 15,
            duration: 0.4,
          },
          "-=0.25",
        )
        .from(
          ".mobile-community-card",
          {
            opacity: 0,
            y: 25,
            duration: 0.5,
            stagger: 0.1,
          },
          "-=0.2",
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const filteredCommunities = communities.filter((community) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      community.name.toLowerCase().includes(query) ||
      community.description.toLowerCase().includes(query) ||
      community.privacy.toLowerCase().includes(query)
    );
  });

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50 pb-24">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="mobile-community-header sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={19} />
            </Button>

            <div>
              <p className="text-[11px] font-medium text-cyan-600">
                Meet fellow anglers
              </p>

              <h1 className="text-lg font-bold leading-tight text-slate-950">
                Communities
              </h1>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-slate-500"
          >
            <MoreHorizontal size={20} />
          </Button>
        </div>

        <p className="mt-3 pl-12 text-xs leading-5 text-slate-500">
          Find communities that share your fishing passion.
        </p>
      </header>

      {/* =====================================================
          SEARCH
      ====================================================== */}

      <section className="mobile-community-search bg-white px-4 pb-4 pt-2">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search communities..."
            className="h-11 rounded-xl border-0 bg-slate-50 pl-10 pr-11 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-cyan-500"
          />

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-lg text-slate-400"
          >
            <SlidersHorizontal size={17} />
          </Button>
        </div>
      </section>

      {/* =====================================================
          COMMUNITY LIST
      ====================================================== */}

      <section className="px-4 py-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Discover communities
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {filteredCommunities.length} communities available
            </p>
          </div>

          <button type="button" className="text-xs font-semibold text-cyan-600">
            See all
          </button>
        </div>

        <div className="space-y-4">
          {filteredCommunities.map((community) => (
            <article
              key={community.id}
              className="mobile-community-card overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
            >
              <div className="p-4">
                {/* =================================================
                    COMMUNITY HEADER
                ================================================== */}

                <div className="flex items-start gap-3">
                  {/* Community Icon */}

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-xl text-white shadow-sm">
                    🎣
                  </div>

                  {/* Community Info */}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h2 className="truncate text-sm font-bold text-slate-950">
                            {community.name}
                          </h2>

                          {community.active && (
                            <CheckCircle2
                              size={15}
                              className="shrink-0 text-cyan-500"
                            />
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {community.members.toLocaleString()} members
                          </span>

                          <span className="flex items-center gap-1">
                            <Globe2 size={12} />

                            {community.privacy}
                          </span>
                        </div>
                      </div>

                      {/* Join */}

                      <Button
                        size="sm"
                        className="h-8 shrink-0 rounded-lg bg-cyan-500 px-3 text-xs hover:bg-cyan-600"
                      >
                        Join
                      </Button>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    DESCRIPTION
                ================================================== */}

                <p className="mt-4 text-xs leading-5 text-slate-600">
                  {community.description}
                </p>

                {/* =================================================
                    LATEST POST
                ================================================== */}

                <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Latest post
                    </p>

                    <span className="text-[10px] text-slate-400">
                      {community.latestPost.time}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <p className="text-xs font-semibold text-slate-800">
                      {community.latestPost.user}
                    </p>

                    <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-600">
                      {community.latestPost.content}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <MessageCircle size={13} />

                      <span>{community.latestPost.comments} comments</span>
                    </div>

                    <button
                      type="button"
                      className="text-[10px] font-semibold text-cyan-600"
                    >
                      View post
                    </button>
                  </div>
                </div>

                {/* =================================================
                    COMMUNITY FOOTER
                ================================================== */}

                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400"
                  >
                    <Users size={14} />
                    Community members
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-1 text-[11px] font-semibold text-cyan-600"
                  >
                    Open community
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

        {filteredCommunities.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Users size={24} className="text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
              No communities found
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Try searching with another community name or keyword.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
