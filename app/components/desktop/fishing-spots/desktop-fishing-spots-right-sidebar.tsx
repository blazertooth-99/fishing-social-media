"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MapPin, Navigation, Star, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { fishingSpots } from "@/app/utils/discovery-data";

export default function DesktopFishingSpotsSidebar() {
  const sidebarRef = useRef<HTMLDivElement>(null);

  const popularSpots = [...fishingSpots]
    .sort((a, b) => Number(b.rating) - Number(a.rating))
    .slice(0, 4);

  const nearMeSpots = [...fishingSpots]
    .sort((a, b) => {
      const distanceA = Number.parseFloat(a.distance);
      const distanceB = Number.parseFloat(b.distance);

      return distanceA - distanceB;
    })
    .slice(0, 4);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".spot-sidebar-section", {
        opacity: 0,
        x: 25,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, sidebarRef);

    return () => ctx.revert();
  }, []);

  return (
    <aside ref={sidebarRef} className="sticky top-8 h-fit space-y-5">
      {/* POPULAR SPOTS */}
      <section className="spot-sidebar-section rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
            <TrendingUp size={18} className="text-orange-500" />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Popular Spots</h2>

            <p className="text-xs text-slate-400">Trending among anglers</p>
          </div>
        </div>

        <div className="mt-5 space-y-1">
          {popularSpots.map((spot, index) => (
            <button
              key={spot.id}
              className="group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-300 hover:bg-slate-50"
            >
              {/* NUMBER */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 transition-colors group-hover:bg-orange-50 group-hover:text-orange-600">
                {index + 1}
              </div>

              {/* CONTENT */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {spot.name}
                </p>

                <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <MapPin size={11} />

                  <span className="truncate">{spot.location}</span>
                </div>
              </div>

              {/* RATING */}
              <div className="flex shrink-0 items-center gap-1 text-xs font-medium">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />

                {spot.rating}
              </div>
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          className="mt-2 w-full rounded-xl text-sm text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700"
        >
          Explore popular spots
        </Button>
      </section>

      {/* NEAR ME */}
      <section className="spot-sidebar-section rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50">
            <Navigation size={17} className="text-cyan-500" />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Near Me</h2>

            <p className="text-xs text-slate-400">Fishing spots around you</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {nearMeSpots.map((spot) => (
            <button
              key={spot.id}
              className="group w-full rounded-2xl border border-transparent p-3 text-left transition-all duration-300 hover:border-cyan-100 hover:bg-cyan-50/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-cyan-100">
                  <MapPin
                    size={16}
                    className="text-slate-500 group-hover:text-cyan-600"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {spot.name}
                    </p>

                    <span className="shrink-0 text-xs font-medium text-cyan-600">
                      {spot.distance}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs text-slate-400">
                    {spot.location}
                  </p>

                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Star
                        size={11}
                        className="fill-yellow-400 text-yellow-400"
                      />

                      {spot.rating}
                    </span>

                    <span className="flex items-center gap-1">
                      <Users size={11} />

                      {spot.anglers}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <Button className="mt-3 w-full rounded-xl bg-cyan-500 hover:bg-cyan-600">
          <Navigation size={15} />
          Use my location
        </Button>
      </section>

      {/* QUICK INFO */}
      <section className="spot-sidebar-section rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            🎣
          </div>

          <div>
            <h3 className="font-bold">Find better fishing spots</h3>

            <p className="mt-1 text-xs text-cyan-50">
              Discover where anglers are catching fish today.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          className="mt-4 w-full rounded-xl bg-white text-slate-800 hover:bg-slate-100"
        >
          Discover spots
        </Button>
      </section>
    </aside>
  );
}
