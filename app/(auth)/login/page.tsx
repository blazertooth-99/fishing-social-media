import LoginFormLayout from "@/app/components/auth/login-form-layout";
import LoginFormController from "@/app/components/shared/login-form-controller";

export default function LoginPage() {
  return (
    <LoginFormLayout>
      <LoginFormController />
    </LoginFormLayout>
  );
}
