"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  MoreHorizontal,
  Camera,
  Check,
  Link2,
  Settings,
  LogOut,
  Fish,
  MessageCircle,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { UserProfile } from "@/lib/api/profile";
import { getAvatarUrl } from "@/lib/api/media";
import {
  extractApiErrorMessage,
  formatRelativeTime,
  getUserPosts,
  getUserReplies,
  resolveMediaUrl,
  type ApiPost,
  type UserReply,
} from "@/lib/api/posts";
import DesktopFishingPost from "@/app/components/desktop/desktop-fishing-post";
import MobileFishingPost from "@/app/components/mobile/mobile-fishing-post";
import CreatePost from "@/app/components/shared/post/create-post";
import FollowListDialog, {
  type FollowListTab,
} from "@/app/components/shared/profile/follow-list-dialog";
// import { useTheme } from "@/app/components/providers/theme-provider";
import { api } from "@/lib/api";

export interface ProfileUpdateData {
  display_name: string;
  bio: string;
  avatar_file?: File | null;
}

interface ThreadsProfileViewProps {
  profile: UserProfile;
  saving?: boolean;
  onUpdateProfile?: (data: ProfileUpdateData) => Promise<void>;
  isDesktop?: boolean;
}

function initialsFromName(name: string): string {
  return (
    name
      .split(/[\s_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "AN"
  );
}

function ReplyThreadCard({
  reply,
  onOpen,
}: {
  reply: UserReply;
  onOpen: () => void;
}) {
  const { post, comment } = reply;
  const postAuthor =
    post.author_display_name || post.author_username || "Angler";
  const commentAuthor =
    comment.author_display_name || comment.author_username || "Angler";
  const postAvatar = getAvatarUrl(post.author_avatar_media_id);
  const commentAvatar = getAvatarUrl(comment.author_avatar_media_id ?? null);
  const media = (post.media ?? [])
    .map((item) => resolveMediaUrl(item.thumbnail_url || item.display_url))
    .filter((src): src is string => Boolean(src))
    .slice(0, 2);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      {/* RELATED POST */}
      <div className="flex gap-3 p-4 pb-2">
        <Avatar className="h-9 w-9 shrink-0">
          {postAvatar && <AvatarImage src={postAvatar} alt={postAuthor} />}
          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-[10px] font-bold text-white">
            {initialsFromName(postAuthor)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {postAuthor}
            </p>
            <span className="shrink-0 text-[11px] text-slate-400">
              {formatRelativeTime(post.created_at)}
            </span>
          </div>
          {post.content && (
            <p className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-xs leading-5 text-slate-700 dark:text-slate-300">
              {post.content}
            </p>
          )}
        </div>
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-2 gap-2 px-4 pb-3 pl-16">
          {media.map((src, index) => (
            <div
              key={`${post.id}-${index}`}
              className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
            >
              <Image
                src={src}
                alt={`Catch by ${postAuthor}`}
                fill
                sizes="(max-width: 768px) 30vw, 160px"
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}

      {/* MY REPLY (threaded below the post) */}
      <div className="relative flex gap-3 px-4 pb-4">
        <span
          aria-hidden
          className="absolute left-[2.1rem] top-0 h-4 w-px -translate-y-full bg-slate-200 dark:bg-slate-700"
        />
        <Avatar className="h-8 w-8 shrink-0">
          {commentAvatar && <AvatarImage src={commentAvatar} alt={commentAuthor} />}
          <AvatarFallback className="bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {initialsFromName(commentAuthor)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
              {commentAuthor}
            </p>
            <span className="shrink-0 text-[10px] text-slate-400">
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>
          <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-700 dark:text-slate-300">
            {comment.content}
          </p>
        </div>
      </div>
    </button>
  );
}

export function ThreadsProfileView({
  profile,
  saving = false,
  onUpdateProfile,
  isDesktop = false,
}: ThreadsProfileViewProps) {
  const router = useRouter();
  // const { theme, setTheme, resolvedTheme } = useTheme();

  // Tab State
  const [activeTab, setActiveTab] = useState<"post" | "replies" | "media">(
    "post",
  );

  // Edit Profile Dialog State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(
    getAvatarUrl(profile.avatar_media_id),
  );
  const [formError, setFormError] = useState<string | null>(null);

  // Real posts by this user (GET /api/v1/feed filtered by author_id).
  // A post created on /feed appears here automatically on next load.
  const [userPosts, setUserPosts] = useState<ApiPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  // Comments/replies written by this user, paired with their parent post.
  const [userReplies, setUserReplies] = useState<UserReply[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesError, setRepliesError] = useState<string | null>(null);
  const repliesLoadedRef = useRef(false);

  // Profile search (filters posts, replies and media client-side).
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  useEffect(() => {
    if (!searchOpen) return;

    searchInputRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (searchContainerRef.current?.contains(event.target as Node)) return;
      setSearchOpen(false);
      setSearchQuery("");
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [searchOpen]);

  const loadUserPosts = React.useCallback(async () => {
    try {
      setPostsLoading(true);
      setPostsError(null);
      const mine = await getUserPosts(profile.user_id);
      setUserPosts(mine);
    } catch (err) {
      setPostsError(extractApiErrorMessage(err, "Failed to load posts"));
    } finally {
      setPostsLoading(false);
    }
  }, [profile.user_id]);

  const loadUserReplies = React.useCallback(async () => {
    if (repliesLoadedRef.current) return;
    repliesLoadedRef.current = true;
    try {
      setRepliesLoading(true);
      setRepliesError(null);
      const mine = await getUserReplies(profile.user_id);
      setUserReplies(mine);
    } catch (err) {
      repliesLoadedRef.current = false;
      setRepliesError(extractApiErrorMessage(err, "Failed to load replies"));
    } finally {
      setRepliesLoading(false);
    }
  }, [profile.user_id]);

  useEffect(() => {
    async function init() {
      await loadUserPosts();
    }

    init();
  }, [loadUserPosts]);

  useEffect(() => {
    if (activeTab !== "replies") return;
    if (repliesLoadedRef.current) return;
    void loadUserReplies();
  }, [activeTab, loadUserReplies]);

  // Edited post (PATCH + re-fetched detail) replaces the item in place.
  function handlePostUpdated(updated: ApiPost) {
    setUserPosts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p)),
    );
    showToast("Post updated!");
  }

  // Fresh post from the profile composer goes on top (same flow as /feed).
  function handlePostCreated(post: ApiPost) {
    setUserPosts((prev) =>
      prev.some((p) => p.id === post.id) ? prev : [post, ...prev],
    );
    setActiveTab("post");
    showToast("Post published!");
  }

  // Followers / following dialog (Threads-style list).
  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  const [followInitialTab, setFollowInitialTab] =
    useState<FollowListTab>("followers");

  function openFollowList(tab: FollowListTab) {
    setFollowInitialTab(tab);
    setFollowDialogOpen(true);
  }

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const initials =
    profile.display_name?.trim().slice(0, 2).toUpperCase() || "AN";

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;
  const matchesQuery = (...values: Array<string | null | undefined>) =>
    !isSearching ||
    values.some((value) =>
      (value ?? "").toLowerCase().includes(normalizedQuery),
    );

  const visiblePosts = userPosts.filter((post) =>
    matchesQuery(post.content, post.author_display_name, post.author_username),
  );
  const visibleReplies = userReplies.filter(({ post, comment }) =>
    matchesQuery(
      comment.content,
      post.content,
      post.author_display_name,
      post.author_username,
    ),
  );

  function openReplyThread(reply: UserReply) {
    const params = new URLSearchParams({
      post: reply.post.id,
      comment: reply.comment.id,
      highlight: "1",
    });
    router.push(`/feed?${params.toString()}`);
  }

  function openEditProfile() {
    setDisplayName(profile.display_name);
    setBio(profile.bio ?? "");
    setAvatarFile(null);
    setPreviewAvatar(getAvatarUrl(profile.avatar_media_id));
    setFormError(null);
    setEditOpen(true);
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Pilih file gambar yang valid.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setFormError("Ukuran gambar maksimal 15MB.");
      return;
    }

    setAvatarFile(file);
    setPreviewAvatar(URL.createObjectURL(file));
    setFormError(null);
  }

  async function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!displayName.trim()) {
      setFormError("Nama tampilan tidak boleh kosong.");
      return;
    }

    if (!onUpdateProfile) return;

    try {
      setFormError(null);
      await onUpdateProfile({
        display_name: displayName,
        bio,
        avatar_file: avatarFile,
      });
      setEditOpen(false);
      showToast("Profil berhasil diperbarui!");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Gagal memperbarui profil.",
      );
    }
  }

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      showToast("Tautan profil disalin!");
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error(err);
      api.setSessionToken(null);
    } finally {
      router.replace("/login");
    }
  };

  return (
    <div className="mx-auto rounded-3xl border-slate-100 bg-white shadow-sm p-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl dark:bg-white dark:text-slate-900 animate-in fade-in slide-in-from-bottom-2">
          <Check size={16} className="text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================
          1. TOP BAR (Matching Wireframe)
          - Left: @username
          - Right: Search button + More Options (...)
      ======================================================== */}
      <header className="flex items-center justify-between gap-3 py-4 px-2 border-b border-slate-200/80 dark:border-slate-800">
        <span className="min-w-0 truncate text-base font-bold tracking-tight text-slate-900 dark:text-white">
          @{profile.username || "username"}
        </span>

        <div className="flex shrink-0 items-center gap-2">
          {/* EXPANDING SEARCH */}
          <div ref={searchContainerRef} className="flex items-center">
            <div
              className={`relative overflow-hidden transition-all duration-300 ease-out ${
                searchOpen
                  ? "mr-2 w-40 opacity-100 sm:w-56"
                  : "mr-0 w-0 opacity-0"
              }`}
            >
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") closeSearch();
                }}
                tabIndex={searchOpen ? 0 : -1}
                placeholder="Search..."
                aria-label="Search your posts and replies"
                className="h-9 rounded-full border-slate-200 bg-slate-50 pl-8 pr-8 text-xs dark:border-slate-800 dark:bg-slate-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
              title={searchOpen ? "Close search" : "Search profile"}
              aria-label={searchOpen ? "Close search" : "Search profile"}
              aria-expanded={searchOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Search size={18} strokeWidth={2} />
            </button>
          </div>

          {/* MORE OPTIONS DROPDOWN (...) */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  title="Menu Opsi"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                />
              }
            >
              <MoreHorizontal size={18} strokeWidth={2} />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl p-2 shadow-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              {/* THEME SELECTOR GROUP
              <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pilih Tema
              </div>

              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-2">
                {[
                  { id: "light" as const, label: "Light", icon: Sun },
                  { id: "dark" as const, label: "Dark", icon: Moon },
                  { id: "system" as const, label: "Auto", icon: Monitor },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTheme(t.id);
                        showToast(`Tema: ${t.label}`);
                      }}
                      className={`flex flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-medium transition-all ${
                        isActive
                          ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      <Icon size={14} />
                      {t.label}
                    </button>
                  );
                })}
              </div> */}

              <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-slate-800" />

              <DropdownMenuItem
                onClick={handleCopyLink}
                className="cursor-pointer gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Link2 size={15} />
                <span>Salin Tautan Profil</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="cursor-pointer gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Settings size={15} />
                <span>Pengaturan Akun</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-slate-800" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut size={15} />
                <span>Keluar (Logout)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ========================================================
          2. PROFILE HEADER (Matching Wireframe)
          - Left: Your Name, @username, Overlapping avatars + Followers
          - Right: Big Circular Avatar
      ======================================================== */}
      <section className="pt-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          {/* LEFT COLUMN */}
          <div className="flex-1 min-w-0 pr-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
              {profile.display_name || "Your Name"}
            </h1>

            <p className="mt-0.5 text-sm font-normal text-slate-700 dark:text-slate-300">
              @{profile.username || "username"}
            </p>

            {profile.bio && (
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {profile.bio}
              </p>
            )}

            {/* STACKED FOLLOWER AVATARS + FOLLOW COUNTS (tap to view lists) */}
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

          {/* RIGHT COLUMN: BIG CIRCULAR AVATAR (Wireframe Yellow Circle Avatar) */}
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

        {/* ========================================================
            3. EDIT PROFILE BUTTON (Matching Wireframe)
            - Full-width light grey rounded pill button
        ======================================================== */}
        <div className="mt-6">
          <Button
            type="button"
            onClick={openEditProfile}
            variant="outline"
            className="w-full h-11 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-200/70 dark:bg-slate-800/80 hover:bg-slate-300/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white font-semibold text-sm transition-all"
          >
            Edit Profile
          </Button>
        </div>
      </section>

      {/* ========================================================
          4. SEGMENTED TABS (Matching Wireframe)
          - Post (Active filled pill) | Replies | Media
      ======================================================== */}
      <section className="mt-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100/60 dark:bg-slate-900/60 rounded-2xl">
          {[
            { id: "post" as const, label: "Posts" },
            { id: "replies" as const, label: "Replies" },
            { id: "media" as const, label: "Media" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 text-center text-sm font-semibold rounded-xl transition-all ${isActive
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

      {/* ========================================================
          5. COMPOSER — only on the Posts tab (not Replies/Media)
      ======================================================== */}
      {activeTab === "post" && (
        <section className="py-4 border-b border-slate-200/80 dark:border-slate-800">
          <CreatePost onPostCreated={handlePostCreated} />
        </section>
      )}

      {/* ========================================================
          6. POSTS / REPLIES / MEDIA TABS (real API data)
      ======================================================== */}
      <section className="py-6">
        {activeTab === "replies" ? (
          repliesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-3 h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="mt-4 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-3 h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              ))}
            </div>
          ) : repliesError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              <p>{repliesError}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={loadUserReplies}
                className="mt-2 rounded-full"
              >
                Try again
              </Button>
            </div>
          ) : visibleReplies.length > 0 ? (
            <div className="space-y-4">
              {visibleReplies.map((reply) => (
                <ReplyThreadCard
                  key={`${reply.post.id}-${reply.comment.id}`}
                  reply={reply}
                  onOpen={() => openReplyThread(reply)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MessageCircle
                size={32}
                className="mb-3 text-slate-300 dark:text-slate-600"
              />
              <p className="text-xl sm:text-2xl font-normal text-slate-400 dark:text-slate-500 select-none">
                {isSearching ? "No matching replies" : "No replies yet"}
              </p>
              {!isSearching && (
                <p className="mt-2 text-xs text-slate-400">
                  Comments you write on posts will appear here.
                </p>
              )}
            </div>
          )
        ) : postsLoading ? (
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
          visiblePosts.length > 0 ? (
            <div className="space-y-4">
              {visiblePosts.map((post) =>
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
                {isSearching ? "No matching posts" : "No posts yet"}
              </p>
              {!isSearching && (
                <p className="mt-2 text-xs text-slate-400">
                  Posts you share from the Home feed will appear here.
                </p>
              )}
            </div>
          )
        ) : activeTab === "media" ? (
          (() => {
            const withMedia = visiblePosts.filter(
              (p) => (p.media?.length ?? 0) > 0,
            );
            if (withMedia.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-xl sm:text-2xl font-normal text-slate-400 dark:text-slate-500 select-none">
                    {isSearching ? "No matching media" : "No media yet"}
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
          })()
        ) : null}
      </section>

      {/* ========================================================
          7. EDIT PROFILE DIALOG
      ======================================================== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Perbarui informasi profil dan foto Anda.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            {formError && (
              <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-300">
                {formError}
              </div>
            )}

            {/* AVATAR CHANGE */}
            <div className="flex items-center gap-4">
              <Avatar className="size-16 ring-2 ring-slate-200 dark:ring-slate-700">
                <AvatarImage
                  src={previewAvatar ?? undefined}
                  alt={displayName}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-slate-200 dark:border-slate-700 text-xs"
                >
                  <Camera size={14} className="mr-1.5" />
                  Ganti Foto
                </Button>
                <p className="mt-1 text-[11px] text-slate-400">
                  JPG, PNG atau WebP. Maks 15MB.
                </p>
              </div>
            </div>

            {/* DISPLAY NAME */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nama Tampilan
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nama Anda"
                disabled={saving}
                className="rounded-xl border-slate-200 dark:border-slate-700 text-xs"
                required
              />
            </div>

            {/* BIO */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Bio
              </label>
              <Textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tulis bio singkat tentang pengalaman memancing Anda..."
                disabled={saving}
                className="rounded-xl border-slate-200 dark:border-slate-700 text-xs resize-none"
              />
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="flex-1 rounded-full border-slate-200 dark:border-slate-700 text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-xs font-semibold"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* ========================================================
          8. FOLLOWERS / FOLLOWING DIALOG (Threads-style list)
      ======================================================== */}
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
