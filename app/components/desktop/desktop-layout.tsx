import DesktopSidebar from "./desktop-sidebar";
import DesktopRightSidebar from "./desktop-right-sidebar";
import DesktopFishingPost from "./desktop-fishing-post";
import { fishingPostProps } from "@/app/utils/constant";

import CreatePost from "@/app/components/shared/post/create-post";

export default function DesktopLayout() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-[240px_minmax(0,1fr)_320px]">
        {/* LEFT SIDEBAR */}
        <aside className="border-r border-slate-200 bg-white">
          <DesktopSidebar />
        </aside>

        {/* MAIN FEED */}
        <section className="min-w-0 px-8 py-8">
          <div className="mx-auto max-w-3xl">
            <header className="mb-8">
              <p className="text-sm font-medium text-emerald-600">
                Welcome back, Angler 👋
              </p>

              <h1 className="mt-1 text-4xl font-bold tracking-tight">
                Fishing Community
              </h1>
            </header>

            <CreatePost />

            <div className="mt-8 space-y-6">
              {fishingPostProps.map((post) => (
                <DesktopFishingPost key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="border-l border-slate-200 bg-white">
          <DesktopRightSidebar />
        </aside>
      </div>
    </main>
  );
}
