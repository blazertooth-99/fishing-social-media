"use client";

import { Heart, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import type { FishingPostProps } from "@/app/utils/constant";
import Image from "next/image";

interface MobileFishingPostProps {
  post: FishingPostProps;
}

export default function MobileFishingPost({ post }: MobileFishingPostProps) {
  return (
    <article className="mobile-post overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* USER */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-emerald-100 text-emerald-700">
              {post.user.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-slate-900">{post.user}</p>

            <span className="text-[10px] text-slate-400">• {post.time}</span>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
          <MoreHorizontal size={16} />
        </Button>
      </div>

      {/* CAPTION */}
      <div className="px-3 pb-2">
        <p className="text-xs text-slate-700">{post.content}</p>
      </div>

      {/* IMAGE */}
      <div className="px-1">
        <div className="overflow-hidden rounded-xl">
          <Image
            src={post.image}
            alt={`${post.fish} caught by ${post.user}`}
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>
      </div>

      {/* ACTION */}
      <div className="flex items-center justify-between px-2 py-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2 text-[11px] text-slate-500"
          >
            <Heart size={14} />
            {post.likes}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2 text-[11px] text-slate-500"
          >
            <MessageCircle size={14} />
            {post.comments}
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share2 size={14} />
          </Button>
        </div>

        <span className="text-[10px] text-slate-400">{post.location}</span>
      </div>
    </article>
  );
}
