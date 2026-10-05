"use client";

import DesktopNotifications from "@/app/components/desktop/notifications/desktop-notifications";
import MobileNotifications from "@/app/components/mobile/notifications/mobile-notifications";

export default function NotificationsController() {
  return (
    <>
      <div className="hidden md:block">
        <DesktopNotifications />
      </div>

      <div className="block md:hidden">
        <MobileNotifications />
      </div>
    </>
  );
}
