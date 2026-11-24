"use client";

import Image from "next/image";
import {
  Flame,
  Heart,
  ImageIcon,
  MessageCircle,
} from "lucide-react";

import {
  formatRelativeTime,
  resolveMediaUrl,
  type ApiPost,
} from "@/lib/api/posts";

interface TrendingPostsProps {
  posts: ApiPost[];
  onOpenPost: (post: ApiPost) => void;
  loading?: boolean;
  variant?: "sidebar" | "mobile";
}

function thumbnail(post: ApiPost): string | null {
  const media = post.media?.[0];
  if (!media) return null;
  return resolveMediaUrl(media.thumbnail_url || media.display_url);
}

function snippet(post: ApiPost): string {
  const text = post.content.trim().replace(/\s+/g, " ");
  return text || "Photo post";
}

function Skeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-slate-100" />
            <div className="h-2.5 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TrendingPosts({
  posts,
  onOpenPost,
  loading = false,
  variant = "sidebar",
}: TrendingPostsProps) {
  if (variant === "mobile") {
    return (
      <section className="rounded-2xl bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Flame size={15} className="text-orange-500" />
            <h2 className="text-sm font-bold text-slate-900">
              Trending posts
            </h2>
          </div>
          <span className="text-[10px] font-medium text-slate-400">
            Most engaged
          </span>
        </div>

        {loading && posts.length === 0 ? (
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-28 w-40 shrink-0 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="px-1 py-2 text-xs text-slate-400">
            No trending posts yet.
          </p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {posts.map((post) => {
              const src = thumbnail(post);

              return (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => onOpenPost(post)}
                  className="w-44 shrink-0 overflow-hidden rounded-xl bg-slate-50 text-left"
                >
                  <span className="relative block aspect-[16/10] bg-slate-100">
                    {src ? (
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="176px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-slate-300">
                        <ImageIcon size={22} />
                      </span>
                    )}
                  </span>

                  <span className="block p-2">
                    <span className="line-clamp-2 text-[11px] font-medium leading-4 text-slate-700">
                      {snippet(post)}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="truncate">@{post.author_username}</span>
                      <span className="inline-flex items-center gap-0.5">
                        <Heart size={9} />
                        {post.like_count ?? 0}
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        <MessageCircle size={9} />
                        {post.comment_count ?? 0}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-900">Trending posts</h2>
          <p className="mt-1 text-xs text-slate-400">
            Most engaged catches right now
          </p>
        </div>
        <Flame size={19} className="text-orange-500" />
      </div>

      {loading && posts.length === 0 ? (
        <Skeleton />
      ) : posts.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-400">
          No trending posts yet.
        </p>
      ) : (
        <div className="space-y-1">
          {posts.map((post, index) => {
            const src = thumbnail(post);

            return (
              <button
                key={post.id}
                type="button"
                onClick={() => onOpenPost(post)}
                className="group flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors hover:bg-slate-50"
              >
                <span className="w-4 shrink-0 text-center text-xs font-bold text-slate-300">
                  {index + 1}
                </span>

                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-300">
                  {src ? (
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <ImageIcon size={16} />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-xs font-medium leading-4 text-slate-700">
                    {snippet(post)}
                  </span>

                  <span className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="truncate">@{post.author_username}</span>
                    <span>·</span>
                    <span className="shrink-0">
                      {formatRelativeTime(post.created_at)}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-0.5">
                      <Heart size={9} />
                      {post.like_count ?? 0}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
