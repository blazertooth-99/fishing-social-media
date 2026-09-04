"use client";

import {
  ArrowLeft,
  ChevronRight,
  CircleHelp,
  LockKeyhole,
  SlidersHorizontal,
  UserRoundCheck,
} from "lucide-react";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

import { Button } from "@/components/ui/button";

const settingsItems = [
  {
    title: "Privacy",
    description: "Control who can see your content and interact with you.",
    icon: LockKeyhole,
  },
  {
    title: "Account status",
    description: "See if your account or content has any restrictions.",
    icon: UserRoundCheck,
  },
  {
    title: "More settings",
    description:
      "Manage notifications, appearance, language and other preferences.",
    icon: SlidersHorizontal,
  },
  {
    title: "Help",
    description: "Find answers and get support for your account.",
    icon: CircleHelp,
  },
];

export default function MobileSettings() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults: {
            ease: "power3.out",
          },
        })
        .from(".mobile-settings-header", {
          y: -15,
          opacity: 0,
          duration: 0.4,
        })
        .from(
          ".mobile-settings-item",
          {
            x: -20,
            opacity: 0,
            duration: 0.35,
            stagger: 0.08,
          },
          "-=0.15",
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="min-h-dvh bg-white text-slate-900">
      {/* HEADER */}
      <header className="mobile-settings-header sticky top-0 z-20 flex h-16 items-center border-b border-slate-100 bg-white/90 px-4 backdrop-blur-xl">
        <Button variant="ghost" size="icon" className="mr-3 rounded-full">
          <ArrowLeft size={21} />
        </Button>

        <h1 className="text-lg font-semibold">Settings</h1>
      </header>

      {/* SETTINGS */}
      <section className="px-4 py-4">
        {settingsItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              type="button"
              className="mobile-settings-item group flex w-full items-center gap-4 rounded-2xl px-3 py-4 text-left transition-colors active:bg-slate-100"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-600">
                <Icon size={20} strokeWidth={1.8} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{item.title}</span>

                <span className="mt-1 block text-xs leading-5 text-slate-400">
                  {item.description}
                </span>
              </span>

              <ChevronRight size={18} className="shrink-0 text-slate-300" />
            </button>
          );
        })}
      </section>

      <div className="px-7 pb-28 pt-8 text-center">
        <p className="text-xs text-slate-400">Fishing Community</p>

        <p className="mt-1 text-[11px] text-slate-300">Made for anglers 🎣</p>
      </div>
    </main>
  );
}
