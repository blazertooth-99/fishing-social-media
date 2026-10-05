// lib/api/notifications.ts
// Notifications API client.
// Verified against .agentv1/documentation/FRONTEND_API_GUIDE.md
// (Notifications: list, unread-count, mark single/all as read).

import { apiFetch } from "./client";

export interface ApiNotificationActor {
  id: string;
  username: string;
  display_name: string;
  avatar_media_id: string | null;
  [key: string]: unknown;
}

export interface ApiNotification {
  id: string;
  recipient_id: string;
  actor: ApiNotificationActor | null;
  event_type: string;
  entity_type: string;
  entity_id: string;
  is_read: boolean;
  created_at: string;
  [key: string]: unknown;
}

interface CollectionEnvelope<T> {
  data: T[];
  pagination?: {
    next_cursor?: string | null;
    has_more?: boolean;
    limit?: number;
  } | null;
}

export type NotificationFilter = "all" | "unread" | "read";

/**
 * GET /api/v1/notifications?limit=20&cursor=...&unread_only=false — Auth required.
 * `unread_only=true` returns only unread notifications.
 * There is no server-side "read only" mode, so the `read` filter is applied
 * client-side by the `useNotifications` hook.
 */
export async function listNotifications(opts?: {
  limit?: number;
  cursor?: string | null;
  unreadOnly?: boolean;
}): Promise<{
  items: ApiNotification[];
  nextCursor: string | null;
  hasMore: boolean;
}> {
  const params = new URLSearchParams();
  params.set("limit", String(opts?.limit ?? 20));
  if (opts?.cursor) params.set("cursor", opts.cursor);
  params.set("unread_only", opts?.unreadOnly === true ? "true" : "false");

  const res = await apiFetch<CollectionEnvelope<ApiNotification>>(
    `/notifications?${params.toString()}`,
    { method: "GET" },
  );

  return {
    items: res.data ?? [],
    nextCursor: res.pagination?.next_cursor ?? null,
    hasMore:
      res.pagination?.has_more === true &&
      Boolean(res.pagination?.next_cursor),
  };
}

/**
 * GET /api/v1/notifications/unread-count — Auth required.
 * Response: 200 OK { data: { unread_count } }.
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const res = await apiFetch<{ data: { unread_count: number } }>(
    "/notifications/unread-count",
    { method: "GET" },
  );
  return res.data?.unread_count ?? 0;
}

/**
 * PATCH /api/v1/notifications/{id}/read — Auth required.
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  await apiFetch(`/notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
  });
}

/**
 * POST /api/v1/notifications/read-all — Auth required.
 * Response: 200 OK { data: { marked_count } }.
 */
export async function markAllNotificationsAsRead(): Promise<number> {
  const res = await apiFetch<{ data: { marked_count: number } }>(
    "/notifications/read-all",
    { method: "POST" },
  );
  return res.data?.marked_count ?? 0;
}

/** Event name broadcast when the unread count may have changed. */
export const NOTIFICATIONS_READ_EVENT = "fishconnect:notifications-read";

export function broadcastNotificationsRead(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATIONS_READ_EVENT));
  }
}

export function extractNotificationErrorMessage(
  err: unknown,
  fallback: string,
): string {
  const thrown = err as {
    status?: number;
    data?: {
      error?: { message?: string };
      message?: string;
    };
  };
  const msg =
    thrown?.data?.error?.message || thrown?.data?.message || fallback;
  if (thrown?.status === 401) return "Please log in to continue.";
  return msg;
}
