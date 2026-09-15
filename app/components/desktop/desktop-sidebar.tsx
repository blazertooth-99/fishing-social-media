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
import Logo from "@/assets/image/logo/logo_black_500px.png";
import Image from "next/image";
import { menuFeed } from "@/app/utils/constant";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
// import { useAuth } from "@/hooks/use-auth";

const Sidebar = () => {
  const pathname = usePathname();
  // const { logout, user } = useAuth();

  return (
    <div className="sticky top-0 flex h-screen flex-col px-5 py-7">
      {/* LOGO */}
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[100px] bg-icon text-white shadow-lg shadow-blue-600/20">
          <Image
            src={Logo}
            alt="Logo FishConnect"
            width={20}
            className="object-cover"
          />
        </div>

        <div>
          <h1 className="font-bold tracking-tight text-slate-900">
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

          return (
            <Button
              key={item.label}
              className={`
                        group relative w-full justify-start items-center gap-3
                        rounded-2xl px-5 py-5
                        text-base font-medium transition-all duration-200
                        ${
                          isActive
                            ? "bg-primary-hover/S0 text-tactive"
                            : "bg-transparent text-tinactive hover:bg-primary-hover/20"
                        }
                      `}
            >
              <Link href={item.link}>
                <div className="flex items-center gap-3">
                  <Icon
                    size={19}
                    className={`transition-transform duration-200"
                          ${
                            isActive
                              ? "text-tactive"
                              : "text-tinactive group-hover:scale-110 group-hover:text-tactive"
                          }
                      `}
                  />

                  <label
                    className={`
                                      ${
                                        isActive
                                          ? "font-semibold text-tactive"
                                          : "text-tinactive group-hover:text-tactive"
                                      }
                    `}
                  >
                    {item.label}
                  </label>
                </div>
              </Link>
            </Button>
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
              <p className="text-sm font-medium text-slate-800">Freshwater</p>

              <p className="text-xs text-slate-400">12.4k anglers</p>
            </div>
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-slate-50">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500" />

            <div>
              <p className="text-sm font-medium text-slate-800">Saltwater</p>

              <p className="text-xs text-slate-400">8.7k anglers</p>
            </div>
          </button>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="mt-auto">
        <Link href="/settings">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-base text-tinactive hover:bg-icon/10 hover:text-thover">
            <Settings size={20} />
            Settings
          </button>
        </Link>

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
