import ProfileController from "@/app/components/shared/profile/profile-controller";
import AuthGuard from "@/app/components/auth/auth-guard";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileController />
    </AuthGuard>
  );
}
