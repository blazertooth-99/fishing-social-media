"use client";

import { Flame, Users, TrendingUp, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const trendingCommunities = [
  {
    id: 1,
    name: "Freshwater Anglers",
    members: "12.4K",
    category: "Freshwater",
  },
  {
    id: 2,
    name: "Saltwater Hunters",
    members: "9.8K",
    category: "Saltwater",
  },
  {
    id: 3,
    name: "Fishing Photography",
    members: "7.2K",
    category: "Photography",
  },
];

const activeCommunities = [
  {
    id: 1,
    name: "Strike Club",
    online: 124,
  },
  {
    id: 2,
    name: "Weekend Anglers",
    online: 86,
  },
  {
    id: 3,
    name: "Lure Fishing ID",
    online: 64,
  },
];

export default function DesktopCommunityRightSidebar() {
  return (
    <aside className="sticky top-8 space-y-5">
      {/* TRENDING */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Trending Communities</h2>

            <p className="mt-1 text-xs text-slate-400">
              Communities anglers are joining
            </p>
          </div>

          <Flame size={20} className="text-orange-500" />
        </div>

        <div className="space-y-4">
          {trendingCommunities.map((community, index) => (
            <div key={community.id} className="group flex items-center gap-3">
              {/* NUMBER */}
              <span className="w-5 text-sm font-bold text-slate-300">
                {index + 1}
              </span>

              {/* AVATAR */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-lg">
                🎣
              </div>

              {/* INFO */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {community.name}
                </p>

                <p className="text-xs text-slate-400">
                  {community.members} members
                </p>
              </div>

              <ArrowUpRight
                size={16}
                className="text-slate-300 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ACTIVE COMMUNITIES */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Active Now</h2>

            <p className="mt-1 text-xs text-slate-400">
              Anglers currently online
            </p>
          </div>

          <Users size={19} className="text-cyan-500" />
        </div>

        <div className="space-y-4">
          {activeCommunities.map((community) => (
            <div key={community.id} className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  👥
                </div>

                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold">{community.name}</p>

                <p className="text-xs text-slate-400">
                  {community.online} anglers online
                </p>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="mt-5 w-full rounded-xl">
          Explore communities
        </Button>
      </section>

      {/* COMMUNITY TIPS */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5 text-white shadow-sm">
        <TrendingUp size={22} />

        <h3 className="mt-4 font-bold">Share your experience 🎣</h3>

        <p className="mt-2 text-sm leading-6 text-cyan-50">
          Help other anglers discover better fishing techniques, spots and
          equipment.
        </p>

        <Badge className="mt-4 rounded-full bg-white/20 text-white hover:bg-white/30">
          Fishing knowledge
        </Badge>
      </section>
    </aside>
  );
}
