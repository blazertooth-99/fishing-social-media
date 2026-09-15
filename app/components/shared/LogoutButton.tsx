
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function LogoutButton() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        try {
            setLoading(true);

            // Logout dari backend
            await api.logout();

            // Redirect ke login
            router.replace("/login");
        } catch (error) {
            console.error("LOGOUT ERROR:", error);

            // Tetap hapus session lokal
            // dan redirect jika backend logout gagal
            api.setSessionToken(null);

            router.replace("/login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            disabled={loading}
            className="gap-2"
        >
            {loading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Logging out...
                </>
            ) : (
                <>
                    <LogOut className="h-4 w-4" />
                    Logout
                </>
            )}
        </Button>
    );
}

