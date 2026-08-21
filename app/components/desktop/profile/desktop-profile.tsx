"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MoreHorizontal,
  Search,
  MapPin,
  Link as LinkIcon,
  UserPlus,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import DesktopSidebar from "@/app/components/desktop/desktop-sidebar";
import { profileData } from "@/app/utils/constant";

gsap.registerPlugin(ScrollTrigger);

export default function DesktopProfile() {
  const containerRef = useRef<HTMLDivElement>(null);
  const profileHeaderRef = useRef<HTMLDivElement>(null);
  const profileContentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // HEADER ENTRANCE
      gsap.from(".profile-hero-item", {
        opacity: 0,
        y: 25,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      });

      // PROFILE CONTENT
      gsap.from(".profile-content", {
        opacity: 0,
        y: 35,
        duration: 0.8,
        delay: 0.25,
        ease: "power3.out",
      });

      // AVATAR PARALLAX
      gsap.to(".profile-avatar", {
        y: 12,
        scrollTrigger: {
          trigger: profileHeaderRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-[240px_minmax(0,1fr)_320px]">
        {/* SIDEBAR */}
        <aside className="border-r border-slate-200 bg-white">
          <DesktopSidebar />
        </aside>

        {/* PROFILE */}
        <section className="min-w-0">
          {/* TOP BAR */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/85 px-8 backdrop-blur-xl">
            <p className="font-medium text-slate-900">{profileData.username}</p>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Search size={20} />
              </Button>

              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal size={20} />
              </Button>
            </div>
          </header>

          {/* PROFILE HEADER */}
          <div
            ref={profileHeaderRef}
            className="border-b border-slate-200 bg-white"
          >
            {/* COVER */}
            <div className="relative h-44 overflow-hidden bg-gradient-to-r from-emerald-700 via-cyan-700 to-blue-700">
              <div className="absolute inset-0 bg-black/10" />

              <div className="absolute bottom-5 left-8">
                <div className="profile-hero-item rounded-full bg-white/15 px-3 py-1 text-xs text-white backdrop-blur-md">
                  🎣 Fishing Community
                </div>
              </div>
            </div>

            {/* PROFILE INFO */}
            <div className="relative px-8 pb-8">
              <Avatar className="profile-avatar absolute -top-16 h-32 w-32 border-4 border-white shadow-xl">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback>CA</AvatarFallback>
              </Avatar>

              <div className="flex justify-end gap-3 pt-5">
                <Button variant="outline" className="rounded-xl">
                  Share Profile
                </Button>

                <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                  Edit Profile
                </Button>
              </div>

              <div className="profile-hero-item mt-5 pt-5">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                  {profileData.name}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  {profileData.username}
                </p>

                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
                  {profileData.bio}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} />
                    Central Java
                  </span>

                  <span className="flex items-center gap-1.5">
                    <LinkIcon size={15} />
                    fishing.community
                  </span>
                </div>

                <div className="mt-5 flex gap-6">
                  <div>
                    <span className="font-bold text-slate-900">
                      {profileData.followers}
                    </span>

                    <span className="ml-1 text-sm text-slate-500">
                      Followers
                    </span>
                  </div>

                  <div>
                    <span className="font-bold text-slate-900">
                      {profileData.following}
                    </span>

                    <span className="ml-1 text-sm text-slate-500">
                      Following
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PROFILE CONTENT */}
          <div
            ref={profileContentRef}
            className="profile-content mx-auto max-w-3xl"
          >
            <Tabs defaultValue="posts">
              <TabsList className="grid h-14 w-full grid-cols-3 rounded-none border-b border-slate-200 bg-white p-0">
                <TabsTrigger
                  value="posts"
                  className="h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600"
                >
                  Posts
                </TabsTrigger>

                <TabsTrigger
                  value="replies"
                  className="h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600"
                >
                  Replies
                </TabsTrigger>

                <TabsTrigger
                  value="media"
                  className="h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600"
                >
                  Media
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="m-0">
                <ProfileEmptyState />
              </TabsContent>

              <TabsContent value="replies" className="m-0">
                <ProfileEmptyState text="No replies yet" />
              </TabsContent>

              <TabsContent value="media" className="m-0">
                <ProfileEmptyState text="No media yet" />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="border-l border-slate-200 bg-white">
          <div className="sticky top-0 p-6">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-semibold">Suggested Anglers</p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Discover anglers and fishing communities around you.
              </p>

              <Button variant="outline" className="mt-4 w-full rounded-xl">
                Explore
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function ProfileEmptyState({ text = "No posts yet" }: { text?: string }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">
        🎣
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-900">{text}</h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Share your latest catch, fishing spot, or story with the fishing
        community.
      </p>

      <Button className="mt-5 rounded-xl bg-emerald-600 hover:bg-emerald-700">
        Create Post
      </Button>
    </div>
  );
}
