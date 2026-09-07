"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Bell,
  Bookmark,
  ChevronRight,
  Fish,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FishingSpot {
  id: string;
  name: string;
  image: string;
  location: string;
  distance: string;
  rating: number;
  fish: string[];
  anglers: number;
  description?: string;
  isSaved?: boolean;
}

const fishingSpots: FishingSpot[] = [
  {
    id: "spot-001",
    name: "Waduk Gajah Mungkur",
    image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
    location: "Wonogiri",
    distance: "12 km",
    rating: 4.8,
    fish: ["Snakehead", "Patin"],
    anglers: 128,
    description: "Spot favorit untuk casting dan predator fishing.",
  },
  {
    id: "spot-002",
    name: "Pantai Jatimalang",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    location: "Purworejo",
    distance: "28 km",
    rating: 4.6,
    fish: ["GT", "Kakap"],
    anglers: 94,
    description: "Pantai dengan aktivitas mancing yang cukup ramai.",
  },
  {
    id: "spot-003",
    name: "Rawa Pening",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    location: "Ambarawa",
    distance: "42 km",
    rating: 4.7,
    fish: ["Nila", "Patin"],
    anglers: 76,
    description: "Spot air tawar dengan banyak pilihan teknik.",
  },
];

const filters = [
  "Nearby",
  "Popular",
  "Fresh",
  "Predator",
  "Freshwater",
  "Saltwater",
];

export default function MobileFishingSpot() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeFilter, setActiveFilter] = useState("Nearby");
  const [search, setSearch] = useState("");

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
        )
        .from(
          ".spot-card",
          {
            y: 25,
            opacity: 0,
            stagger: 0.1,
            duration: 0.45,
          },
          "-=0.15",
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const filteredSpots = fishingSpots.filter((spot) => {
    const query = search.toLowerCase();

    return (
      spot.name.toLowerCase().includes(query) ||
      spot.location.toLowerCase().includes(query) ||
      spot.fish.some((fish) => fish.toLowerCase().includes(query))
    );
  });

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
          SEARCH
      ====================================================== */}

      <section className="spot-search bg-white px-4 pb-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
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

        <span className="text-xs text-slate-500">Fishing spots near</span>

        <button className="text-xs font-semibold text-slate-900">Kudus</button>

        <ChevronRight size={14} className="text-slate-400" />
      </section>

      {/* =====================================================
          FILTERS
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
              Spots shared by anglers around you
            </p>
          </div>

          <button className="text-xs font-semibold text-emerald-600">
            See map
          </button>
        </div>

        {/* ===================================================
            SPOT LIST
        ==================================================== */}

        <div className="space-y-4">
          {filteredSpots.map((spot) => (
            <FishingSpotCard key={spot.id} spot={spot} />
          ))}
        </div>

        {filteredSpots.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Fish size={24} className="text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
              No fishing spot found
            </h3>

            <p className="mt-1 max-w-[250px] text-xs leading-5 text-slate-400">
              Try another location, fish species, or search keyword.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

/* =============================================================
   FISHING SPOT CARD
============================================================= */

function FishingSpotCard({ spot }: { spot: FishingSpot }) {
  const [saved, setSaved] = useState(spot.isSaved ?? false);

  return (
    <article className="spot-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* IMAGE */}

      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={spot.image}
          alt={spot.name}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />

        {/* Gradient */}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Rating */}

        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-semibold shadow-sm">
          <Star size={12} className="fill-amber-400 text-amber-400" />

          {spot.rating}
        </div>

        {/* Save */}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSaved((prev) => !prev)}
          className={`absolute right-2 top-2 h-9 w-9 rounded-full backdrop-blur-sm ${
            saved
              ? "bg-white text-emerald-600"
              : "bg-black/30 text-white hover:bg-white hover:text-slate-900"
          }`}
        >
          <Bookmark size={17} className={saved ? "fill-current" : ""} />
        </Button>

        {/* Distance */}

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-white">
          <MapPin size={13} />

          {spot.distance}
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

              <span>{spot.location}</span>
            </div>
          </div>

          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
          >
            <ChevronRight size={17} />
          </button>
        </div>

        {/* Description */}

        {spot.description && (
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
            {spot.description}
          </p>
        )}

        {/* Fish */}

        <div className="mt-3 flex gap-1.5 overflow-x-auto scrollbar-none">
          {spot.fish.map((fish) => (
            <span
              key={fish}
              className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-medium text-emerald-700"
            >
              <Fish size={11} />

              {fish}
            </span>
          ))}
        </div>

        {/* Footer */}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users size={14} />

            <span>{spot.anglers} anglers visited</span>
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
