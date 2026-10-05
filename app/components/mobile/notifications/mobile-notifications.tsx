"use client";

import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import MobileBottomNav from "@/app/components/mobile/mobile-bottom-nav";
import { useNotifications } from "@/app/components/shared/notifications/use-notifications";
import { NotificationRow } from "@/app/components/shared/notifications/notification-widgets";
import type { NotificationFilter } from "@/lib/api/notifications";

const FILTERS: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

export default function MobileNotifications() {
  const router = useRouter();
  const {
    filter,
    changeFilter,
    items,
    loading,
    loadingMore,
    markingAll,
    error,
    hasMore,
    unauthorized,
    unreadVisibleCount,
    handleLoadMore,
    handleRetry,
    handleMarkAsRead,
    handleMarkAllAsRead,
  } = useNotifications();

  if (unauthorized) {
    router.replace("/login");
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-cyan-600">
              Stay in the loop
            </p>
            <h1 className="text-lg font-bold leading-tight text-slate-950">
              Notifications
            </h1>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleMarkAllAsRead}
            disabled={markingAll || unreadVisibleCount === 0}
            className="h-9 w-9 rounded-full"
            aria-label="Mark all as read"
          >
            {markingAll ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCheck size={18} />
            )}
          </Button>
        </div>

        <div className="mt-3 flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => changeFilter(f.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <section className="space-y-3 px-4 pt-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-slate-200/70"
            />
          ))
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <Button
              type="button"
              variant="outline"
              onClick={handleRetry}
              className="mt-3 gap-2 rounded-xl"
            >
              <RefreshCw size={15} />
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center">
            <Bell size={28} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No {filter === "all" ? "" : `${filter} `}notifications yet
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Likes, comments and follows will show up here.
            </p>
          </div>
        ) : (
          <>
            {items.map((n) => (
              <NotificationRow
                key={n.id}
                notification={n}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
            {hasMore && (
              <div className="pt-2 text-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="gap-2 rounded-xl"
                >
                  {loadingMore && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      <MobileBottomNav />
    </main>
  );
}
