import ExploreController from "@/app/components/shared/explore-controller";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const rawQuery = params.q;
  const initialQuery =
    typeof rawQuery === "string"
      ? rawQuery
      : Array.isArray(rawQuery)
        ? (rawQuery[0] ?? "")
        : "";

  return <ExploreController key={initialQuery} initialQuery={initialQuery} />;
}
