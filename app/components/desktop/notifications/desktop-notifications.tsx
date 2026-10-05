"use client";

import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import DesktopSidebar from "@/app/components/desktop/desktop-sidebar";
import { useNotifications } from "@/app/components/shared/notifications/use-notifications";
import { NotificationRow } from "@/app/components/shared/notifications/notification-widgets";
import type { NotificationFilter } from "@/lib/api/notifications";

const FILTERS: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

export default function DesktopNotifications() {
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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[240px_minmax(0,680px)] gap-8 px-8 py-8">
        <aside className="border-r border-slate-200 bg-white">
          <DesktopSidebar />
        </aside>

        <section className="min-w-0">
          <div className="mx-auto max-w-3xl">
            <header className="mb-6">
              <p className="text-sm font-medium text-cyan-600">
                Stay in the loop 🎣
              </p>
              <div className="mt-1 flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                  Notifications
                </h1>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll || unreadVisibleCount === 0}
                  className="gap-2 rounded-xl"
                >
                  {markingAll ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <CheckCheck size={15} />
                  )}
                  Mark all as read
                </Button>
              </div>

              <div className="mt-4 flex gap-2">
                {FILTERS.map((f) => (
                  <Button
                    key={f.value}
                    type="button"
                    variant={filter === f.value ? "default" : "outline"}
                    onClick={() => changeFilter(f.value)}
                    className={`rounded-full px-4 py-1.5 text-sm ${
                      filter === f.value
                        ? "bg-cyan-500 text-white hover:bg-cyan-600"
                        : ""
                    }`}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </header>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-2xl bg-slate-200/70"
                  />
                ))}
              </div>
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
                <div className="space-y-3">
                  {items.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-6 text-center">
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
          </div>
        </section>
      </div>
    </main>
  );
}
