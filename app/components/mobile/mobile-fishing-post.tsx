"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Image from "next/image";

import EditPostDialog from "@/app/components/shared/post/edit-post-dialog";
import CommunityTag from "@/app/components/shared/post/community-tag";
import PostActions from "@/app/components/shared/post/post-actions";

import {
  formatRelativeTime,
  resolveMediaUrl,
  type ApiPost,
} from "@/lib/api/posts";
import { getAvatarUrl } from "@/lib/api/media";

interface MobileFishingPostProps {
  post: ApiPost;
  /** Viewer id — Edit option only shows when it matches the post author. */
  currentUserId?: string | null;
  onPostUpdated?: (post: ApiPost) => void;
  focusComments?: boolean;
  requestedCommentId?: string | null;
  highlightRecentComment?: boolean;
  allowAutoOpen?: boolean;
}

function initials(name: string): string {
  return name
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function MobileFishingPost({
  post,
  currentUserId,
  onPostUpdated,
  focusComments = false,
  requestedCommentId = null,
  highlightRecentComment = false,
  allowAutoOpen = false,
}: MobileFishingPostProps) {
  const [editOpen, setEditOpen] = useState(false);
  const isOwner = Boolean(currentUserId) && currentUserId === post.author_id;
  const authorName = post.author_display_name || post.author_username;
  const avatarUrl = getAvatarUrl(post.author_avatar_media_id);
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
            {avatarUrl && <AvatarImage src={avatarUrl} alt={authorName} />}
            <AvatarFallback className="bg-emerald-100 text-emerald-700">
              {initials(authorName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-bold text-slate-900">
                {post.author_display_name}
              </p>

              <span className="shrink-0 text-[10px] text-slate-400">
                • {formatRelativeTime(post.created_at)}
              </span>
            </div>

            {post.community_id && (
              <div className="mt-1">
                <CommunityTag communityId={post.community_id} />
              </div>
            )}
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
          <PostActions
            post={post}
            currentUserId={currentUserId}
            onPostUpdated={onPostUpdated}
            openComments={focusComments}
            requestedCommentId={requestedCommentId}
            highlightRecentComment={highlightRecentComment}
            allowAutoOpen={allowAutoOpen}
            compact
          />

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
