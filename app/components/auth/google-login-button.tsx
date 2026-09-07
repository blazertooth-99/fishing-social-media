"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api-fishing.janissaryid.com";

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  function handleGoogleLogin() {
    setLoading(true);

    window.location.href = `${API_URL}/api/v1/auth/google`;
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full rounded-xl"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <span className="mr-2 font-bold">G</span>
      )}
      Continue with Google
    </Button>
  );
}
