import FeedController from "@/app/components/shared/feed-controller";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

async function getSession() {
  const response = await fetch(`${API_URL}/auth/session`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function FeedPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <FeedController />;
}
