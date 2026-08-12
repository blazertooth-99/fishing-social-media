"use client";

import {
  Compass,
  Fish,
  Home,
  MapPinned,
  MessageCircle,
  Settings,
  Users,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const menu = [
  {
    label: "Home",
    icon: Home,
    active: true,
  },
  {
    label: "Explore",
    icon: Compass,
  },
  {
    label: "Fishing Spots",
    icon: MapPinned,
  },
  {
    label: "Community",
    icon: Users,
  },
  {
    label: "Messages",
    icon: MessageCircle,
  },
  {
    label: "My Profile",
    icon: UserRound,
  },
];

const Sidebar = () => {
  return (
    <div className="sticky top-0 flex h-screen flex-col px-5 py-7">
      {/* LOGO */}
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
          <Fish size={22} />
        </div>

        <div>
          <h1 className="font-bold tracking-tight text-slate-900">
            AnglerHub
          </h1>

          <p className="text-xs text-slate-400">
            Fishing community
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className={`
                group flex w-full items-center gap-3 rounded-xl px-3 py-3
                text-sm font-medium transition-all duration-200
                ${
                  item.active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              <Icon
                size={19}
                className="transition-transform duration-200 group-hover:scale-110"
              />

              {item.label}
            </button>
          );
        })}
      </nav>

      <Separator className="my-7" />

      {/* QUICK COMMUNITY */}
      <div>
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Your communities
        </p>

        <div className="space-y-3">
          <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-slate-50">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500" />

            <div>
              <p className="text-sm font-medium text-slate-800">
                Freshwater
              </p>

              <p className="text-xs text-slate-400">
                12.4k anglers
              </p>
            </div>
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-slate-50">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500" />

            <div>
              <p className="text-sm font-medium text-slate-800">
                Saltwater
              </p>

              <p className="text-xs text-slate-400">
                8.7k anglers
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="mt-auto">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-50">
          <Settings size={18} />

          Settings
        </button>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <Avatar>
            <AvatarFallback>CS</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              Christian
            </p>

            <p className="truncate text-xs text-slate-400">
              @christianangler
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Sidebar;