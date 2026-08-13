import MobileHeader from "./mobile-header";
import MobileBottomNav from "./mobile-bottom-nav";
import MobileFishingPost from "./mobile-fishing-post";
import { fishingPostProps } from "@/app/utils/constant";

export default function MobileLayout() {
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <MobileHeader />

      <section className="px-3 py-4">
        <h1 className="mb-4 px-1 text-xl font-bold">Home</h1>

        <div className="space-y-2">
          {fishingPostProps.map((post) => (
            <MobileFishingPost key={post.id} post={post} />
          ))}
        </div>
      </section>

      <MobileBottomNav />
    </main>
  );
}
