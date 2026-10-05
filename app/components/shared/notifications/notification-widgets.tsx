"use client";

import {
  AtSign,
  Bell,
  CalendarDays,
  Heart,
  MessageCircle,
  UserPlus,
} from "lucide-react";

import { formatRelativeTime } from "@/lib/api/posts";
import type { ApiNotification } from "@/lib/api/notifications";

/** Human-readable action for a notification event type. */
export function describeNotificationEvent(eventType: string): string {
  switch (eventType.toUpperCase()) {
    case "LIKE":
      return "liked your post";
    case "COMMENT":
      return "commented on your post";
    case "FOLLOW":
      return "started following you";
    case "MENTION":
      return "mentioned you";
    case "EVENT_INVITE":
    case "EVENT_ACTIVITY":
      return "shared an event update";
    case "COMMUNITY_INVITE":
      return "invited you to a community";
    case "COMMUNITY_POST":
      return "posted in your community";
    default:
      return eventType
        .toLowerCase()
        .split("_")
        .filter(Boolean)
        .join(" ");
  }
}

function NotificationIcon({ eventType }: { eventType: string }) {
  const normalized = eventType.toUpperCase();
  const className = "text-white";
  const size = 18;
  if (normalized === "LIKE")
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-red-500">
        <Heart size={size} className={className} />
      </span>
    );
  if (normalized === "COMMENT")
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500">
        <MessageCircle size={size} className={className} />
      </span>
    );
  if (normalized === "FOLLOW")
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500">
        <UserPlus size={size} className={className} />
      </span>
    );
  if (normalized === "MENTION")
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500">
        <AtSign size={size} className={className} />
      </span>
    );
  if (normalized.startsWith("EVENT"))
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
        <CalendarDays size={size} className={className} />
      </span>
    );
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500">
      <Bell size={size} className={className} />
    </span>
  );
}

function actorInitials(name: string) {
  return name
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function NotificationRow({
  notification,
  onMarkAsRead,
}: {
  notification: ApiNotification;
  onMarkAsRead: (id: string) => void;
}) {
  const actorName =
    notification.actor?.display_name ||
    notification.actor?.username ||
    "Someone";
  const unread = !notification.is_read;

  return (
    <button
      type="button"
      onClick={() => onMarkAsRead(notification.id)}
      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
        unread
          ? "border-cyan-100 bg-cyan-50/60 hover:bg-cyan-50"
          : "border-slate-100 bg-white hover:bg-slate-50"
      }`}
    >
      {notification.actor ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">
          {actorInitials(actorName)}
        </span>
      ) : (
        <NotificationIcon eventType={notification.event_type} />
      )}

      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-6 text-slate-700">
          <span className="font-semibold text-slate-900">{actorName}</span>{" "}
          {describeNotificationEvent(notification.event_type)}
          <span className="ml-1.5 whitespace-nowrap text-xs text-slate-400">
            {formatRelativeTime(notification.created_at)}
          </span>
        </span>
        <span className="mt-0.5 block text-[11px] uppercase tracking-wide text-slate-400">
          {notification.event_type} · {notification.entity_type}
        </span>
      </span>

      {unread && (
        <span
          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-500"
          aria-label="Unread"
        />
      )}
    </button>
  );
}
