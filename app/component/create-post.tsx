"use client";

import {
  Camera,
  Fish,
  ImagePlus,
  MapPin,
  Send,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CreatePost() {
  return (
    <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
      <div className="p-5">
        <div className="flex gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback className="bg-emerald-100 text-emerald-700">
              CS
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <button className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-slate-100">
              What did you catch today?
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 rounded-xl text-slate-500"
          >
            <ImagePlus size={17} />
            Photo
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 rounded-xl text-slate-500"
          >
            <MapPin size={17} />
            Location
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 rounded-xl text-slate-500"
          >
            <Fish size={17} />
            Catch
          </Button>

          <div className="ml-auto">
            <Button className="gap-2 rounded-xl bg-emerald-600 px-5 hover:bg-emerald-700">
              Post
              <Send size={15} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}