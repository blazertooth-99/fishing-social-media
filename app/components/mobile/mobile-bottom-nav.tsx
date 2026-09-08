"use client";

import {
  Bell,
  CircleUserRound,
  Home,
  MapPinned,
  Menu,
  Plus,
  Search,
  Settings,
  Users,
  Compass,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/router";
import { navigation } from "@/app/utils/constant";

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-5px_20px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2 py-2">
        {navigation.map((item) => {
          const Icon = item.icon;

          // POST BUTTON
          if (item.primary) {
            return (
              <Button
                key={item.label}
                type="button"
                className="flex w-16 flex-col items-center gap-1 bg-transparent hover:bg-transparent hover:scale-110 transition-all duration-110 h-full"
              >
                <Link href="/post">
                  <span className="flex h-9 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 transition-transform active:scale-90">
                    <Icon size={20} />
                  </span>

                  <span className="text-[12px] font-medium text-emerald-600">
                    {item.label}
                  </span>
                </Link>
              </Button>
            );
          }

          // =====================================================
          // MENU DROPDOWN
          // =====================================================

          if (item.dropdown) {
            return (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger
                  type="button"
                  className="
          group
          flex
          h-auto
          w-16
          flex-col
          items-center
          justify-center
          gap-1
          rounded-md
          p-0
          outline-none
        "
                >
                  {/* ICON */}
                  <span
                    className="
            flex
            h-8
            w-10
            items-center
            justify-center
            rounded-xl
            text-slate-400
            transition-all
            duration-200
            group-hover:bg-slate-100
            group-hover:text-emerald-600
            group-data-[state=open]:bg-emerald-50
            group-data-[state=open]:text-emerald-600
          "
                  >
                    <Icon className="!size-6" />
                  </span>

                  {/* LABEL */}
                  <span
                    className="
            text-[15px]
            font-medium
            leading-none
            text-slate-400
            transition-colors
            group-hover:text-slate-700
            group-data-[state=open]:text-emerald-600
          "
                  >
                    {item.label}
                  </span>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side="top"
                  align="center"
                  sideOffset={12}
                  className="
          w-52
          rounded-2xl
          border-slate-200
          bg-white/95
          shadow-2xl
          backdrop-blur-xl
        "
                >
                  <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl px-3 py-3">
                    <CircleUserRound className="!size-[18px] text-slate-500" />
                    <span className="font-medium">Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl px-3 py-3">
                    <Bell className="!size-[18px] text-slate-500" />

                    <span className="font-medium">Notification</span>

                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      3
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl px-3 py-3">
                    <Users className="!size-[18px] text-slate-500" />
                    <span className="font-medium">Community</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl px-3 py-3">
                    <Settings className="!size-[18px] text-slate-500" />
                    <span className="font-medium">Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }
          // NORMAL BUTTON
          return (
            <Button
              key={item.label}
              type="button"
              className="
      group
      flex
      h-auto
      w-16
      flex-col
      items-center
      justify-center
      gap-1
      rounded-md
      bg-transparent
      p-0
      hover:bg-transparent
    "
            >
              {/* ICON */}
              <span
                className="
        flex
        h-8
        w-10
        items-center
        justify-center
        rounded-xl
        text-slate-400
        transition-all
        duration-200
        group-hover:bg-slate-100
        group-hover:text-emerald-600
      "
              >
                <Icon className="!size-6" />
              </span>

              {/* LABEL */}
              <span
                className="
        text-[15px]
        font-medium
        leading-none
        text-slate-400
        transition-colors
        group-hover:text-slate-700
      "
              >
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
