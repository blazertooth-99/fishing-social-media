"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Search, Heart, MessageCircle, MapPin, Flame } from "lucide-react";

import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import MobileHeader from "@/app/components/mobile/mobile-header";
import MobileBottomNav from "@/app/components/mobile/mobile-bottom-nav";

import { explorePosts } from "@/app/utils/discovery-data";

export default function MobileExplore() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".mobile-explore-card", {
        y: 25,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50 pb-24">
      <MobileHeader />

      <div className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Explore</h1>

          <Button size="icon" variant="ghost" className="rounded-full">
            <Search size={20} />
          </Button>
        </div>

        <div className="relative mt-4">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <Input
            placeholder="Search fishing..."
            className="h-10 rounded-full border-0 bg-white pl-9 shadow-sm"
          />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {["For You", "Trending", "Following"].map((item, index) => (
            <Button
              key={item}
              size="sm"
              variant={index === 0 ? "default" : "outline"}
              className="shrink-0 rounded-full"
            >
              {item}
            </Button>
          ))}
        </div>

        <div className="mt-4 space-y-4">
          {explorePosts.map((post) => (
            <article
              key={post.id}
              className="mobile-explore-card overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{post.user.slice(0, 2)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="text-sm font-bold">{post.user}</p>

                    <p className="text-[11px] text-slate-400">{post.time}</p>
                  </div>

                  <Flame size={17} className="text-orange-500" />
                </div>

                <p className="mt-3 text-sm leading-5">{post.content}</p>

                <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                  <MapPin size={12} />
                  {post.location}
                </div>
              </div>

              <div className="relative aspect-[4/3]">
                <Image
                  src={post.image}
                  alt={post.content}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex gap-1 p-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xl text-slate-500"
                >
                  <Heart size={17} />
                  {post.likes}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xl text-slate-500"
                >
                  <MessageCircle size={17} />
                  {post.comments}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <MobileBottomNav />
    </main>
  );
}
