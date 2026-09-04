import AuthLayout from "@/app/components/auth/auth-layout";
import AuthController from "@/app/components/shared/auth-controller";

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthController />
    </AuthLayout>
  );
}
