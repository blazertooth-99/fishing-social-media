"use client";

import { ArrowUpRight, MapPin, Search, TrendingUp } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const trends = [
  {
    name: "Casting",
    posts: "2.8k posts",
  },
  {
    name: "Snakehead",
    posts: "1.9k posts",
  },
  {
    name: "Jatiluhur",
    posts: "1.2k posts",
  },
  {
    name: "Lure Fishing",
    posts: "980 posts",
  },
];

const anglers = [
  {
    name: "Dimas Angler",
    username: "@dimasangler",
  },
  {
    name: "Fishing Bro",
    username: "@fishingbro",
  },
  {
    name: "Raka Outdoors",
    username: "@rakaoutdoors",
  },
];

export default function RightSidebar() {
  return (
    <div className="sticky top-0 h-screen overflow-y-auto px-5 py-7">
      {/* SEARCH */}
      <div className="relative">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <Input
          placeholder="Search anglers, fish, spots..."
          className="h-11 rounded-2xl border-none bg-slate-100 pl-11 shadow-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        />
      </div>

      {/* TRENDING */}
      <div className="scroll-reveal mt-6 rounded-3xl bg-slate-50 p-5">
        <div className="mb-5 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-600" />

          <h2 className="font-bold text-slate-900">Trending this week</h2>
        </div>

        <div className="space-y-1">
          {trends.map((trend, index) => (
            <button
              key={trend.name}
              className="group flex w-full items-center justify-between rounded-2xl p-3 text-left transition hover:bg-white"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  #{trend.name}
                </p>

                <p className="mt-1 text-xs text-slate-400">{trend.posts}</p>
              </div>

              <span className="text-xs text-slate-300">0{index + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FISHING SPOT */}
      <div className="scroll-reveal mt-5 overflow-hidden rounded-3xl bg-slate-900 text-white">
        <div className="p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">
            Fishing spot
          </p>

          <h2 className="mt-2 text-xl font-bold">Waduk Jatiluhur</h2>

          <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
            <MapPin size={13} />
            Purwakarta, Jawa Barat
          </div>
        </div>

        <div className="relative h-36 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1500534623283-312aade485b7)",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

          <div className="absolute bottom-4 left-5">
            <p className="text-xs text-slate-300">Best catch</p>

            <p className="font-semibold">Snakehead · Peacock Bass</p>
          </div>

          <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 backdrop-blur-md hover:bg-white/20">
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* SUGGESTIONS */}
      <div className="scroll-reveal mt-5 rounded-3xl border border-slate-200 bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Anglers to follow</h2>

          <button className="text-xs font-semibold text-emerald-600">
            See all
          </button>
        </div>

        <div className="space-y-4">
          {anglers.map((angler) => (
            <div key={angler.username} className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {angler.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {angler.name}
                </p>

                <p className="truncate text-xs text-slate-400">
                  {angler.username}
                </p>
              </div>

              <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-2 py-8 text-center">
        <p className="text-xs leading-5 text-slate-400">
          © 2026 AnglerHub
          <br />
          Fish · Explore · Connect
        </p>
      </div>
    </div>
  );
}
