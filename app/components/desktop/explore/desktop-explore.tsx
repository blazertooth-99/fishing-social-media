"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Search,
  TrendingUp,
  Heart,
  MessageCircle,
  MapPin,
  Flame,
} from "lucide-react";

import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { explorePosts } from "@/app/utils/discovery-data";
import DesktopSidebar from "../desktop-sidebar";

gsap.registerPlugin(ScrollTrigger);

export default function DesktopExplore() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".explore-header", {
        y: 25,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".explore-card", {
        y: 45,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".explore-feed",
          start: "top 80%",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[240px_minmax(0,680px)_300px] gap-8 px-8 py-8">
        <aside className="border-r border-slate-200 bg-white">
          <DesktopSidebar />
        </aside>
        <section className="col-start-2">
          <header className="explore-header mb-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-600">
                  Discover the fishing world
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  Explore
                </h1>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white"
              >
                <Search size={19} />
              </Button>
            </div>

            <div className="relative mt-5">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />

              <Input
                placeholder="Search fishing posts, anglers..."
                className="h-11 rounded-xl border-0 bg-white pl-10 shadow-sm"
              />
            </div>

            <div className="mt-5 flex gap-2">
              <Button className="rounded-full bg-slate-900">For You</Button>

              <Button variant="outline" className="rounded-full bg-white">
                Trending
              </Button>

              <Button variant="outline" className="rounded-full bg-white">
                Following
              </Button>
            </div>
          </header>

          {/* POSTS */}
          <div className="explore-feed space-y-5">
            {explorePosts.map((post) => (
              <article
                key={post.id}
                className="explore-card overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{post.user.slice(0, 2)}</AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="text-sm font-bold">{post.user}</p>

                        <p className="text-xs text-slate-400">
                          {post.username} · {post.time}
                        </p>
                      </div>
                    </div>

                    <Badge className="rounded-full bg-orange-50 text-orange-600 hover:bg-orange-50">
                      <Flame size={13} />
                      Trending
                    </Badge>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-700">
                    {post.content}
                  </p>

                  <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                    <MapPin size={13} />
                    {post.location}
                  </div>
                </div>

                <div className="relative aspect-16/10 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.content}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>

                <div className="flex items-center gap-2 p-4">
                  <Button variant="ghost" className="rounded-xl text-slate-500">
                    <Heart size={18} />
                    {post.likes}
                  </Button>

                  <Button variant="ghost" className="rounded-xl text-slate-500">
                    <MessageCircle size={18} />
                    {post.comments}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* RIGHT */}
        <aside className="col-start-3 space-y-5">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp size={19} className="text-cyan-500" />

              <h2 className="font-bold">Trending Fishing</h2>
            </div>

            <div className="mt-5 space-y-4">
              {[
                "#casting",
                "#mancingmania",
                "#bassfishing",
                "#freshwater",
                "#fishingtrip",
              ].map((tag, index) => (
                <div key={tag}>
                  <p className="text-sm font-semibold">{tag}</p>

                  <p className="text-xs text-slate-400">
                    {12 - index * 2}.4K posts
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white">
            <p className="text-sm opacity-80">Fishing tip</p>

            <h3 className="mt-2 text-xl font-bold">Share your best catch 🎣</h3>

            <p className="mt-2 text-sm leading-5 opacity-80">
              Bagikan pengalamanmu dan bantu pemancing lain menemukan spot
              terbaik.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
