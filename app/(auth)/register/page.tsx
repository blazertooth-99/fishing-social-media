import AuthLayout from "@/app/components/auth/auth-layout";
import RegisterForm from "@/app/components/auth/register-form";

export default function RegisterPage() {
    return (
        <AuthLayout>
            <RegisterForm />
        </AuthLayout>
    );
}