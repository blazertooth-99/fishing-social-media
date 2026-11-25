export type BrowserNotificationPermission =
  | NotificationPermission
  | "unsupported";

export function getBrowserNotificationPermission(): BrowserNotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<BrowserNotificationPermission> {
  if (getBrowserNotificationPermission() === "unsupported") {
    return "unsupported";
  }
  if (Notification.permission !== "default") return Notification.permission;

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function canShowBrowserNotification(): boolean {
  return getBrowserNotificationPermission() === "granted";
}

export function showBrowserNotification({
  title,
  body,
  href,
  tag,
}: {
  title: string;
  body: string;
  href: string;
  tag?: string;
}): Notification | null {
  if (!canShowBrowserNotification()) return null;

  try {
    const notification = new Notification(title, { body, tag });
    notification.onclick = () => {
      window.focus();
      window.location.assign(href);
      notification.close();
    };
    return notification;
  } catch {
    return null;
  }
}
