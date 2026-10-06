"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Logo from "@/assets/image/logo/logo_black_500px.png";
import Image from "next/image";
import { menuFeed } from "@/app/utils/constant";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import {
  NOTIFICATIONS_READ_EVENT,
  getUnreadNotificationCount,
} from "@/lib/api/notifications";
import { useJoinedCommunities } from "@/app/components/shared/community/use-joined-communities";
// import { useAuth } from "@/hooks/use-auth";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  // const { logout, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const {
    communities: joinedCommunities,
    isLoading: joinedLoading,
    error: joinedError,
    isLoggedOut: joinedLoggedOut,
    reload: reloadJoined,
  } = useJoinedCommunities({ limit: 20, maxPages: 5 });

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const count = await getUnreadNotificationCount();
        if (!cancelled) setUnreadCount(count);
      } catch {
        // Silently ignore (e.g. logged out) — no badge shown.
      }
    }
    init();
    async function onNotificationsRead() {
      try {
        const count = await getUnreadNotificationCount();
        if (!cancelled) setUnreadCount(count);
      } catch {
        // Silently ignore — badge keeps its last value.
      }
    }
    window.addEventListener(NOTIFICATIONS_READ_EVENT, onNotificationsRead);
    return () => {
      cancelled = true;
      window.removeEventListener(NOTIFICATIONS_READ_EVENT, onNotificationsRead);
    };
  }, [pathname]);

  return (
    <div className="sticky top-0 flex h-screen flex-col px-5 py-7 bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* LOGO */}
      <div
        onClick={() => router.push("/feed")}
        className="mb-10 flex items-center gap-3 cursor-pointer"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-[100px] bg-icon text-white shadow-lg shadow-blue-600/20">
          <Image
            src={Logo}
            alt="Logo FishConnect"
            width={20}
            className="object-cover"
          />
        </div>

        <div>
          <h1 className="font-bold tracking-tight text-slate-900 dark:text-white">
            FishConnect
          </h1>

          <p className="text-xs text-slate-400">Fishing community</p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="space-y-1">
        {menuFeed.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.link;
          const showBadge = item.link === "/notifications" && unreadCount > 0;

          return (
            <Button
              key={item.label}
              onClick={() => router.push(item.link)}
              className={`
                group relative w-full justify-start items-center gap-3
                rounded-2xl px-2 py-2 h-auto cursor-pointer
                text-base font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-primary-hover/50 text-tactive"
                    : "bg-transparent text-tinactive hover:bg-primary-hover/20 hover:text-thover"
                }
              `}
            >
              <span className="relative">
                <Icon
                  size={19}
                  className={`transition-transform duration-200 ${
                    isActive
                      ? "text-tactive"
                      : "text-tinactive group-hover:scale-110 group-hover:text-tactive"
                  }`}
                />
                {/* {showBadge && (
                  <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )} */}
              </span>

              <span
                className={
                  isActive
                    ? "font-semibold text-tactive"
                    : "text-tinactive group-hover:text-tactive"
                }
              >
                {item.label}
              </span>

              {showBadge && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          );
        })}
      </nav>

      <Separator className="my-7" />

      {/* YOUR COMMUNITIES — joined by user (GET /communities filtered is_member) */}
      <div>
        <div className="mb-4 flex items-center justify-between px-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Your communities
          </p>

          <button
            onClick={() => router.push("/community")}
            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
          >
            See all
          </button>
        </div>

        {joinedLoading && joinedCommunities.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-3 rounded-xl p-2"
              >
                <div className="h-9 w-9 rounded-full bg-slate-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 rounded bg-slate-100" />
                  <div className="h-2.5 w-1/3 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : joinedCommunities.length > 0 ? (
          <div className="space-y-1">
            {joinedCommunities.slice(0, 5).map((community) => (
              <button
                key={community.id}
                onClick={() =>
                  router.push(
                    `/community/${encodeURIComponent(community.slug || community.id)}`,
                  )
                }
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-slate-50"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-emerald-100 text-xs font-bold text-emerald-700">
                    {community.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {community.name}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {(community.member_count ?? 0).toLocaleString()} members
                    {community.my_role ? ` • ${community.my_role}` : ""}
                  </p>
                </div>
              </button>
            ))}
            {joinedError && (
              <button
                onClick={() => void reloadJoined()}
                className="w-full rounded-xl p-2 text-left text-[11px] font-medium text-slate-400 hover:text-slate-600"
              >
                Couldn&apos;t refresh — tap to retry
              </button>
            )}
          </div>
        ) : joinedLoggedOut ? (
          <div className="rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            Log in to see communities you joined.
          </div>
        ) : joinedError ? (
          <div className="rounded-2xl bg-red-50 p-3 text-xs leading-5 text-red-600">
            {joinedError}
            <button
              onClick={() => void reloadJoined()}
              className="mt-1 block font-semibold underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            You haven&apos;t joined any community yet.
            <button
              onClick={() => router.push("/community")}
              className="mt-1 block font-semibold text-emerald-600"
            >
              Browse communities
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM */}
      <div className="mt-auto">
        <Button
          onClick={() => router.push("/settings")}
          className={`
            group relative w-full justify-start items-center gap-3
            rounded-2xl px-5 py-5 h-auto cursor-pointer
            text-base font-medium transition-all duration-200
            ${
              pathname === "/settings"
                ? "bg-primary-hover/50 text-tactive"
                : "bg-transparent text-tinactive hover:bg-primary-hover/20 hover:text-thover"
            }
          `}
        >
          <Settings
            size={19}
            className={`transition-transform duration-200 ${
              pathname === "/settings"
                ? "text-tactive"
                : "text-tinactive group-hover:scale-110 group-hover:text-tactive"
            }`}
          />
          <span
            className={
              pathname === "/settings"
                ? "font-semibold text-tactive"
                : "text-tinactive group-hover:text-tactive"
            }
          >
            Settings
          </span>
        </Button>

        {/* <div className="mt-4 flex flex-col gap-2 rounded-2xl p-2 hover:bg-slate-50">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {user?.display_name?.slice(0, 2).toUpperCase() ||
                  user?.name?.slice(0, 2).toUpperCase() ||
                  "AN"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.display_name || user?.name || "Angler"}
              </p>

              <p className="truncate text-xs text-slate-400">
                {user?.username
                  ? `@${user.username}`
                  : user?.email || "@angler"}
              </p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div> */}
      </div>
    </div>
  );
};
export default Sidebar;
