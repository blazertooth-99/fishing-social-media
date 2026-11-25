"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, X } from "lucide-react";

import { API_BASE_URL } from "@/lib/api/client";
import {
  broadcastNotificationReceived,
  broadcastNotificationsRead,
  getNotificationHref,
  type ApiNotification,
} from "@/lib/api/notifications";
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  showBrowserNotification,
  type BrowserNotificationPermission,
} from "@/lib/browser-notifications";
import { describeNotificationEvent } from "@/app/components/shared/notifications/notification-widgets";
import { useAuth } from "@/app/components/providers/auth-provider";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function parseNotification(raw: string): ApiNotification | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    const envelope = asRecord(parsed);
    const data = asRecord(envelope?.data) ?? envelope;
    if (!data) return null;

    const id = data.id;
    const eventType = data.event_type;
    if (typeof id !== "string" || typeof eventType !== "string") return null;

    const actor = asRecord(data.actor);
    const hasActor = Boolean(actor?.id);

    return {
      ...data,
      id,
      recipient_id:
        typeof data.recipient_id === "string" ? data.recipient_id : "",
      actor: hasActor
        ? {
            id: String(actor?.id),
            username: typeof actor?.username === "string" ? actor.username : "",
            display_name:
              typeof actor?.display_name === "string"
                ? actor.display_name
                : "Someone",
            avatar_media_id:
              typeof actor?.avatar_media_id === "string"
                ? actor.avatar_media_id
                : null,
          }
        : null,
      event_type: eventType,
      entity_type:
        typeof data.entity_type === "string" ? data.entity_type : "POST",
      entity_id: typeof data.entity_id === "string" ? data.entity_id : "",
      is_read: data.is_read === true,
      created_at:
        typeof data.created_at === "string"
          ? data.created_at
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function ToastIcon({ eventType }: { eventType: string }) {
  if (eventType.toUpperCase() === "LIKE") {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <Heart size={17} fill="currentColor" />
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
      <MessageCircle size={17} />
    </span>
  );
}

export default function NotificationStream({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session } = useAuth();
  const [toast, setToast] = useState<ApiNotification | null>(null);
  const [permission, setPermission] =
    useState<BrowserNotificationPermission>(getBrowserNotificationPermission);

  useEffect(() => {
    if (!session?.user_id || typeof window === "undefined") return;

    const source = new EventSource(`${API_BASE_URL}/notifications/stream`, {
      withCredentials: true,
    });

    const onNotification = (event: Event) => {
      const notification = parseNotification(
        (event as MessageEvent<string>).data ?? "",
      );
      if (!notification) return;
      broadcastNotificationReceived(notification);
      broadcastNotificationsRead();
      setToast(notification);

      const eventType = notification.event_type.toUpperCase();
      if (eventType === "LIKE" || eventType === "COMMENT") {
        const actorName =
          notification.actor?.display_name ||
          notification.actor?.username ||
          "Someone";
        showBrowserNotification({
          title: actorName,
          body: describeNotificationEvent(notification.event_type),
          href: getNotificationHref(notification),
          tag: `fishconnect-${notification.id}`,
        });
      }
    };

    source.addEventListener("notification", onNotification);
    source.onerror = (event) => {
      if ((event as { status?: number }).status === 401) source.close();
    };

    return () => {
      source.removeEventListener("notification", onNotification);
      source.close();
    };
  }, [session?.user_id]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <>
      {children}
      {toast && (
        <div
          role="status"
          className="fixed bottom-24 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl md:bottom-6"
        >
          <ToastIcon eventType={toast.event_type} />
          <div className="min-w-0 flex-1 pt-0.5">
            <button
              type="button"
              onClick={() => {
                router.push(getNotificationHref(toast));
                setToast(null);
              }}
              className="block w-full text-left"
            >
              <p className="text-xs leading-5 text-slate-700">
                <span className="font-semibold text-slate-900">
                  {toast.actor?.display_name ||
                    toast.actor?.username ||
                    "Someone"}
                </span>{" "}
                {describeNotificationEvent(toast.event_type)}
              </p>
            </button>
            {permission === "default" && (
              <button
                type="button"
                onClick={() =>
                  void requestBrowserNotificationPermission().then(setPermission)
                }
                className="mt-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Enable browser notifications
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}
