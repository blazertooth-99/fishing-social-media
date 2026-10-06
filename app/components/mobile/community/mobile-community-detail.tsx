"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Globe2,
  Loader2,
  Lock,
  RefreshCw,
  Send,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCommunityDetail } from "@/app/components/shared/community/use-community-detail";
import { isCommunityMember } from "@/lib/api/communities";
import {
  CommunityPostCard,
  MemberRow,
  RoleBadge,
} from "@/app/components/shared/community/community-detail-widgets";

export default function MobileCommunityDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const {
    community,
    members,
    posts,
    loading,
    notFound,
    error,
    tab,
    setTab,
    membershipLoading,
    membershipError,
    composer,
    setComposer,
    posting,
    postErrors,
    handleJoin,
    handleLeave,
    handleCreatePost,
    reload,
  } = useCommunityDetail(slug);

  const isMember = community ? isCommunityMember(community) : false;
  const myRole = (community?.my_role ?? "").toUpperCase();
  const isOwner = myRole === "OWNER";

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft size={19} />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold leading-tight text-slate-950">
              {community?.name ?? "Community"}
            </h1>
            {community && (
              <p className="truncate font-mono text-[11px] text-slate-400">
                @{community.slug}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-4">
        {loading ? (
          <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 rounded bg-slate-100" />
                <div className="h-3 w-full rounded bg-slate-100" />
              </div>
            </div>
          </div>
        ) : notFound || !community ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">
              Community not found
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              This community does not exist or was removed.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/community")}
              className="mt-4 rounded-xl"
            >
              Browse communities
            </Button>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-800">
              Failed to load community
            </p>
            <p className="mt-1 text-xs text-slate-500">{error}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void reload()}
              className="mt-4 gap-2 rounded-xl"
            >
              <RefreshCw size={15} />
              Try again
            </Button>
          </div>
        ) : (
          <>
            {/* HEADER CARD */}
            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="h-20 bg-gradient-to-r from-cyan-400 to-blue-500" />
              <div className="p-4 pt-0">
                <div className="-mt-7 flex items-end justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border-4 border-white bg-gradient-to-br from-cyan-400 to-blue-500 text-xl text-white shadow">
                    🎣
                  </div>
                  {isOwner ? (
                    <RoleBadge role="OWNER" />
                  ) : isMember ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={membershipLoading}
                      onClick={() => void handleLeave()}
                      className="shrink-0 rounded-lg"
                    >
                      {membershipLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Leave"
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      disabled={membershipLoading}
                      onClick={() => void handleJoin()}
                      className="shrink-0 rounded-lg bg-cyan-500 text-xs text-white hover:bg-cyan-600 disabled:opacity-60"
                    >
                      {membershipLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Join community"
                      )}
                    </Button>
                  )}
                </div>

                <h2 className="mt-2 text-lg font-bold text-slate-950">
                  {community.name}
                </h2>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {(community.member_count ?? 0).toLocaleString()} members
                  </span>
                  <span className="flex items-center gap-1">
                    {community.visibility === "PRIVATE" ? (
                      <Lock size={12} />
                    ) : (
                      <Globe2 size={12} />
                    )}
                    {community.visibility}
                  </span>
                  <span>
                    {(community.post_count ?? posts.length).toLocaleString()}{" "}
                    posts
                  </span>
                </div>

                {community.description && (
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    {community.description}
                  </p>
                )}

                {membershipError && (
                  <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                    {membershipError}
                  </p>
                )}
              </div>
            </section>

            {/* TABS */}
            <div className="mt-4 flex gap-2 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-sm">
              {(["posts", "members"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    tab === t
                      ? "bg-cyan-500 text-white shadow"
                      : "text-slate-500"
                  }`}
                >
                  {t === "posts"
                    ? `Posts (${posts.length})`
                    : `Members (${members.length})`}
                </button>
              ))}
            </div>

            {tab === "posts" ? (
              <div className="mt-4 space-y-3">
                {isMember ? (
                  <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                    <Textarea
                      value={composer}
                      onChange={(e) => setComposer(e.target.value)}
                      placeholder={`Share something with ${community.name}...`}
                      maxLength={1000}
                      rows={3}
                      disabled={posting}
                      className="resize-none rounded-xl border-slate-200 bg-slate-50 text-sm"
                    />
                    {postErrors.length > 0 && (
                      <div className="mt-2 space-y-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                        {postErrors.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {composer.trim().length}/1000
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => void handleCreatePost()}
                        disabled={posting || composer.trim().length === 0}
                        className="gap-1.5 rounded-lg bg-cyan-500 text-xs text-white hover:bg-cyan-600 disabled:opacity-60"
                      >
                        {posting ? (
                          <>
                            Posting
                            <Loader2 size={13} className="animate-spin" />
                          </>
                        ) : (
                          <>
                            Post
                            <Send size={13} />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-center shadow-sm">
                    <p className="text-xs font-medium text-slate-600">
                      Join this community to post
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void handleJoin()}
                      disabled={membershipLoading}
                      className="mt-2 rounded-lg bg-cyan-500 text-xs text-white hover:bg-cyan-600"
                    >
                      Join community
                    </Button>
                  </div>
                )}

                {posts.length === 0 ? (
                  <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
                    <p className="text-sm font-semibold text-slate-800">
                      No posts yet
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Be the first to share something here.
                    </p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <CommunityPostCard key={post.id} post={post} />
                  ))
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                {members.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">
                    No members to show.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {members.map((m) => (
                      <MemberRow key={m.user_id} member={m} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
