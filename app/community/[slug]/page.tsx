import CommunityDetailController from "@/app/components/shared/community-detail-controller";

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CommunityDetailController slug={decodeURIComponent(slug)} />;
}
