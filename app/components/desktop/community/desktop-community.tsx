"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  Search,
  Users,
  Globe2,
  Plus,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  joinCommunity,
  listCommunities,
  extractCommunityErrorMessage,
  type ApiCommunity,
} from "@/lib/api/communities";
import CreateCommunityDialog from "@/app/components/shared/community/create-community-dialog";

import DesktopSidebar from "../desktop-sidebar";
import DesktopCommunityRightSidebar from "./desktop-community-right-sidebar";

gsap.registerPlugin(ScrollTrigger);

export default function DesktopCommunity() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [communities, setCommunities] = useState<ApiCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  async function handleRetry() {
    setLoading(true);
    setError(null);
    try {
      const { items } = await listCommunities({ limit: 20 });
      setCommunities(items);
    } catch (err) {
      setError(extractCommunityErrorMessage(err, "Failed to load communities"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { items } = await listCommunities({ limit: 20 });
        if (cancelled) return;
        setCommunities(items);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(extractCommunityErrorMessage(err, "Failed to load communities"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from(".community-header", {
        opacity: 0,
        y: 25,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.utils.toArray<HTMLElement>(".community-card").forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 45 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              end: "top 60%",
              toggleActions: "play none none none",
              once: true,
            },
          },
        );
      });

      gsap.from(".community-sidebar", {
        opacity: 0,
        x: 25,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [loading, communities.length]);

  const filteredCommunities = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return communities;
    return communities.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.description ?? "").toLowerCase().includes(query) ||
        c.slug.toLowerCase().includes(query) ||
        String(c.visibility).toLowerCase().includes(query),
    );
  }, [communities, search]);

  function handleCommunityCreated(created: ApiCommunity) {
    setCommunities((prev) => {
      if (prev.some((c) => c.id === created.id)) return prev;
      return [created, ...prev];
    });
  }

  function openCommunity(community: ApiCommunity) {
    router.push(`/community/${encodeURIComponent(community.slug || community.id)}`);
  }

  async function handleJoin(
    e: React.MouseEvent,
    community: ApiCommunity,
  ) {
    e.stopPropagation();
    if (joiningId) return;
    setJoiningId(community.id);
    try {
      await joinCommunity(community.slug || community.id);
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === community.id
            ? { ...c, is_member: true, member_count: (c.member_count ?? 0) + 1 }
            : c,
        ),
      );
    } catch {
      // Keep the list as-is; join errors (e.g. already a member) are non-fatal here.
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === community.id ? { ...c, is_member: true } : c,
        ),
      );
    } finally {
      setJoiningId(null);
    }
  }

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50">
      <div
        className="
          mx-auto
          grid
          max-w-[1400px]
          grid-cols-[240px_minmax(0,680px)_300px]
          gap-8
          px-8
          py-8
        "
      >
        <aside className="border-r border-slate-200 bg-white">
          <DesktopSidebar />
        </aside>

        <section className="min-w-0">
          <div className="mx-auto max-w-3xl">
            <header className="community-header mb-8">
              <p className="text-sm font-medium text-cyan-600">
                Meet fellow anglers 🎣
              </p>

              <div className="mt-1 flex items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Communities
                </h1>
                <Button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="shrink-0 gap-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600"
                >
                  <Plus size={17} />
                  Create community
                </Button>
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Find communities that share your fishing passion and exchange
                your experience.
              </p>

              <div className="relative mt-6">
                <Search
                  size={18}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search fishing communities..."
                  className="
                    h-11
                    rounded-xl
                    border-0
                    bg-white
                    pl-10
                    shadow-sm
                    focus-visible:ring-2
                    focus-visible:ring-cyan-400
                  "
                />
              </div>
            </header>

            {loading ? (
              <div className="space-y-5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-slate-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 rounded bg-slate-100" />
                        <div className="h-3 w-1/2 rounded bg-slate-100" />
                        <div className="h-3 w-full rounded bg-slate-100" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
                <p className="text-sm font-semibold text-slate-800">
                  Failed to load communities
                </p>
                <p className="mt-1 text-xs text-slate-500">{error}</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleRetry()}
                  className="mt-4 gap-2 rounded-xl"
                >
                  <RefreshCw size={15} />
                  Try again
                </Button>
              </div>
            ) : filteredCommunities.length === 0 ? (
              <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <Users size={24} className="text-slate-400" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-800">
                  {communities.length === 0
                    ? "No communities yet"
                    : "No communities found"}
                </h3>
                <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-400">
                  {communities.length === 0
                    ? "Be the first to start a fishing community."
                    : "Try another keyword, or create a new community."}
                </p>
                <Button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="mt-4 gap-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600"
                >
                  <Plus size={15} />
                  Create community
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-xs text-slate-400">
                  {filteredCommunities.length} communities available
                </p>
                {filteredCommunities.map((community) => (
                  <article
                    key={community.id}
                    onClick={() => openCommunity(community)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") openCommunity(community);
                    }}
                    tabIndex={0}
                    role="link"
                    className="
                      community-card
                      cursor-pointer
                      overflow-hidden
                      rounded-3xl
                      border
                      border-slate-100
                      bg-white
                      shadow-sm
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-xl
                    "
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className="
                            flex
                            h-16
                            w-16
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            bg-gradient-to-br
                            from-cyan-400
                            to-blue-500
                            text-2xl
                            text-white
                            shadow-lg
                            shadow-cyan-500/10
                          "
                        >
                          🎣
                        </div>

                        <div className="min-w-0 flex-1">
                          <h2 className="truncate font-bold text-slate-900">
                            {community.name}
                          </h2>

                          <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Users size={13} />
                              {(community.member_count ?? 0).toLocaleString()} members
                            </span>

                            <span className="flex items-center gap-1">
                              <Globe2 size={13} />
                              {community.visibility}
                            </span>

                            <span className="font-mono text-[11px]">
                              @{community.slug}
                            </span>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {community.description || "No description yet."}
                          </p>
                        </div>

                        <Button
                          type="button"
                          disabled={joiningId === community.id || community.is_member === true}
                          onClick={(e) => void handleJoin(e, community)}
                          className="
                            shrink-0
                            rounded-xl
                            bg-cyan-500
                            text-white
                            transition-all
                            hover:bg-cyan-600
                            hover:shadow-lg
                            hover:shadow-cyan-500/20
                            disabled:opacity-60
                          "
                        >
                          {joiningId === community.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : community.is_member ? (
                            "Joined"
                          ) : (
                            "Join"
                          )}
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="community-sidebar min-w-0">
          <DesktopCommunityRightSidebar />
        </aside>
      </div>

      <CreateCommunityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCommunityCreated={handleCommunityCreated}
      />
    </main>
  );
}
