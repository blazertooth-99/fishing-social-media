import DesktopSettings from "@/app/components/desktop/settings/desktop-settings";
import MobileSettings from "@/app/components/mobile/settings/mobile-settings";

export default function SettingsController() {
  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:block">
        <DesktopSettings />
      </div>

      {/* MOBILE */}
      <div className="block md:hidden">
        <MobileSettings />
      </div>
    </>
  );
}
