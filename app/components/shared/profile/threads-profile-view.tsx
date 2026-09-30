"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MoreHorizontal,
  Sun,
  Moon,
  Monitor,
  Camera,
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  Share2,
  Check,
  Link2,
  Settings,
  LogOut,
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

  // Quick Composer State
  const [composerText, setComposerText] = useState("");
  const [userPosts, setUserPosts] = useState<
    {
      id: string;
      content: string;
      createdAt: string;
      likes: number;
      replies: number;
    }[]
  >([]);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const initials =
    profile.display_name?.trim().slice(0, 2).toUpperCase() || "AN";

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

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = composerText.trim();
    if (!trimmed) return;

    const newPost = {
      id: Date.now().toString(),
      content: trimmed,
      createdAt: "Baru saja",
      likes: 0,
      replies: 0,
    };

    setUserPosts([newPost, ...userPosts]);
    setComposerText("");
    showToast("Kiriman berhasil dibagikan!");
  };

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
      <header className="flex items-center justify-between py-4 px-2 border-b border-slate-200/80 dark:border-slate-800">
        <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
          @{profile.username || "username"}
        </span>

        <div className="flex items-center gap-2">
          {/* SEARCH BUTTON */}
          <button
            type="button"
            onClick={() => router.push("/explore")}
            title="Cari"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Search size={18} strokeWidth={2} />
          </button>

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

            {/* STACKED FOLLOWER AVATARS (Matching Wireframe) */}
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

              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
                {profile.followers_count ?? 33} Followers
              </span>
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
            { id: "post" as const, label: "Post" },
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
          5. COMPOSER BAR ("What's new ?") (Matching Wireframe)
          - Avatar on left
          - Input pill: What's new ?
          - Post button on right
      ======================================================== */}
      <section className="py-4 border-b border-slate-200/80 dark:border-slate-800">
        <form onSubmit={handleCreatePost} className="flex items-center gap-3">
          {/* USER MINI AVATAR */}
          <Avatar className="size-10 shrink-0 ring-1 ring-amber-400 bg-amber-100">
            <AvatarImage
              src={getAvatarUrl(profile.avatar_media_id) ?? undefined}
              alt={profile.display_name}
            />
            <AvatarFallback className="bg-amber-400 text-slate-900 text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* WHAT'S NEW INPUT PILL */}
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="What's new ?"
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              className="h-11 rounded-full border border-slate-200/90 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 px-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-slate-400"
            />
          </div>

          {/* POST BUTTON */}
          <Button
            type="submit"
            disabled={!composerText.trim()}
            className="h-11 px-5 rounded-xl bg-slate-500 hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium text-xs sm:text-sm transition-all disabled:opacity-40"
          >
            Post
          </Button>
        </form>
      </section>

      {/* ========================================================
          6. FEED / EMPTY STATE (Matching Wireframe)
          - Centered text: Post Unavailable
      ======================================================== */}
      <section className="py-12">
        {userPosts.length > 0 && activeTab === "post" ? (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-8 ring-1 ring-amber-400">
                    <AvatarImage
                      src={getAvatarUrl(profile.avatar_media_id) ?? undefined}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {profile.display_name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {post.createdAt}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-800 dark:text-slate-200">
                  {post.content}
                </p>

                <div className="mt-4 flex items-center gap-6 text-slate-500 dark:text-slate-400 text-xs">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 hover:text-red-500"
                  >
                    <Heart size={16} /> <span>{post.likes}</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 hover:text-blue-500"
                  >
                    <MessageCircle size={16} /> <span>{post.replies}</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 hover:text-emerald-500"
                  >
                    <Repeat2 size={16} />
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-xl sm:text-2xl font-normal text-slate-400 dark:text-slate-500 select-none">
              Post Unavailable
            </p>
          </div>
        )}
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
    </div>
  );
}
