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

import DesktopSidebar from "../desktop-sidebar";

export default function DesktopCommunityDetail({ slug }: { slug: string }) {
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
  // Backend rejects owner leave ("cannot leave without transferring ownership"),
  // so owners get a badge instead of a Leave button that can only error.
  const myRole = (community?.my_role ?? "").toUpperCase();
  const isOwner = myRole === "OWNER";

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[240px_minmax(0,680px)_300px] gap-8 px-8 py-8">
        <aside className="border-r border-slate-200 bg-white">
          <DesktopSidebar />
        </aside>

        <section className="min-w-0">
          <div className="mx-auto max-w-3xl">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4 gap-2 rounded-xl text-slate-500"
            >
              <ArrowLeft size={17} />
              Back to communities
            </Button>

            {loading ? (
              <div className="animate-pulse rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-slate-100" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                    <div className="h-3 w-full rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            ) : notFound || !community ? (
              <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800">
                  Community not found
                </h3>
                <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-400">
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
              <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
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
                <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                  <div className="h-24 bg-gradient-to-r from-cyan-400 to-blue-500" />
                  <div className="p-6 pt-0">
                    <div className="-mt-8 flex items-end justify-between gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-cyan-400 to-blue-500 text-2xl text-white shadow-lg">
                        🎣
                      </div>
                      {isOwner ? (
                        <RoleBadge role="OWNER" />
                      ) : isMember ? (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={membershipLoading}
                          onClick={() => void handleLeave()}
                          className="shrink-0 rounded-xl"
                        >
                          {membershipLoading ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            "Leave"
                          )}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          disabled={membershipLoading}
                          onClick={() => void handleJoin()}
                          className="shrink-0 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-60"
                        >
                          {membershipLoading ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            "Join community"
                          )}
                        </Button>
                      )}
                    </div>

                    <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                      {community.name}
                    </h1>
                    <p className="mt-0.5 font-mono text-xs text-slate-400">
                      @{community.slug}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users size={13} />
                        {(community.member_count ?? 0).toLocaleString()} members
                      </span>
                      <span className="flex items-center gap-1">
                        {community.visibility === "PRIVATE" ? (
                          <Lock size={13} />
                        ) : (
                          <Globe2 size={13} />
                        )}
                        {community.visibility}
                      </span>
                      <span>
                        {(community.post_count ?? posts.length).toLocaleString()}{" "}
                        posts
                      </span>
                    </div>

                    {community.description && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {community.description}
                      </p>
                    )}

                    {membershipError && (
                      <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                        {membershipError}
                      </p>
                    )}
                  </div>
                </section>

                {/* TABS */}
                <div className="mt-6 flex gap-2 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-sm">
                  {(["posts", "members"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        tab === t
                          ? "bg-cyan-500 text-white shadow"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {t === "posts"
                        ? `Posts (${posts.length})`
                        : `Members (${members.length})`}
                    </button>
                  ))}
                </div>

                {tab === "posts" ? (
                  <div className="mt-5 space-y-4">
                    {isMember ? (
                      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
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
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            {composer.trim().length}/1000
                          </span>
                          <Button
                            type="button"
                            onClick={() => void handleCreatePost()}
                            disabled={posting || composer.trim().length === 0}
                            className="gap-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-60"
                          >
                            {posting ? (
                              <>
                                Posting
                                <Loader2 size={15} className="animate-spin" />
                              </>
                            ) : (
                              <>
                                Post
                                <Send size={15} />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center shadow-sm">
                        <p className="text-sm font-medium text-slate-600">
                          Join this community to post
                        </p>
                        <Button
                          type="button"
                          onClick={() => void handleJoin()}
                          disabled={membershipLoading}
                          className="mt-3 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600"
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
                  <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
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
        </section>

        {/* RIGHT SIDEBAR — member preview */}
        <aside className="min-w-0">
          <div className="sticky top-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Members</h2>
            <p className="mt-1 text-xs text-slate-400">
              {members.length} shown
            </p>
            <div className="mt-4 space-y-4">
              {members.slice(0, 6).map((m) => (
                <MemberRow key={m.user_id} member={m} />
              ))}
              {members.length === 0 && !loading && (
                <p className="text-xs text-slate-400">No members yet.</p>
              )}
            </div>
            {members.length > 6 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setTab("members")}
                className="mt-5 w-full rounded-xl"
              >
                View all members
              </Button>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
