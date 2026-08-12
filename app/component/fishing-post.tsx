"use client";

import {
  Bookmark,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Waves,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FishingPostProps {
  user: string;
  username: string;
  time: string;
  location: string;
  fish: string;
  technique: string;
  image: string;
  likes: number;
  comments: number;
}

export default function FishingPost({
  user,
  username,
  time,
  location,
  fish,
  technique,
  image,
  likes,
  comments,
}: FishingPostProps) {
  return (
    <Card className="feed-card overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* HEADER */}
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-emerald-50">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
              {user
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-900">
                {user}
              </p>

              <span className="text-xs text-slate-400">
                {time}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              {username}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
        >
          <MoreHorizontal size={19} />
        </Button>
      </div>

      {/* CONTENT */}
      <div className="px-5 pb-4">
        <p className="text-sm leading-6 text-slate-700">
          What an amazing morning on the water! 🎣
          <br />
          Finally landed this beauty after almost an hour
          of fighting.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="gap-1 rounded-full bg-emerald-50 text-emerald-700"
          >
            <MapPin size={13} />
            {location}
          </Badge>

          <Badge
            variant="secondary"
            className="gap-1 rounded-full bg-blue-50 text-blue-700"
          >
            <Waves size={13} />
            {technique}
          </Badge>

          <Badge
            variant="secondary"
            className="rounded-full bg-orange-50 text-orange-700"
          >
            🎣 {fish}
          </Badge>
        </div>
      </div>

      {/* IMAGE */}
      <div className="px-3">
        <div
          className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 bg-cover bg-center"
          style={{
            backgroundImage: `url(${image})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute bottom-4 left-4 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            📍 {location}
          </div>
        </div>
      </div>

      {/* ACTION */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-xl px-2 text-slate-500 hover:text-red-500"
            >
              <Heart size={19} />
              {likes}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-xl px-2 text-slate-500"
            >
              <MessageCircle size={19} />
              {comments}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-slate-500"
            >
              <Share2 size={18} />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-slate-500"
          >
            <Bookmark size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
}