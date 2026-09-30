// components/mobile/mobile-profile.tsx

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

interface MobileProfileProps {
  profile: UserProfile;
  saving?: boolean;
  onUpdateProfile?: (data: ProfileUpdateData) => Promise<void>;
}

export default function MobileProfile({
  profile,
  saving = false,
  onUpdateProfile,
}: MobileProfileProps) {
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
      setFormError("Please select a valid image.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setFormError("Image size must be less than 15MB.");
      return;
    }

    setAvatarFile(file);

    setPreviewAvatar(URL.createObjectURL(file));

    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!displayName.trim()) {
      setFormError("Display name cannot be empty.");
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
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to update profile.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* COVER */}
      <section className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
        <div className="absolute -right-16 -top-16 size-52 rounded-full border border-white/20" />

        <div className="absolute bottom-5 left-5 text-white">
          <p className="text-xs font-medium text-white/60">Fishing Community</p>

          <h1 className="text-xl font-bold">My Profile</h1>
        </div>
      </section>

      {/* PROFILE */}
      <section className="-mt-12 px-4">
        {/* AVATAR */}
        <Avatar className="size-24 border-4 border-white shadow-xl">
          <AvatarImage
            src={getAvatarUrl(profile.avatar_media_id) ?? undefined}
            alt={profile.display_name}
          />

          <AvatarFallback className="bg-slate-900 text-xl font-bold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* NAME */}
        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold text-slate-900">
              {profile.display_name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">@{profile.username}</p>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={openEditProfile}
            className="shrink-0 rounded-xl"
          >
            <Pencil className="mr-1.5 size-4" />
            Edit
          </Button>
        </div>

        {/* BIO */}
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {profile.bio ||
            "No bio yet. Tell the fishing community about yourself."}
        </p>

        {/* LOCATION */}
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="size-4" />

          <span>Fishing enthusiast</span>
        </div>

        {/* STATS */}
        <div className="mt-6 grid grid-cols-2 divide-x rounded-2xl border border-slate-200 bg-white py-4">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">
              {profile.followers_count}
            </p>

            <p className="text-xs text-slate-500">Followers</p>
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">
              {profile.following_count}
            </p>

            <p className="text-xs text-slate-500">Following</p>
          </div>
        </div>

        {/* COMMUNITY */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100">
              <Users className="size-5 text-slate-700" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                Fishing Community
              </h3>

              <p className="text-xs text-slate-500">
                Connect with other anglers
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Share catches, discover fishing spots and connect with anglers
            around you.
          </p>
        </div>
      </section>

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="w-[calc(100%-2rem)] rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>

            <DialogDescription>Update your fishing profile.</DialogDescription>
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
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="mr-2 size-4" />
                  Change Photo
                </Button>

                <p className="mt-1.5 text-[11px] text-slate-500">
                  JPG, PNG, WebP · Max 15MB
                </p>
              </div>
            </div>

            {/* DISPLAY NAME */}
            <div className="space-y-2">
              <label
                htmlFor="mobile-display-name"
                className="text-sm font-medium"
              >
                Display Name
              </label>

              <Input
                id="mobile-display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                disabled={saving}
              />
            </div>

            {/* USERNAME */}
            <div className="space-y-2">
              <label htmlFor="mobile-username" className="text-sm font-medium">
                Username
              </label>

              <Input
                id="mobile-username"
                value={`@${profile.username}`}
                disabled
                className="bg-slate-50"
              />
            </div>

            {/* BIO */}
            <div className="space-y-2">
              <label htmlFor="mobile-bio" className="text-sm font-medium">
                Bio
              </label>

              <Textarea
                id="mobile-bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={4}
                disabled={saving}
                placeholder="Tell the community about yourself..."
              />
            </div>

            {formError && (
              <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">
                {formError}
              </p>
            )}

            <DialogFooter className="flex-row justify-end gap-2">
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
