"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Link as LinkIcon, MapPin, MoreHorizontal, Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import MobileBottomNav from "@/app/components/mobile/mobile-bottom-nav";

import { profileData } from "@/app/utils/constant";

gsap.registerPlugin(ScrollTrigger);

export default function MobileProfile() {
  const containerRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      tl.from(".mobile-profile-item", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.07,
      });

      gsap.to(".mobile-profile-avatar", {
        y: 15,
        scrollTrigger: {
          trigger: profileRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-white pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-100 bg-white/90 px-4 backdrop-blur-xl">
        <div className="text-xl font-semibold tracking-tight">🎣</div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search size={20} />
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreHorizontal size={20} />
          </Button>
        </div>
      </header>

      {/* PROFILE */}
      <section ref={profileRef} className="px-5 pt-6">
        <div className="flex items-start justify-between">
          <div className="mobile-profile-item">
            <h1 className="text-2xl font-bold tracking-tight">
              {profileData.name}
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">
              {profileData.username}
            </p>

            <p className="mt-4 max-w-[240px] text-sm leading-5 text-slate-600">
              {profileData.bio}
            </p>
          </div>

          <Avatar className="mobile-profile-avatar h-20 w-20 border-2 border-white shadow-md">
            <AvatarImage src={profileData.avatar} alt={profileData.name} />

            <AvatarFallback>CA</AvatarFallback>
          </Avatar>
        </div>

        {/* META */}
        <div className="mobile-profile-item mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            Central Java
          </span>

          <span className="flex items-center gap-1">
            <LinkIcon size={14} />
            fishing.community
          </span>
        </div>

        {/* FOLLOWERS */}
        <div className="mobile-profile-item mt-4 flex gap-5 text-sm">
          <span>
            <strong className="text-slate-900">{profileData.followers}</strong>{" "}
            <span className="text-slate-500">Followers</span>
          </span>

          <span>
            <strong className="text-slate-900">{profileData.following}</strong>{" "}
            <span className="text-slate-500">Following</span>
          </span>
        </div>

        {/* ACTION */}
        <div className="mobile-profile-item mt-5 grid grid-cols-2 gap-3">
          <Button variant="outline" className="rounded-xl">
            Edit Profile
          </Button>

          <Button variant="outline" className="rounded-xl">
            Share Profile
          </Button>
        </div>
      </section>

      {/* TABS */}
      <section className="mt-6">
        <Tabs defaultValue="posts">
          <TabsList className="grid h-12 w-full grid-cols-3 rounded-none border-y border-slate-100 bg-white p-0">
            <TabsTrigger
              value="posts"
              className="h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600"
            >
              Posts
            </TabsTrigger>

            <TabsTrigger
              value="replies"
              className="h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600"
            >
              Replies
            </TabsTrigger>

            <TabsTrigger
              value="media"
              className="h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600"
            >
              Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="m-0">
            <MobileEmptyState />
          </TabsContent>

          <TabsContent value="replies" className="m-0">
            <MobileEmptyState text="No replies yet" />
          </TabsContent>

          <TabsContent value="media" className="m-0">
            <MobileEmptyState text="No media yet" />
          </TabsContent>
        </Tabs>
      </section>

      {/* MOBILE NAVIGATION */}
      <MobileBottomNav />
    </main>
  );
}

function MobileEmptyState({ text = "No posts yet" }: { text?: string }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">
        🎣
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">{text}</h3>

      <p className="mt-2 max-w-xs text-sm leading-5 text-slate-500">
        Share your latest catch and fishing adventure with the community.
      </p>

      <Button className="mt-5 rounded-xl bg-emerald-600 hover:bg-emerald-700">
        Create Post
      </Button>
    </div>
  );
}
