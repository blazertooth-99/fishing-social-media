import ProfileController from "@/app/components/shared/profile/profile-controller";
// import { requireAuth } from "@/lib/auth/guards";

export default async function ProfilePage() {
  // const user = await requireAuth();

  return (
    // <ProfileController user={user} />
    <ProfileController />
  );
}
