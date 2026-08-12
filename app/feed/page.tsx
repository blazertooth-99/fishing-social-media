"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Sidebar from "@/app/component/sidebar";
import CreatePost from "@/app/component/create-post";
import FishingPost from "@/app/component/fishing-post";
import RightSidebar from "@/app/component/right-sidebar";

gsap.registerPlugin(ScrollTrigger);

export default function FishingFeed() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const intro = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      intro
        .from(".sidebar-animation", {
          x: -40,
          opacity: 0,
          duration: 0.7,
        })
        .from(
          ".welcome-animation",
          {
            y: 30,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.35"
        )
        .from(
          ".composer-animation",
          {
            y: 25,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.4"
        )
        .from(
          ".right-animation",
          {
            x: 40,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.5"
        );

      gsap.from(".feed-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".feed-container",
          start: "top 80%",
        },
      });

      gsap.utils.toArray<HTMLElement>(".scroll-reveal").forEach((element) => {
        gsap.from(element, {
          y: 40,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="mx-auto min-h-screen max-w-[1600px]"
    >
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_330px]">

        {/* LEFT SIDEBAR */}
        <aside className="sidebar-animation hidden border-r border-slate-200 bg-white lg:block">
          <Sidebar />
        </aside>

        {/* MAIN CONTENT */}
        <section className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">

            {/* MOBILE HEADER */}
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <div>
                <p className="text-sm font-medium text-emerald-600">
                  AnglerHub
                </p>

                <h1 className="text-xl font-bold text-slate-900">
                  Fishing Community
                </h1>
              </div>

              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500" />
            </div>

            {/* WELCOME */}
            <div className="welcome-animation mb-8">
              <p className="mb-1 text-sm font-medium text-emerald-600">
                Good morning, Angler 👋
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Ready for your next
                <span className="text-emerald-600"> catch?</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Share your fishing stories, discover new spots, and connect
                with anglers around you.
              </p>
            </div>

            {/* CREATE POST */}
            <div className="composer-animation mb-8">
              <CreatePost />
            </div>

            {/* FEED */}
            <div className="feed-container">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Latest catches
                  </h2>

                  <p className="text-sm text-slate-500">
                    See what anglers are catching today
                  </p>
                </div>

                <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                  See all
                </button>
              </div>

              <div className="space-y-6">
                <FishingPost
                  user="Andi Pratama"
                  username="@andipratama"
                  time="1h"
                  location="Waduk Jatiluhur"
                  fish="Giant Snakehead"
                  technique="Casting"
                  image="https://images.unsplash.com/photo-1544551763-46a013bb70d5"
                  likes={284}
                  comments={32}
                />

                <FishingPost
                  user="Rizky Angler"
                  username="@rizkyangler"
                  time="3h"
                  location="Pantai Baron"
                  fish="Giant Trevally"
                  technique="Popping"
                  image="https://images.unsplash.com/photo-1518467166778-b88f373ffec7"
                  likes={167}
                  comments={18}
                />

                <FishingPost
                  user="Bima Fishing"
                  username="@bimafishing"
                  time="5h"
                  location="Sungai Progo"
                  fish="Barramundi"
                  technique="Lure Fishing"
                  image="https://images.unsplash.com/photo-1500534623283-312aade485b7"
                  likes={92}
                  comments={11}
                />
              </div>
            </div>

            <div className="scroll-reveal py-16 text-center">
              <p className="text-sm text-slate-400">
                You've reached the end of your feed 🎣
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="right-animation hidden border-l border-slate-200 bg-white xl:block">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}