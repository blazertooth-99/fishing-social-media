import AuthLayout from "@/app/components/auth/login-form-layout";
import RegisterForm from "@/app/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
