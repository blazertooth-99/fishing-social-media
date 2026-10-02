"use client";

import Image from "next/image";
import { Heart, MessageCircle, Crown, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, resolveMediaUrl } from "@/lib/api/posts";
import type {
  ApiCommunityMember,
  ApiCommunityPost,
} from "@/lib/api/communities";

export function RoleBadge({ role }: { role: string }) {
  const normalized = role.toUpperCase();
  if (normalized === "OWNER") {
    return (
      <Badge className="gap-1 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100">
        <Crown size={11} />
        Owner
      </Badge>
    );
  }
  if (normalized === "ADMIN" || normalized === "MODERATOR") {
    return (
      <Badge className="gap-1 rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
        <ShieldCheck size={11} />
        {normalized === "ADMIN" ? "Admin" : "Moderator"}
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="rounded-full bg-slate-100 text-slate-500 hover:bg-slate-100"
    >
      Member
    </Badge>
  );
}

function initials(name: string) {
  return name
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function MemberRow({ member }: { member: ApiCommunityMember }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">
        {initials(member.display_name || member.username)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          {member.display_name}
        </p>
        <p className="truncate text-xs text-slate-400">@{member.username}</p>
      </div>
      <RoleBadge role={member.role} />
    </div>
  );
}

export function CommunityPostCard({ post }: { post: ApiCommunityPost }) {
  const photos = (post.media ?? []).slice(0, 4);

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">
          {initials(post.author_display_name || post.author_username)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-800">
              {post.author_display_name}
            </p>
            <span className="shrink-0 text-[11px] text-slate-400">
              {formatRelativeTime(post.created_at)}
            </span>
          </div>
          <p className="truncate text-[11px] text-slate-400">
            @{post.author_username}
          </p>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {post.content}
      </p>

      {photos.length > 0 && (
        <div
          className={`mt-3 grid gap-2 ${
            photos.length > 1 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {photos.map((m) => {
            const src = resolveMediaUrl(m.thumbnail_url || m.display_url);
            if (!src) return null;
            return (
              <div
                key={m.id}
                className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100"
              >
                <Image
                  src={src}
                  alt="Community post photo"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Heart size={14} />
          {(post.like_count ?? 0).toLocaleString()}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle size={14} />
          {(post.comment_count ?? 0).toLocaleString()}
        </span>
      </div>
    </article>
  );
}
