"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  Search,
  Users,
  Globe2,
  SlidersHorizontal,
  ArrowLeft,
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

export default function MobileCommunity() {
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
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".mobile-community-header", { opacity: 0, y: -20, duration: 0.5 })
        .from(".mobile-community-search", { opacity: 0, y: 15, duration: 0.4 }, "-=0.25")
        .from(
          ".mobile-community-card",
          { opacity: 0, y: 25, duration: 0.5, stagger: 0.1 },
          "-=0.2",
        );
    }, containerRef);

    return () => ctx.revert();
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
      setCommunities((prev) =>
        prev.map((c) => (c.id === community.id ? { ...c, is_member: true } : c)),
      );
    } finally {
      setJoiningId(null);
    }
  }

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50 pb-24">
      <header className="mobile-community-header sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={19} />
            </Button>

            <div>
              <p className="text-[11px] font-medium text-cyan-600">
                Meet fellow anglers
              </p>

              <h1 className="text-lg font-bold leading-tight text-slate-950">
                Communities
              </h1>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setDialogOpen(true)}
            size="icon"
            className="h-9 w-9 rounded-full bg-cyan-500 text-white hover:bg-cyan-600"
            aria-label="Create community"
          >
            <Plus size={19} />
          </Button>
        </div>

        <p className="mt-3 pl-12 text-xs leading-5 text-slate-500">
          Find communities that share your fishing passion.
        </p>
      </header>

      <section className="mobile-community-search bg-white px-4 pb-4 pt-2">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search communities..."
            className="h-11 rounded-xl border-0 bg-slate-50 pl-10 pr-11 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-cyan-500"
          />

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-lg text-slate-400"
          >
            <SlidersHorizontal size={17} />
          </Button>
        </div>

        <Button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="mt-3 w-full gap-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600"
        >
          <Plus size={16} />
          Create community
        </Button>
      </section>

      <section className="px-4 py-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Discover communities
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {loading
                ? "Loading communities..."
                : `${filteredCommunities.length} communities available`}
            </p>
          </div>

          <button type="button" className="text-xs font-semibold text-cyan-600">
            See all
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                    <div className="h-3 w-full rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
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
        ) : (
          <div className="space-y-4">
            {filteredCommunities.map((community) => (
              <article
                key={community.id}
                onClick={() => openCommunity(community)}
                className="mobile-community-card cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-xl text-white shadow-sm">
                      🎣
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-bold text-slate-950">
                            {community.name}
                          </h2>

                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              {(community.member_count ?? 0).toLocaleString()} members
                            </span>

                            <span className="flex items-center gap-1">
                              <Globe2 size={12} />
                              {community.visibility}
                            </span>
                          </div>

                          <p className="mt-1 truncate font-mono text-[10px] text-slate-400">
                            @{community.slug}
                          </p>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          disabled={joiningId === community.id || community.is_member === true}
                          onClick={(e) => void handleJoin(e, community)}
                          className="h-8 shrink-0 rounded-lg bg-cyan-500 px-3 text-xs hover:bg-cyan-600 disabled:opacity-60"
                        >
                          {joiningId === community.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : community.is_member ? (
                            "Joined"
                          ) : (
                            "Join"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-5 text-slate-600">
                    {community.description || "No description yet."}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                      <Users size={14} />
                      Community members
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCommunity(community);
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-cyan-600"
                    >
                      Open community
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && filteredCommunities.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Users size={24} className="text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
              {communities.length === 0 ? "No communities yet" : "No communities found"}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-400">
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
        )}
      </section>

      {/* Floating create button for one-tap access on mobile */}
      <Button
        type="button"
        onClick={() => setDialogOpen(true)}
        size="icon"
        aria-label="Create community"
        className="fixed bottom-24 right-4 z-30 h-13 w-13 rounded-full bg-cyan-500 p-4 text-white shadow-xl shadow-cyan-500/30 hover:bg-cyan-600"
      >
        <Plus size={22} />
      </Button>

      <CreateCommunityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCommunityCreated={handleCommunityCreated}
      />
    </main>
  );
}
