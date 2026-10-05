"use client";

import { useCallback, useEffect, useState } from "react";

import {
  broadcastNotificationsRead,
  extractNotificationErrorMessage,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type ApiNotification,
  type NotificationFilter,
} from "@/lib/api/notifications";

const PAGE_LIMIT = 20;

export function useNotifications() {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  const load = useCallback(
    async (activeFilter: NotificationFilter, cursor?: string | null, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }
        // The API only supports `unread_only=true|false`. The `read` filter
        // is applied client-side below.
        const { items: fetched, nextCursor: next, hasMore: more } =
          await listNotifications({
            limit: PAGE_LIMIT,
            cursor: cursor ?? undefined,
            unreadOnly: activeFilter === "unread",
          });
        const visible =
          activeFilter === "read"
            ? fetched.filter((n) => n.is_read === true)
            : fetched;
        setItems((prev) => (append ? [...prev, ...visible] : visible));
        setNextCursor(next);
        setHasMore(more);
      } catch (err) {
        const status = (err as { status?: number })?.status;
        if (status === 401 && !append) {
          setUnauthorized(true);
          return;
        }
        if (!append) {
          setError(
            extractNotificationErrorMessage(err, "Failed to load notifications"),
          );
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      setError(null);
      setUnauthorized(false);
      try {
        // The API only supports `unread_only=true|false`. The `read` filter
        // is applied client-side below.
        const { items: fetched, nextCursor: next, hasMore: more } =
          await listNotifications({
            limit: PAGE_LIMIT,
            unreadOnly: filter === "unread",
          });
        if (cancelled) return;
        setItems(
          filter === "read"
            ? fetched.filter((n) => n.is_read === true)
            : fetched,
        );
        setNextCursor(next);
        setHasMore(more);
      } catch (err) {
        if (cancelled) return;
        const status = (err as { status?: number })?.status;
        if (status === 401) {
          setUnauthorized(true);
          return;
        }
        setError(
          extractNotificationErrorMessage(err, "Failed to load notifications"),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  function changeFilter(next: NotificationFilter) {
    if (next === filter) return;
    setItems([]);
    setNextCursor(null);
    setHasMore(false);
    setFilter(next);
  }

  function handleLoadMore() {
    if (!hasMore || loadingMore) return;
    load(filter, nextCursor, true);
  }

  function handleRetry() {
    load(filter, null, false);
  }

  async function handleMarkAsRead(id: string) {
    const target = items.find((n) => n.id === id);
    if (!target || target.is_read) return;
    // Optimistic update; revert on failure.
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    try {
      await markNotificationAsRead(id);
      broadcastNotificationsRead();
    } catch {
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)),
      );
    }
  }

  async function handleMarkAllAsRead() {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      broadcastNotificationsRead();
    } catch {
      // Keep the list as-is; the error is non-fatal here.
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadVisibleCount = items.filter((n) => !n.is_read).length;

  return {
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
  };
}
