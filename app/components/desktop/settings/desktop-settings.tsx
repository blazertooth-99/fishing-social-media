"use client";

import {
  ArrowLeft,
  ChevronRight,
  CircleHelp,
  LockKeyhole,
  LogOut,
  SlidersHorizontal,
  UserRoundCheck,
  CheckCircle2,
} from "lucide-react";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

import { SettingsSectionId } from "@/app/components/shared/settings/settings-types";
import { PrivacySection } from "@/app/components/shared/settings/sections/privacy-section";
import { AccountStatusSection } from "@/app/components/shared/settings/sections/account-status-section";
import { MoreSettingsSection } from "@/app/components/shared/settings/sections/more-settings-section";
import { HelpSection } from "@/app/components/shared/settings/sections/help-section";

const settingsNavItems: {
  id: SettingsSectionId;
  title: string;
  description: string;
  icon: any;
  badge?: string;
}[] = [
  {
    id: "privacy",
    title: "Privacy",
    description: "Control who can see your content and interact with you.",
    icon: LockKeyhole,
  },
  {
    id: "account-status",
    title: "Account status",
    description: "See if your account or content has any restrictions.",
    icon: UserRoundCheck,
    badge: "Good standing",
  },
  {
    id: "more-settings",
    title: "More settings",
    description: "Manage notifications, appearance, language and preferences.",
    icon: SlidersHorizontal,
  },
  {
    id: "help",
    title: "Help",
    description: "Find answers and get support for your Fishing Community account.",
    icon: CircleHelp,
  },
];

export default function DesktopSettings() {
  const containerRef = useRef<HTMLDivElement>(null);
  const detailPanelRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const [activeSection, setActiveSection] = useState<SettingsSectionId>("privacy");
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  /*
   * ========================================
   * CHECK SESSION
   * Only redirect when the server definitively says unauthenticated
   * (null session). Transient network/API failures show a retry UI
   * instead — they must never bounce a logged-in user to /login.
   * ========================================
   */
  useLayoutEffect(() => {
    let cancelled = false;
    async function checkSession() {
      setCheckingSession(true);
      setSessionError(null);
      try {
        const session = await api.getSession();
        if (cancelled) return;
        if (!session?.data) {
          router.replace("/login");
          return;
        }
      } catch (error) {
        if (cancelled) return;
        console.error("SESSION CHECK ERROR:", error);
        setSessionError("Failed to verify your session. Check your connection and try again.");
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  /*
   * ========================================
   * GSAP ANIMATION ON MOUNT
   * ========================================
   */
  useLayoutEffect(() => {
    if (checkingSession) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      tl.from(".settings-sidebar", {
        x: -25,
        opacity: 0,
        duration: 0.45,
      }).from(
        ".settings-content-panel",
        {
          y: 20,
          opacity: 0,
          duration: 0.45,
        },
        "-=0.25"
      );
    }, containerRef);

    return () => ctx.revert();
  }, [checkingSession]);

  /*
   * ========================================
   * GSAP TRANSITION ON SECTION CHANGE
   * ========================================
   */
  useLayoutEffect(() => {
    if (!detailPanelRef.current) return;

    gsap.fromTo(
      detailPanelRef.current,
      { opacity: 0.3, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  }, [activeSection]);

  /*
   * ========================================
   * LOGOUT
   * ========================================
   */
  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      await api.logout();
      router.replace("/login");
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
      api.setSessionToken(null);
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">Checking session...</p>
      </main>
    );
  }

  if (sessionError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-800">Connection problem</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{sessionError}</p>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 rounded-xl"
            >
              Go back
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            >
              Try again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const currentItem = settingsNavItems.find((item) => item.id === activeSection);

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* TOP BAR / NAVIGATION */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-200/60 pb-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-slate-200"
              title="Kembali"
            >
              <ArrowLeft size={20} strokeWidth={1.8} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
              <p className="text-xs text-slate-500">
                Kelola privasi, status akun, dan preferensi Fishing Community
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Fishing Community · Threads Meta UI Standard
          </div>
        </div>

        {/* TWO-COLUMN MASTER-DETAIL LAYOUT */}
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR: NAVIGATION MENU */}
          <aside className="settings-sidebar col-span-4 sticky top-8 space-y-4">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
              <nav className="space-y-1">
                {settingsNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={`group flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-left transition-all ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isActive
                            ? "bg-white/10 text-white"
                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                        }`}
                      >
                        <Icon size={19} strokeWidth={1.8} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="block text-sm font-semibold truncate">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                isActive
                                  ? "bg-emerald-400/20 text-emerald-300"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              <CheckCircle2 size={10} />
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span
                          className={`mt-0.5 block text-xs line-clamp-1 ${
                            isActive ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          {item.description}
                        </span>
                      </div>

                      <ChevronRight
                        size={16}
                        className={`shrink-0 transition-transform ${
                          isActive ? "text-white" : "text-slate-300 group-hover:translate-x-0.5"
                        }`}
                      />
                    </button>
                  );
                })}

                <div className="my-2 border-t border-slate-100" />

                {/* LOGOUT BUTTON */}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="group flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-left text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500 transition-colors group-hover:bg-red-200">
                    <LogOut size={19} strokeWidth={1.8} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {loggingOut ? "Logging out..." : "Logout"}
                    </span>
                    <span className="mt-0.5 block text-xs text-red-400">
                      Keluar dari akun Anda
                    </span>
                  </div>

                  <ChevronRight size={16} className="shrink-0 text-red-300" />
                </button>
              </nav>
            </div>

            {/* FOOTER INFO */}
            <div className="px-4 py-2 text-center text-xs text-slate-400">
              <p>Fishing Community Web App</p>
              <p className="mt-0.5 text-[11px] text-slate-300">Made for anglers 🎣</p>
            </div>
          </aside>

          {/* RIGHT PANEL: ACTIVE SETTINGS SECTION */}
          <section className="settings-content-panel col-span-8">
            <div
              ref={detailPanelRef}
              className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm"
            >
              {/* SECTION HEADER */}
              <div className="mb-6 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <span>Settings</span>
                  <span>/</span>
                  <span className="text-slate-900 font-semibold">{currentItem?.title}</span>
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {currentItem?.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {currentItem?.description}
                </p>
              </div>

              {/* RENDER ACTIVE SECTION CONTENT */}
              {activeSection === "privacy" && <PrivacySection />}
              {activeSection === "account-status" && <AccountStatusSection />}
              {activeSection === "more-settings" && <MoreSettingsSection />}
              {activeSection === "help" && <HelpSection />}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}