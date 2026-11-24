"use client";

import { Flame, Search, TrendingUp } from "lucide-react";

import type { TrendingSearch } from "./use-explore-feed";

interface TrendingSearchesProps {
  items: TrendingSearch[];
  onSelect: (query: string) => void;
  variant?: "sidebar" | "mobile";
}

export default function TrendingSearches({
  items,
  onSelect,
  variant = "sidebar",
}: TrendingSearchesProps) {
  if (variant === "mobile") {
    return (
      <section className="rounded-2xl bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center gap-2 px-1">
          <Flame size={15} className="text-orange-500" />
          <h2 className="text-sm font-bold text-slate-900">
            Trending searches
          </h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item) => (
            <button
              key={item.query}
              type="button"
              onClick={() => onSelect(item.query)}
              className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-cyan-50 hover:text-cyan-700"
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-900">Trending searches</h2>
          <p className="mt-1 text-xs text-slate-400">
            What anglers are looking for
          </p>
        </div>
        <TrendingUp size={19} className="text-orange-500" />
      </div>

      <div className="space-y-1">
        {items.map((item, index) => (
          <button
            key={item.query}
            type="button"
            onClick={() => onSelect(item.query)}
            className="group flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-slate-50"
          >
            <span className="w-4 shrink-0 text-center text-xs font-bold text-slate-300">
              {index + 1}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-800">
                {item.label}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                {item.meta}
              </span>
            </span>

            <Search
              size={14}
              className="shrink-0 text-slate-300 transition-colors group-hover:text-cyan-500"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
