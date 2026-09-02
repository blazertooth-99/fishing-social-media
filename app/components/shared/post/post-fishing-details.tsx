"use client";

import { Fish, MapPin, Waves, CloudSun, Weight, Crosshair } from "lucide-react";

import { Input } from "@/components/ui/input";

export default function PostFishingDetails() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FishingField
        icon={<MapPin size={16} />}
        label="Fishing spot"
        placeholder="Where did you fish?"
      />

      <FishingField
        icon={<Fish size={16} />}
        label="Fish"
        placeholder="What did you catch?"
      />

      <FishingField
        icon={<Crosshair size={16} />}
        label="Technique"
        placeholder="Casting, jigging..."
      />

      <FishingField
        icon={<Weight size={16} />}
        label="Weight"
        placeholder="e.g. 1.8 kg"
      />

      <FishingField
        icon={<CloudSun size={16} />}
        label="Weather"
        placeholder="Sunny, cloudy..."
      />

      <FishingField
        icon={<Waves size={16} />}
        label="Water"
        placeholder="Clear, muddy..."
      />
    </div>
  );
}

function FishingField({
  icon,
  label,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-3 transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50/40">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-emerald-600">{icon}</span>

        {label}
      </div>

      <Input
        placeholder={placeholder}
        className="border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
