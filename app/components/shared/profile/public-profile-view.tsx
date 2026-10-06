"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Check, Fish, Link2, UserMinus, UserPlus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import type { UserProfile } from "@/lib/api/profile";
import { getAvatarUrl } from "@/lib/api/media";
import {
  extractApiErrorMessage,
  getUserPosts,
  resolveMediaUrl,
  type ApiPost,
} from "@/lib/api/posts";
import {
  extractSocialErrorMessage,
  followUser,
  unfollowUser,
} from "@/lib/api/social";
import DesktopFishingPost from "@/app/components/desktop/desktop-fishing-post";
import MobileFishingPost from "@/app/components/mobile/mobile-fishing-post";
import FollowListDialog, {
  type FollowListTab,
} from "@/app/components/shared/profile/follow-list-dialog";

interface PublicProfileViewProps {
  profile: UserProfile;
  isDesktop?: boolean;
  onRelationshipChange?: (profile: UserProfile) => void;
}

export function PublicProfileView({
  profile,
  isDesktop = false,
  onRelationshipChange,
}: PublicProfileViewProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"post" | "media">("post");
  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [userPosts, setUserPosts] = useState<ApiPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  const [followInitialTab, setFollowInitialTab] =
    useState<FollowListTab>("followers");

  const isFollowing = profile.relationship === "FOLLOWING";
  const isSelf = profile.relationship === "SELF";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const loadUserPosts = React.useCallback(async () => {
    try {
      setPostsLoading(true);
      setPostsError(null);
      const posts = await getUserPosts(profile.user_id);
      setUserPosts(posts);
    } catch (err) {
      setPostsError(extractApiErrorMessage(err, "Failed to load posts"));
    } finally {
      setPostsLoading(false);
    }
  }, [profile.user_id]);

  useEffect(() => {
    loadUserPosts();
  }, [loadUserPosts]);

  function handlePostUpdated(updated: ApiPost) {
    setUserPosts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p)),
    );
  }

  function openFollowList(tab: FollowListTab) {
    setFollowInitialTab(tab);
    setFollowDialogOpen(true);
  }

  async function handleToggleFollow() {
    if (followLoading || isSelf) return;
    setFollowLoading(true);
    setFollowError(null);

    // Optimistic update, revert on failure.
    const prev = profile;
    const optimistic: UserProfile = {
      ...profile,
      relationship: isFollowing ? "NOT_FOLLOWING" : "FOLLOWING",
      followers_count: Math.max(
        0,
        profile.followers_count + (isFollowing ? -1 : 1),
      ),
    };
    onRelationshipChange?.(optimistic);

    try {
      if (isFollowing) {
        await unfollowUser(profile.username);
        showToast(`Berhenti mengikuti @${profile.username}`);
      } else {
        await followUser(profile.username);
        showToast(`Mengikuti @${profile.username}`);
      }
    } catch (err) {
      onRelationshipChange?.(prev);
      setFollowError(
        extractSocialErrorMessage(err, "Gagal memperbarui follow."),
      );
    } finally {
      setFollowLoading(false);
    }
  }

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      showToast("Tautan profil disalin!");
    }
  };

  const initials =
    profile.display_name?.trim().slice(0, 2).toUpperCase() || "AN";

  return (
    <div className="mx-auto rounded-3xl border-slate-100 bg-white shadow-sm p-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl dark:bg-white dark:text-slate-900 animate-in fade-in slide-in-from-bottom-2">
          <Check size={16} className="text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR: back + username + copy link */}
      <header className="flex items-center justify-between py-4 px-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            title="Kembali"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          <span className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white">
            @{profile.username || "username"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyLink}
          title="Salin tautan profil"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Link2 size={18} strokeWidth={2} />
        </button>
      </header>

      {/* PROFILE HEADER */}
      <section className="pt-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 pr-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
              {profile.display_name || "Angler"}
            </h1>

            <p className="mt-0.5 text-sm font-normal text-slate-700 dark:text-slate-300">
              @{profile.username || "username"}
            </p>

            {profile.bio && (
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {profile.bio}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2">
              <div className="flex -space-x-2 overflow-hidden">
                <span className="inline-block size-5 sm:size-6 rounded-full ring-2 ring-white dark:ring-slate-950 bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                  🎣
                </span>
                <span className="inline-block size-5 sm:size-6 rounded-full ring-2 ring-white dark:ring-slate-950 bg-amber-500 text-[10px] text-white flex items-center justify-center font-bold">
                  🐟
                </span>
                <span className="inline-block size-5 sm:size-6 rounded-full ring-2 ring-white dark:ring-slate-950 bg-emerald-500 text-[10px] text-white flex items-center justify-center font-bold">
                  🌊
                </span>
              </div>

              <button
                type="button"
                onClick={() => openFollowList("followers")}
                className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal transition-colors hover:text-slate-900 dark:hover:text-white"
              >
                {profile.followers_count ?? 0} Followers
              </button>

              <span className="text-xs text-slate-300 dark:text-slate-600">
                ·
              </span>

              <button
                type="button"
                onClick={() => openFollowList("following")}
                className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal transition-colors hover:text-slate-900 dark:hover:text-white"
              >
                {profile.following_count ?? 0} Following
              </button>
            </div>
          </div>

          <div className="shrink-0">
            <div className="relative p-1 rounded-full ring-2 ring-amber-400/80 dark:ring-amber-500/80 bg-amber-50 dark:bg-amber-950/20">
              <Avatar className="size-20 sm:size-24 rounded-full shadow-md bg-amber-100 dark:bg-amber-900/40">
                <AvatarImage
                  src={getAvatarUrl(profile.avatar_media_id) ?? undefined}
                  alt={profile.display_name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-amber-400 text-slate-900 text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* FOLLOW / SELF ACTION */}
        <div className="mt-6">
          {isSelf ? (
            <Button
              type="button"
              onClick={() => router.push("/profile")}
              variant="outline"
              className="w-full h-11 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-200/70 dark:bg-slate-800/80 hover:bg-slate-300/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white font-semibold text-sm transition-all"
            >
              Ini profil Anda — Buka Profil Saya
            </Button>
          ) : (
            <>
              <Button
                type="button"
                onClick={handleToggleFollow}
                disabled={followLoading}
                className={`w-full h-11 rounded-xl font-semibold text-sm transition-all ${
                  isFollowing
                    ? "border border-slate-200/90 dark:border-slate-800 bg-slate-200/70 dark:bg-slate-800/80 hover:bg-slate-300/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white"
                    : "bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800"
                }`}
              >
                {followLoading ? (
                  "Memproses..."
                ) : isFollowing ? (
                  <span className="inline-flex items-center gap-2">
                    <UserMinus size={16} />
                    Berhenti Mengikuti
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <UserPlus size={16} />
                    Ikuti
                  </span>
                )}
              </Button>
              {followError && (
                <p className="mt-2 text-center text-xs text-red-600 dark:text-red-300">
                  {followError}
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* TABS */}
      <section className="mt-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/60 dark:bg-slate-900/60 rounded-2xl">
          {[
            { id: "post" as const, label: "Posts" },
            { id: "media" as const, label: "Media" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 text-center text-sm font-semibold rounded-xl transition-all ${
                  isActive
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* POSTS / MEDIA */}
      <section className="py-6">
        {postsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-3 aspect-[4/3] rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : postsError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            <p>{postsError}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={loadUserPosts}
              className="mt-2 rounded-full"
            >
              Try again
            </Button>
          </div>
        ) : activeTab === "post" ? (
          userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts.map((post) =>
                isDesktop ? (
                  <DesktopFishingPost
                    key={post.id}
                    post={post}
                    currentUserId={profile.user_id}
                    onPostUpdated={handlePostUpdated}
                  />
                ) : (
                  <MobileFishingPost
                    key={post.id}
                    post={post}
                    currentUserId={profile.user_id}
                    onPostUpdated={handlePostUpdated}
                  />
                ),
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Fish
                size={32}
                className="mb-3 text-slate-300 dark:text-slate-600"
              />
              <p className="text-xl sm:text-2xl font-normal text-slate-400 dark:text-slate-500 select-none">
                No posts yet
              </p>
              <p className="mt-2 max-w-xs text-xs text-slate-400">
                {!isFollowing && !isSelf
                  ? `Ikuti @${profile.username} untuk melihat postingan mereka di feed Anda.`
                  : "Postingan akan muncul di sini."}
              </p>
              {!isFollowing && !isSelf && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleToggleFollow}
                  disabled={followLoading}
                  className="mt-4 gap-2 rounded-full"
                >
                  <UserPlus size={14} />
                  Ikuti @{profile.username}
                </Button>
              )}
            </div>
          )
        ) : (() => {
            const withMedia = userPosts.filter(
              (p) => (p.media?.length ?? 0) > 0,
            );
            if (withMedia.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-xl sm:text-2xl font-normal text-slate-400 dark:text-slate-500 select-none">
                    No media yet
                  </p>
                </div>
              );
            }
            return (
              <div className="grid grid-cols-3 gap-2">
                {withMedia.flatMap((p) =>
                  p.media.map((m) => {
                    const src = resolveMediaUrl(
                      m.thumbnail_url || m.display_url,
                    );
                    if (!src) return null;
                    return (
                      <div
                        key={`${p.id}-${m.id}`}
                        className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
                      >
                        <Image
                          src={src}
                          alt={`Catch by ${p.author_display_name}`}
                          fill
                          sizes="(max-width: 768px) 33vw, 220px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    );
                  }),
                )}
              </div>
            );
          })()}
      </section>

      <FollowListDialog
        key={followInitialTab}
        open={followDialogOpen}
        onOpenChange={setFollowDialogOpen}
        username={profile.username}
        initialTab={followInitialTab}
        followersCount={profile.followers_count ?? 0}
        followingCount={profile.following_count ?? 0}
      />
    </div>
  );
}
