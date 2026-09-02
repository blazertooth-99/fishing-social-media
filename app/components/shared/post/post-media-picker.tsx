"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Video, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PostMediaPicker() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const url = URL.createObjectURL(file);

    setPreview(url);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        hidden
        onChange={handleFileChange}
      />

      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-video w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-all duration-300 hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-600"
        >
          <ImagePlus size={32} />

          <span className="mt-3 text-sm font-medium">Add your catch</span>

          <span className="mt-1 text-xs text-slate-400">Photo or video</span>
        </button>
      ) : (
        <div className="group relative overflow-hidden rounded-3xl">
          <Image
            src={preview}
            alt="Fishing catch preview"
            width={900}
            height={700}
            className="aspect-video w-full object-cover"
          />

          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={() => setPreview(null)}
            className="absolute right-3 top-3 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70"
          >
            <X size={18} />
          </Button>
        </div>
      )}
    </div>
  );
}
