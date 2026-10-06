"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { MapPin, Search, Star, Waves } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { formatSpotDistance, formatSpotRating } from "@/lib/api/fishing-spots";
import { useFishingSpots } from "@/app/components/shared/use-fishing-spots";
import CreateFishingSpotDialog from "@/app/components/shared/create-fishing-spot-dialog";

import DesktopSidebar from "../desktop-sidebar";
import DesktopFishingSpotsSidebar from "./desktop-fishing-spots-right-sidebar";

gsap.registerPlugin(ScrollTrigger);

export default function DesktopFishingSpots() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { spots, query, setQuery, isLoading, error, reload, prependSpot } =
    useFishingSpots({ limit: 20 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ================================
         HEADER ANIMATION
      ================================= */

      gsap.from(".spot-header", {
        opacity: 0,
        y: 25,
        duration: 0.8,
        ease: "power3.out",
      });

      /* ================================
         SECTION TITLE
      ================================= */

      gsap.from(".spot-section-title", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".spot-section-title",
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (spots.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".spot-card").forEach((card) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 50,
            scale: 0.97,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              end: "top 65%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [spots.length]);

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[240px_minmax(0,680px)_300px] gap-8 px-8 py-8">
        {/* =================================
            LEFT SIDEBAR
        ================================== */}

        <aside className="border-r border-slate-200 bg-white">
          <DesktopSidebar />
        </aside>

        {/* =================================
            MAIN CONTENT
        ================================== */}

        <section className="min-w-0">
          <div className="mx-auto max-w-3xl">
            {/* HEADER */}

            <header className="spot-header mb-8">
              <p className="text-sm font-medium text-cyan-600">
                Find your next adventure
              </p>

              <div className="mt-1 flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Fishing Spots
                </h1>
                <CreateFishingSpotDialog onCreated={prependSpot} />
              </div>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Discover natural fishing spots from the API — live data with
                water type, privacy tier, and coordinates.
              </p>

              {/* SEARCH — GET /discovery/spots?q= */}

              <div className="relative mt-5">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search fishing spots..."
                  className="h-11 rounded-xl border-0 bg-white pl-10 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-cyan-500"
                />
              </div>
            </header>

            {/* =================================
                RECOMMENDED SECTION
            ================================== */}

            <section>
              <div className="spot-section-title mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Recommended near you
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {isLoading
                    ? "Loading spots from API..."
                    : `${spots.length} spot${spots.length === 1 ? "" : "s"} from GET /locations/spots`}
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
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
                <div className="grid grid-cols-2 gap-5">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse overflow-hidden rounded-3xl border border-slate-100 bg-white"
                    >
                      <div className="aspect-[16/10] bg-slate-100" />
                      <div className="space-y-2 p-5">
                        <div className="h-4 w-2/3 rounded bg-slate-100" />
                        <div className="h-3 w-1/2 rounded bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : spots.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
                  <p className="font-semibold text-slate-800">No fishing spots found</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Try another keyword or add the first spot via “Add spot”.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5">
                  {spots.map((spot) => (
                    <article
                      key={spot.id}
                      className="spot-card group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* MAP PLACEHOLDER — API has no photos, show coordinates */}
                      <div className="relative flex aspect-[16/10] flex-col justify-between overflow-hidden bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 p-4 text-white">
                        <div className="flex items-start justify-between gap-2">
                          <Badge className="rounded-full border-0 bg-white/90 text-slate-800 shadow-sm backdrop-blur">
                            {spot.water_type}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="rounded-full bg-black/30 text-white backdrop-blur-md"
                          >
                            {spot.privacy}
                          </Badge>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-lg font-bold">
                            <MapPin size={18} />
                            <span>
                              {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-cyan-50">
                            {formatSpotDistance(spot.distance_meters)} away
                            {typeof spot.review_count === "number"
                              ? ` • ${spot.review_count} review${spot.review_count === 1 ? "" : "s"}`
                              : ""}
                          </p>
                        </div>
                        <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                          {formatSpotDistance(spot.distance_meters)}
                        </div>
                      </div>

                      {/* CONTENT */}

                      <div className="p-5">
                        <h3 className="font-bold text-slate-900">{spot.name}</h3>

                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                          <MapPin size={13} />
                          <span>
                            {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                          </span>
                        </div>

                        {/* STATS */}

                        <div className="mt-4 flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <Star
                              size={14}
                              className="fill-yellow-400 text-yellow-400"
                            />
                            {formatSpotRating(spot.average_rating, spot.review_count)}
                          </span>

                          <span className="flex items-center gap-1 text-slate-400">
                            <Waves size={14} />
                            {spot.water_type}
                          </span>
                        </div>

                        {/* BUTTON */}

                        <Button
                          variant="outline"
                          className="mt-5 w-full rounded-xl border-slate-200 transition-all hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                        >
                          View fishing spot
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>

        {/* =================================
            RIGHT SIDEBAR
        ================================== */}

        <DesktopFishingSpotsSidebar spots={spots} />
      </div>
    </main>
  );
}
