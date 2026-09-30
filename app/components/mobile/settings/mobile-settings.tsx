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
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

import { SettingsSectionId } from "@/app/components/shared/settings/settings-types";
import { PrivacySection } from "@/app/components/shared/settings/sections/privacy-section";
import { AccountStatusSection } from "@/app/components/shared/settings/sections/account-status-section";
import { MoreSettingsSection } from "@/app/components/shared/settings/sections/more-settings-section";
import { HelpSection } from "@/app/components/shared/settings/sections/help-section";

const settingsItems: {
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
    description: "Find answers and get support for your account.",
    icon: CircleHelp,
  },
];

export default function MobileSettings() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [activeSection, setActiveSection] = useState<"main" | SettingsSectionId>("main");
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /*
   * ========================================
   * GSAP ANIMATION ON SECTION CHANGE
   * ========================================
   */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (activeSection === "main") {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(".mobile-settings-header", {
            y: -15,
            opacity: 0,
            duration: 0.35,
          })
          .from(
            ".mobile-settings-item",
            {
              x: -15,
              opacity: 0,
              duration: 0.3,
              stagger: 0.06,
            },
            "-=0.1"
          );
      } else {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(".mobile-sub-header", {
            y: -10,
            opacity: 0,
            duration: 0.3,
          })
          .from(
            ".mobile-sub-content",
            {
              x: 15,
              opacity: 0,
              duration: 0.3,
            },
            "-=0.1"
          );
      }
    }, containerRef);

    return () => ctx.revert();
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
      setShowLogoutConfirm(false);
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "privacy":
        return "Privacy";
      case "account-status":
        return "Account Status";
      case "more-settings":
        return "More Settings";
      case "help":
        return "Help & Support";
      default:
        return "Settings";
    }
  };

  return (
    <main ref={containerRef} className="min-h-dvh bg-slate-50 text-slate-900 pb-20">
      {/* ========================================================
          1. MAIN SETTINGS VIEW
      ======================================================== */}
      {activeSection === "main" ? (
        <div>
          {/* STICKY HEADER */}
          <header className="mobile-settings-header sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/90 px-3 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-9 w-9 rounded-full text-slate-700 hover:bg-slate-100"
              >
                <ArrowLeft size={20} />
              </Button>
              <h1 className="text-base font-bold tracking-tight text-slate-900">Settings</h1>
            </div>
          </header>

          {/* LIST GROUP (THREADS STYLE) */}
          <div className="p-4 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm divide-y divide-slate-100">
              {settingsItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className="mobile-settings-item group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors active:bg-slate-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-200">
                      <Icon size={20} strokeWidth={1.8} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="block text-sm font-semibold text-slate-900">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            <CheckCircle2 size={10} />
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">
                        {item.description}
                      </span>
                    </div>

                    <ChevronRight size={18} className="shrink-0 text-slate-300" />
                  </button>
                );
              })}
            </div>

            {/* LOGOUT GROUP */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="mobile-settings-item group flex w-full items-center gap-4 px-4 py-4 text-left text-red-600 transition-colors active:bg-red-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">
                  <LogOut size={20} strokeWidth={1.8} />
                </span>

                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">Logout</span>
                  <span className="mt-0.5 block text-xs text-red-400">
                    Keluar dari akun Anda
                  </span>
                </div>

                <ChevronRight size={18} className="shrink-0 text-red-300" />
              </button>
            </div>

            {/* FOOTER */}
            <div className="pt-6 pb-12 text-center">
              <p className="text-xs font-medium text-slate-400">Fishing Community</p>
              <p className="mt-1 text-[11px] text-slate-300">Made for anglers 🎣</p>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================
            2. SUB-SECTION DRILL-DOWN VIEW
        ======================================================== */
        <div>
          {/* SUBPAGE STICKY HEADER */}
          <header className="mobile-sub-header sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-slate-200/80 bg-white/95 px-3 backdrop-blur-xl">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveSection("main")}
              className="h-9 w-9 rounded-full text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              {getSectionTitle()}
            </h1>
          </header>

          {/* SUBPAGE CONTENT */}
          <div className="mobile-sub-content p-4">
            {activeSection === "privacy" && <PrivacySection />}
            {activeSection === "account-status" && <AccountStatusSection />}
            {activeSection === "more-settings" && <MoreSettingsSection />}
            {activeSection === "help" && <HelpSection />}
          </div>
        </div>
      )}

      {/* ================= MODAL: LOGOUT CONFIRMATION ================= */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl animate-in zoom-in-95">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <LogOut size={22} />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">Konfirmasi Keluar</h3>
            <p className="mt-1 text-xs text-slate-500">
              Apakah Anda yakin ingin keluar dari akun Fishing Community?
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full rounded-full bg-red-600 text-xs font-semibold text-white hover:bg-red-700"
              >
                {loggingOut ? "Logging out..." : "Ya, Keluar"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full rounded-full border-slate-200 text-xs text-slate-700"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
