"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Share2,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Image from "next/image";

import EditPostDialog from "@/app/components/shared/post/edit-post-dialog";

import {
  formatRelativeTime,
  resolveMediaUrl,
  type ApiPost,
} from "@/lib/api/posts";

interface MobileFishingPostProps {
  post: ApiPost;
  /** Viewer id — Edit option only shows when it matches the post author. */
  currentUserId?: string | null;
  onPostUpdated?: (post: ApiPost) => void;
}

export default function MobileFishingPost({
  post,
  currentUserId,
  onPostUpdated,
}: MobileFishingPostProps) {
  const [editOpen, setEditOpen] = useState(false);
  const isOwner = Boolean(currentUserId) && currentUserId === post.author_id;
  const cover = post.media?.[0]
    ? resolveMediaUrl(post.media[0].thumbnail_url || post.media[0].display_url)
    : null;
  const locationLabel = !post.location
    ? null
    : post.location.privacy === "PRIVATE"
      ? "Private location"
      : (post.location.name ?? "Shared location");

  return (
    <article className="mobile-post overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* USER */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-emerald-100 text-emerald-700">
              {(post.author_display_name || post.author_username)
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-slate-900">
              {post.author_display_name}
            </p>

            <span className="text-[10px] text-slate-400">
              • {formatRelativeTime(post.created_at)}
            </span>
          </div>
        </div>

        {isOwner ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                />
              }
            >
              <MoreHorizontal size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => setEditOpen(true)}
                className="cursor-pointer gap-2"
              >
                <Pencil size={15} />
                <span>Edit post</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
            <MoreHorizontal size={16} />
          </Button>
        )}
      </div>

      {/* CAPTION */}
      <div className="px-3 pb-2">
        <p className="text-xs text-slate-700">{post.content}</p>
      </div>

      {/* IMAGE — GET /api/v1/posts/{id} -> media[].thumbnail_url */}
      {cover && (
        <div className="px-1">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src={cover}
              alt={`Catch by ${post.author_display_name}`}
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-cover transition-transform duration-500 hover:scale-[1.02]"
              unoptimized
            />
          </div>
        </div>
      )}

      {/* ACTION */}
      <div className="flex items-center justify-between px-2 py-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 gap-1 px-2 text-[11px] ${
              post.is_liked ? "text-red-500" : "text-slate-500"
            }`}
          >
            <Heart size={14} fill={post.is_liked ? "currentColor" : "none"} />
            {post.like_count}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2 text-[11px] text-slate-500"
          >
            <MessageCircle size={14} />
            {post.comment_count}
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share2 size={14} />
          </Button>
        </div>

        {locationLabel && (
          <span className="truncate pl-2 text-[10px] text-slate-400">
            📍 {locationLabel}
          </span>
        )}
      </div>

      {isOwner && (
        <EditPostDialog
          post={post}
          open={editOpen}
          onOpenChange={setEditOpen}
          onUpdated={onPostUpdated}
        />
      )}
    </article>
  );
}
