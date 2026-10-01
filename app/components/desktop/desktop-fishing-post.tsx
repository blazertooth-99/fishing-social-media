"use client";

import { useState } from "react";
import {
  Bookmark,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Share2,
} from "lucide-react";

import Image from "next/image";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import EditPostDialog from "@/app/components/shared/post/edit-post-dialog";

import {
  formatRelativeTime,
  resolveMediaUrl,
  type ApiPost,
} from "@/lib/api/posts";

interface DesktopFishingPostProps {
  post: ApiPost;
  /** Viewer id — Edit option only shows when it matches the post author. */
  currentUserId?: string | null;
  onPostUpdated?: (post: ApiPost) => void;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function DesktopFishingPost({
  post,
  currentUserId,
  onPostUpdated,
}: DesktopFishingPostProps) {
  const [editOpen, setEditOpen] = useState(false);
  const isOwner = Boolean(currentUserId) && currentUserId === post.author_id;
  const cover = post.media?.[0]
    ? resolveMediaUrl(post.media[0].display_url || post.media[0].thumbnail_url)
    : null;
  const locationLabel = !post.location
    ? null
    : post.location.privacy === "PRIVATE"
      ? "Private location"
      : (post.location.name ?? "Shared location");

  return (
    <Card className="feed-card overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* HEADER */}
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-emerald-50">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
              {initials(post.author_display_name || post.author_username)}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-900">
                {post.author_display_name}
              </p>

              <span className="text-xs text-slate-400">
                {formatRelativeTime(post.created_at)}
              </span>
            </div>

            <p className="text-xs text-slate-400">@{post.author_username}</p>
          </div>
        </div>

        {isOwner ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="rounded-full" />
              }
            >
              <MoreHorizontal size={19} />
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
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreHorizontal size={19} />
          </Button>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-5 pb-4">
        <p className="text-sm leading-6 text-slate-700">{post.content}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {locationLabel && (
            <Badge
              variant="secondary"
              className="gap-1 rounded-full bg-emerald-50 text-emerald-700"
            >
              <MapPin size={13} />
              {locationLabel}
            </Badge>
          )}

          <Badge
            variant="secondary"
            className="gap-1 rounded-full bg-slate-100 text-slate-600"
          >
            {post.privacy}
            {post.location ? ` · ${post.location.privacy}` : ""}
          </Badge>
        </div>
      </div>

      {/* IMAGE — GET /api/v1/posts/{id} -> media[].display_url */}
      {cover && (
        <div className="px-3">
          <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200">
            <Image
              src={cover}
              alt={`Catch by ${post.author_display_name}`}
              fill
              loading="eager"
              sizes="(max-width: 1280px) 60vw, 700px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {locationLabel && (
              <div className="absolute bottom-4 left-4 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                📍 {locationLabel}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACTION */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 rounded-xl px-2 ${
                post.is_liked ? "text-red-500" : "text-slate-500 hover:text-red-500"
              }`}
            >
              <Heart
                size={19}
                fill={post.is_liked ? "currentColor" : "none"}
              />
              {post.like_count}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-xl px-2 text-slate-500"
            >
              <MessageCircle size={19} />
              {post.comment_count}
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

      {isOwner && (
        <EditPostDialog
          post={post}
          open={editOpen}
          onOpenChange={setEditOpen}
          onUpdated={onPostUpdated}
        />
      )}
    </Card>
  );
}
