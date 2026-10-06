"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, RefreshCw, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAvatarUrl } from "@/lib/api/media";
import {
  extractSocialErrorMessage,
  listFollowers,
  listFollowing,
  type ApiFollowUser,
} from "@/lib/api/social";

export type FollowListTab = "followers" | "following";

interface FollowListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  initialTab?: FollowListTab;
  followersCount?: number;
  followingCount?: number;
}

function initials(name: string) {
  return name
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function FollowUserRow({
  user,
  onSelect,
}: {
  user: ApiFollowUser;
  onSelect: (username: string) => void;
}) {
  const name = user.display_name || user.username;
  return (
    <button
      type="button"
      onClick={() => onSelect(user.username)}
      title={`Lihat profil @${user.username}`}
      className="flex w-full items-center gap-3 rounded-xl px-1 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
    >
      <Avatar className="size-11 shrink-0">
        <AvatarImage
          src={getAvatarUrl(user.avatar_media_id) ?? undefined}
          alt={name}
          className="object-cover"
        />
        <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-white">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
          {user.display_name || user.username}
        </p>
        <p className="truncate text-xs text-slate-400">@{user.username}</p>
      </div>
      <ChevronRight
        size={16}
        className="shrink-0 text-slate-300 dark:text-slate-600"
      />
    </button>
  );
}

/**
 * Threads-style followers/following list: tab switcher on top,
 * scrollable rows, skeletons + error retry + empty states.
 */
export default function FollowListDialog({
  open,
  onOpenChange,
  username,
  initialTab = "followers",
  followersCount,
  followingCount,
}: FollowListDialogProps) {
  const [tab, setTab] = useState<FollowListTab>(initialTab);
  const [followers, setFollowers] = useState<ApiFollowUser[] | null>(null);
  const [following, setFollowing] = useState<ApiFollowUser[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSelectUser(username: string) {
    onOpenChange(false);
    router.push(`/users/${encodeURIComponent(username)}`);
  }

  // Fetch the active tab (cached per open session).
  useEffect(() => {
    if (!open) return;
    if (tab === "followers" && followers !== null) return;
    if (tab === "following" && following !== null) return;

    let cancelled = false;
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const users =
          tab === "followers"
            ? await listFollowers(username)
            : await listFollowing(username);
        if (cancelled) return;
        if (tab === "followers") setFollowers(users);
        else setFollowing(users);
      } catch (err) {
        if (cancelled) return;
        setError(
          extractSocialErrorMessage(err, `Failed to load ${tab}`),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [open, tab, username, followers, following]);

  function handleRetry() {
    if (tab === "followers") setFollowers(null);
    else setFollowing(null);
    setError(null);
  }

  const visible = tab === "followers" ? followers : following;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col rounded-3xl bg-white p-0 dark:bg-slate-900 sm:max-w-md">
        <DialogHeader className="px-5 pb-0 pt-5">
          <DialogTitle className="text-center text-base font-bold text-slate-900 dark:text-white">
            @{username}
          </DialogTitle>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100/60 p-1 dark:bg-slate-800/60">
            {(
              [
                {
                  id: "followers" as const,
                  label: `Followers${followersCount !== undefined ? ` · ${followersCount}` : ""}`,
                },
                {
                  id: "following" as const,
                  label: `Following${followingCount !== undefined ? ` · ${followingCount}` : ""}`,
                },
              ]
            ).map((t) => {
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTab(t.id);
                    setError(null);
                  }}
                  className={`truncate rounded-xl py-2 text-center text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </DialogHeader>

        <div className="min-h-[240px] flex-1 overflow-y-auto px-5 pb-5 pt-2">
          {loading ? (
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-3 py-2.5">
                  <div className="size-11 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-2.5 w-1/4 rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-red-600 dark:text-red-300">
                {error}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRetry}
                className="mt-3 gap-2 rounded-full"
              >
                <RefreshCw size={14} />
                Try again
              </Button>
            </div>
          ) : visible && visible.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {visible.map((u) => (
                <FollowUserRow
                  key={u.user_id}
                  user={u}
                  onSelect={handleSelectUser}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users size={28} className="mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {tab === "followers" ? "No followers yet" : "Not following anyone yet"}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
