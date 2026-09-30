// components/desktop/desktop-profile.tsx

"use client";

import { useRef, useState } from "react";

import { Camera, MapPin, Pencil, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import type { UserProfile } from "@/lib/api/profile";

import { getAvatarUrl } from "@/lib/api/media";

interface ProfileUpdateData {
  display_name: string;
  bio: string;
  avatar_file?: File | null;
}

interface DesktopProfileProps {
  profile: UserProfile;
  saving?: boolean;
  onUpdateProfile?: (data: ProfileUpdateData) => Promise<void>;
}

export default function DesktopProfile({
  profile,
  saving = false,
  onUpdateProfile,
}: DesktopProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editOpen, setEditOpen] = useState(false);

  const [displayName, setDisplayName] = useState(profile.display_name);

  const [bio, setBio] = useState(profile.bio ?? "");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(
    getAvatarUrl(profile.avatar_media_id),
  );

  const [formError, setFormError] = useState<string | null>(null);

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
      setFormError("Please select a valid image file.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setFormError("Image size must be less than 15MB.");
      return;
    }

    setAvatarFile(file);

    const previewUrl = URL.createObjectURL(file);

    setPreviewAvatar(previewUrl);
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!displayName.trim()) {
      setFormError("Display name cannot be empty.");
      return;
    }

    if (!onUpdateProfile) {
      return;
    }

    try {
      setFormError(null);

      await onUpdateProfile({
        display_name: displayName,
        bio,
        avatar_file: avatarFile,
      });

      setEditOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to update profile.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-8 py-8">
        {/* PROFILE CARD */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* COVER */}
          <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -right-20 -top-20 size-72 rounded-full border border-white/30" />
              <div className="absolute right-20 top-10 size-40 rounded-full border border-white/20" />
            </div>

            <div className="absolute bottom-5 left-6 text-white">
              <p className="text-sm font-medium text-white/70">
                Fishing Community
              </p>

              <h2 className="text-2xl font-bold">Angler Profile</h2>
            </div>
          </div>

          {/* PROFILE BODY */}
          <div className="relative px-8 pb-8">
            {/* AVATAR */}
            <div className="-mt-16 mb-5">
              <Avatar className="size-32 border-4 border-white shadow-xl">
                <AvatarImage
                  src={getAvatarUrl(profile.avatar_media_id) ?? undefined}
                  alt={profile.display_name}
                />

                <AvatarFallback className="bg-slate-900 text-2xl font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* HEADER */}
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <h1 className="truncate text-3xl font-bold text-slate-900">
                  {profile.display_name}
                </h1>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  @{profile.username}
                </p>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                  {profile.bio ||
                    "No bio yet. Tell the fishing community about yourself."}
                </p>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="size-4" />

                  <span>Fishing enthusiast</span>
                </div>
              </div>

              {/* EDIT */}
              <Button
                type="button"
                variant="outline"
                onClick={openEditProfile}
                className="shrink-0 rounded-xl"
              >
                <Pencil className="mr-2 size-4" />
                Edit Profile
              </Button>
            </div>

            {/* STATS */}
            <div className="mt-8 flex gap-10 border-t border-slate-100 pt-6">
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {profile.followers_count}
                </p>

                <p className="text-sm text-slate-500">Followers</p>
              </div>

              <div>
                <p className="text-xl font-bold text-slate-900">
                  {profile.following_count}
                </p>

                <p className="text-sm text-slate-500">Following</p>
              </div>

              <div>
                <p className="text-xl font-bold text-slate-900">
                  {profile.relationship === "SELF"
                    ? "You"
                    : profile.relationship}
                </p>

                <p className="text-sm text-slate-500">Relationship</p>
              </div>
            </div>
          </div>
        </section>

        {/* PROFILE CONTENT */}
        <section className="mt-6 grid grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100">
                <Users className="size-5 text-slate-700" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">Community</h3>

                <p className="text-sm text-slate-500">Your fishing network</p>
              </div>
            </div>

            <p className="text-sm leading-6 text-slate-600">
              Connect with anglers, share catches, discover fishing spots and
              join the community.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100">
                <MapPin className="size-5 text-slate-700" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">Fishing Spots</h3>

                <p className="text-sm text-slate-500">
                  Explore your favorite places
                </p>
              </div>
            </div>

            <p className="text-sm leading-6 text-slate-600">
              Discover fishing locations and share your experience with other
              anglers.
            </p>
          </div>
        </section>
      </div>

      {/* EDIT PROFILE DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>

            <DialogDescription>
              Update your profile information.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* AVATAR */}
            <div className="flex items-center gap-4">
              <Avatar className="size-20">
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
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="mr-2 size-4" />
                  Change Photo
                </Button>

                <p className="mt-2 text-xs text-slate-500">
                  JPG, PNG or WebP. Max 15MB.
                </p>
              </div>
            </div>

            {/* DISPLAY NAME */}
            <div className="space-y-2">
              <label
                htmlFor="desktop-display-name"
                className="text-sm font-medium"
              >
                Display Name
              </label>

              <Input
                id="desktop-display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your display name"
                disabled={saving}
              />
            </div>

            {/* USERNAME */}
            <div className="space-y-2">
              <label htmlFor="desktop-username" className="text-sm font-medium">
                Username
              </label>

              <Input
                id="desktop-username"
                value={`@${profile.username}`}
                disabled
                className="bg-slate-50"
              />

              <p className="text-xs text-slate-500">
                Username is managed by the account system.
              </p>
            </div>

            {/* BIO */}
            <div className="space-y-2">
              <label htmlFor="desktop-bio" className="text-sm font-medium">
                Bio
              </label>

              <Textarea
                id="desktop-bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Tell the fishing community about yourself..."
                rows={4}
                disabled={saving}
              />
            </div>

            {formError && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {formError}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
