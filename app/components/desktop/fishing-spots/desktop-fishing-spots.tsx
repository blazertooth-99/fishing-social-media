"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MapPin, Star, Users, Fish, Navigation, Search } from "lucide-react";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { fishingSpots } from "@/app/utils/discovery-data";

export default function DesktopFishingSpots() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".spot-card", {
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-8 py-8">
        <header className="mb-8">
          <p className="text-sm font-medium text-cyan-600">
            Find your next adventure
          </p>

          <div className="mt-1 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Fishing Spots</h1>

            <Button className="rounded-xl">
              <Navigation size={17} />
              Near Me
            </Button>
          </div>

          <div className="relative mt-5 max-w-xl">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <Input
              placeholder="Search fishing spots..."
              className="h-11 rounded-xl border-0 bg-white pl-10 shadow-sm"
            />
          </div>
        </header>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Recommended near you</h2>

              <p className="text-sm text-slate-400">
                Based on your location and fishing activity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
            {fishingSpots.map((spot) => (
              <article
                key={spot.id}
                className="spot-card group overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={spot.image}
                    alt={spot.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {spot.recommended && (
                    <Badge className="absolute left-3 top-3 rounded-full bg-white/90 text-slate-800 backdrop-blur">
                      Recommended
                    </Badge>
                  )}

                  <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur">
                    {spot.distance}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold">{spot.name}</h3>

                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <MapPin size={13} />
                    {spot.location}
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
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

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {spot.fish.map((fish) => (
                      <Badge
                        key={fish}
                        variant="secondary"
                        className="rounded-full"
                      >
                        <Fish size={12} />
                        {fish}
                      </Badge>
                    ))}
                  </div>

                  <Button variant="outline" className="mt-5 w-full rounded-xl">
                    View fishing spot
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
