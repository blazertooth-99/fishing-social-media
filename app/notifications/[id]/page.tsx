import NotificationDeepLink from "@/app/components/shared/notifications/notification-deep-link";

export default async function NotificationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    post?: string | string[];
    comment?: string | string[];
    highlight?: string | string[];
  }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const post = typeof query.post === "string" ? query.post : null;
  const comment = typeof query.comment === "string" ? query.comment : null;
  const highlight = query.highlight === "1" || query.highlight === "true";

  return (
    <NotificationDeepLink
      id={decodeURIComponent(id)}
      postId={post}
      commentId={comment}
      highlight={highlight}
    />
  );
}
