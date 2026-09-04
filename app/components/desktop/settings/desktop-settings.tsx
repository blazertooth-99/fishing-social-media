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
    description:
      "Find answers and get support for your Fishing Community account.",
    icon: CircleHelp,
  },
];

export default function DesktopSettings() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      tl.from(".settings-header", {
        y: -20,
        opacity: 0,
        duration: 0.45,
      })
        .from(
          ".settings-card",
          {
            y: 30,
            opacity: 0,
            duration: 0.5,
          },
          "-=0.2",
        )
        .from(
          ".settings-item",
          {
            y: 15,
            opacity: 0,
            duration: 0.35,
            stagger: 0.08,
          },
          "-=0.25",
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={containerRef}
      className="min-h-screen bg-slate-50 text-slate-900"
    >
      <div className="mx-auto max-w-3xl px-8 py-10">
        {/* HEADER */}
        <header className="settings-header mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-slate-200"
          >
            <ArrowLeft size={21} />
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your Fishing Community experience.
            </p>
          </div>
        </header>

        {/* SETTINGS CARD */}
        <section className="settings-card overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {settingsItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                type="button"
                className={`settings-item group flex w-full items-center gap-5 px-6 py-5 text-left transition-colors hover:bg-emerald-50/60 ${
                  index !== settingsItems.length - 1
                    ? "border-b border-slate-100"
                    : ""
                }`}
              >
                {/* ICON */}
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-all duration-300 group-hover:bg-emerald-100 group-hover:text-emerald-600 group-hover:scale-105">
                  <Icon size={21} strokeWidth={1.8} />
                </span>

                {/* CONTENT */}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">
                    {item.title}
                  </span>

                  <span className="mt-1 block max-w-xl text-sm leading-5 text-slate-500">
                    {item.description}
                  </span>
                </span>

                {/* ARROW */}
                <ChevronRight
                  size={19}
                  className="shrink-0 text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-emerald-600"
                />
              </button>
            );
          })}
        </section>

        {/* BRAND FOOTER */}
        <p className="mt-8 text-center text-xs text-slate-400">
          Fishing Community · Made for anglers 🎣
        </p>
      </div>
    </main>
  );
}
