import FeedController from "@/app/components/shared/feed-controller";
// import AuthGuard from "@/app/components/auth/auth-guard";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{
    post?: string | string[];
    comment?: string | string[];
    highlight?: string | string[];
  }>;
}) {
  const query = await searchParams;
  const focusedPostId = typeof query.post === "string" ? query.post : null;
  const requestedCommentId =
    typeof query.comment === "string" ? query.comment : null;
  const highlightRecentComment =
    query.highlight === "1" || query.highlight === "true";

  return (
    <FeedController
      focusedPostId={focusedPostId}
      requestedCommentId={requestedCommentId}
      highlightRecentComment={highlightRecentComment}
    />
  );
}
