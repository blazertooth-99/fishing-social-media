import AuthLayout from "@/app/components/auth/auth-layout";
import LoginForm from "@/app/components/auth/login-form";

export default function LoginPage() {
    return (
        <AuthLayout>
            <LoginForm />
        </AuthLayout>
    );
}