"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SettingsToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
}

export function SettingsToggle({
  checked,
  onCheckedChange,
  disabled = false,
  id,
  ariaLabel,
}: SettingsToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40",
        checked ? "bg-slate-900" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
