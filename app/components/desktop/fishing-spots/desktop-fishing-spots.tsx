"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { MapPin, Star, Users, Fish, Search } from "lucide-react";

import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { fishingSpots } from "@/app/utils/discovery-data";

import DesktopSidebar from "../desktop-sidebar";
import DesktopFishingSpotsSidebar from "./desktop-fishing-spots-right-sidebar";

gsap.registerPlugin(ScrollTrigger);

export default function DesktopFishingSpots() {
  const containerRef = useRef<HTMLDivElement>(null);

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
         CARD SCROLL ANIMATION
      ================================= */

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

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Fishing Spots
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Discover fishing locations recommended by anglers and find your
                next favorite spot.
              </p>

              {/* SEARCH */}

              <div className="relative mt-5">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <Input
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
                  Based on your location and fishing activity
                </p>
              </div>

              {/* SPOT GRID */}

              <div className="grid grid-cols-2 gap-5">
                {fishingSpots.map((spot) => (
                  <article
                    key={spot.id}
                    className="spot-card group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* IMAGE */}

                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={spot.image}
                        alt={spot.name}
                        fill
                        loading="eager"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      {/* IMAGE OVERLAY */}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      {/* RECOMMENDED */}

                      {spot.recommended && (
                        <Badge className="absolute left-3 top-3 rounded-full border-0 bg-white/90 text-slate-800 shadow-sm backdrop-blur">
                          Recommended
                        </Badge>
                      )}

                      {/* DISTANCE */}

                      <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                        {spot.distance}
                      </div>
                    </div>

                    {/* CONTENT */}

                    <div className="p-5">
                      <h3 className="font-bold text-slate-900">{spot.name}</h3>

                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={13} />

                        <span>{spot.location}</span>
                      </div>

                      {/* STATS */}

                      <div className="mt-4 flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Star
                            size={14}
                            className="fill-yellow-400 text-yellow-400"
                          />

                          {spot.rating}
                        </span>

                        <span className="flex items-center gap-1 text-slate-400">
                          <Users size={14} />

                          {spot.anglers}
                        </span>
                      </div>

                      {/* FISH */}

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {spot.fish.map((fish) => (
                          <Badge
                            key={fish}
                            variant="secondary"
                            className="rounded-full bg-slate-100 text-slate-600"
                          >
                            <Fish size={12} />

                            {fish}
                          </Badge>
                        ))}
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
            </section>
          </div>
        </section>

        {/* =================================
            RIGHT SIDEBAR
        ================================== */}

        <DesktopFishingSpotsSidebar />
      </div>
    </main>
  );
}
