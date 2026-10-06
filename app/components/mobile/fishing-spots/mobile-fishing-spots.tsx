"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  Bell,
  ChevronRight,
  Fish,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  ApiFishingSpot,
  formatSpotDistance,
  formatSpotRating,
} from "@/lib/api/fishing-spots";
import { useFishingSpots } from "@/app/components/shared/use-fishing-spots";
import CreateFishingSpotDialog from "@/app/components/shared/create-fishing-spot-dialog";

const filters = [
  "Nearby",
  "Popular",
  "Freshwater",
  "Saltwater",
  "Brackish",
] as const;

type Filter = (typeof filters)[number];

export default function MobileFishingSpot() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeFilter, setActiveFilter] = useState<Filter>("Nearby");
  const { spots, query, setQuery, isLoading, error, reload, prependSpot } =
    useFishingSpots({ limit: 20 });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      tl.from(".spot-header", {
        y: -20,
        opacity: 0,
        duration: 0.4,
      })
        .from(
          ".spot-search",
          {
            y: 15,
            opacity: 0,
            duration: 0.35,
          },
          "-=0.2",
        )
        .from(
          ".spot-filter",
          {
            x: 20,
            opacity: 0,
            duration: 0.35,
          },
          "-=0.2",
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const visibleSpots = useMemo(() => {
    const items = [...spots];
    switch (activeFilter) {
      case "Popular":
        return items.sort(
          (a, b) => (b.average_rating ?? -1) - (a.average_rating ?? -1),
        );
      case "Freshwater":
      case "Saltwater":
      case "Brackish":
        return items.filter(
          (spot) => spot.water_type === activeFilter.toUpperCase(),
        );
      case "Nearby":
      default:
        return items.sort(
          (a, b) =>
            (a.distance_meters ?? Number.MAX_SAFE_INTEGER) -
            (b.distance_meters ?? Number.MAX_SAFE_INTEGER),
        );
    }
  }, [spots, activeFilter]);

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50 pb-24">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="spot-header flex items-center justify-between bg-white px-4 pb-4 pt-5">
        <div>
          <p className="text-xs font-medium text-emerald-600">Explore</p>

          <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-950">
            Fishing Spot
          </h1>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
          >
            <Bell size={20} />
          </Button>

          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-emerald-600 text-xs font-semibold text-white">
              CS
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* =====================================================
          SEARCH — GET /discovery/spots?q=
      ====================================================== */}

      <section className="spot-search bg-white px-4 pb-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search fishing spot..."
            className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 pr-11 text-sm shadow-none focus-visible:ring-emerald-500"
          />

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-lg text-slate-500"
          >
            <SlidersHorizontal size={18} />
          </Button>
        </div>
      </section>

      {/* =====================================================
          LOCATION
      ====================================================== */}

      <section className="flex items-center gap-2 bg-white px-4 pb-4">
        <MapPin size={15} className="text-emerald-600" />

        <span className="text-xs text-slate-500">Live from API</span>

        <span className="text-xs font-semibold text-slate-900">
          {isLoading ? "Loading..." : `${visibleSpots.length} spots`}
        </span>

        <div className="ml-auto">
          <CreateFishingSpotDialog
            onCreated={prependSpot}
            triggerClassName="h-8 rounded-full bg-emerald-600 px-3 text-xs hover:bg-emerald-700"
          />
        </div>
      </section>

      {/* =====================================================
          FILTERS (client-side over API water_type / rating)
      ====================================================== */}

      <section className="spot-filter overflow-x-auto border-b border-slate-100 bg-white px-4 pb-4 scrollbar-none">
        <div className="flex w-max gap-2">
          {filters.map((filter) => {
            const active = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section className="px-4 pt-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              Recommended for you
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Natural spots from GET /locations/spots
            </p>
          </div>

          <button className="text-xs font-semibold text-emerald-600">
            See map
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs text-red-600">
            <p className="font-semibold">Failed to load spots</p>
            <p className="mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void reload()}
            >
              Try again
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="aspect-[16/9] bg-slate-100" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-2/3 rounded bg-slate-100" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {visibleSpots.map((spot) => (
                <FishingSpotCard key={spot.id} spot={spot} />
              ))}
            </div>

            {visibleSpots.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <Fish size={24} className="text-slate-400" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-800">
                  No fishing spot found
                </h3>

                <p className="mt-1 max-w-[250px] text-xs leading-5 text-slate-400">
                  Try another search keyword, water-type filter, or add a new spot.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

/* =============================================================
   FISHING SPOT CARD — API fields only (no dummy image/fish/anglers)
============================================================= */

function FishingSpotCard({ spot }: { spot: ApiFishingSpot }) {
  return (
    <article className="spot-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* MAP PLACEHOLDER — API returns no photos */}

      <div className="relative flex aspect-[16/9] flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-4 text-white">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            {formatSpotRating(spot.average_rating, spot.review_count)}
          </div>
          <Badge className="rounded-full border-0 bg-black/30 text-white backdrop-blur-sm">
            {spot.privacy}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <MapPin size={15} />
          {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
        </div>

        <div className="absolute bottom-3 right-3 rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
          {formatSpotDistance(spot.distance_meters)}
        </div>
      </div>

      {/* CONTENT */}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-950">
              {spot.name}
            </h3>

            <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <MapPin size={12} />

              <span>
                {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
          >
            <ChevronRight size={17} />
          </button>
        </div>

        {/* API META */}

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-medium text-emerald-700">
            {spot.water_type}
          </span>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1.5 text-[10px] font-medium text-slate-600">
            {typeof spot.review_count === "number"
              ? `${spot.review_count} review${spot.review_count === 1 ? "" : "s"}`
              : "No reviews yet"}
          </span>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1.5 text-[10px] font-medium text-slate-600">
            {formatSpotDistance(spot.distance_meters)} away
          </span>
        </div>

        {/* Footer */}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin size={14} />
            <span>{spot.privacy} location</span>
          </div>

          <button
            type="button"
            className="text-xs font-semibold text-emerald-600"
          >
            View spot
          </button>
        </div>
      </div>
    </article>
  );
}
