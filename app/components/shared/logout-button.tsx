"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function LogoutButton() {
  const { logout, loading } = useAuth();

  return (
    <Button variant="ghost" onClick={() => logout()} disabled={loading}>
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
