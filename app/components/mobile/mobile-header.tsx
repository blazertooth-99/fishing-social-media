"use client";

import { Bell, CircleUserRound, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#f4f5f3]/90 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-start space-x-2">
        {/* LOGO */}
        <button className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm text-white">
            🎣
          </div>
        </button>
        <h1 className="font-bold text-tactive">FishConnect</h1>

        {/* ACTIONS */}
        {/* <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <Search size={19} />
          </Button>

          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <Bell size={18} />
          </Button>

          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <CircleUserRound size={19} />
          </Button>
        </div> */}
      </div>
    </header>
  );
}
