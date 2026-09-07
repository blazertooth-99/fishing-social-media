import FeedController from "@/app/components/shared/feed-controller";
// import { requireAuth } from "@/lib/auth/guards";

export default async function FeedPage() {
  // const user = await requireAuth();

  return (
    // <FeedController user={user} />;
    <FeedController />
  );
}
