"use client";

import { useEffect, useRef, useState } from "react";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;

          prompt: () => void;

          cancel: () => void;
        };
      };
    };
  }
}

export default function GoogleLoginButtonN() {
  const initializedRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    const initializeGoogle = () => {
      if (!window.google) {
        return;
      }

      if (initializedRef.current) {
        return;
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (!clientId) {
        setError("NEXT_PUBLIC_GOOGLE_CLIENT_ID belum tersedia.");
        return;
      }

      initializedRef.current = true;

      console.log("Initializing Google GIS...");

      window.google.accounts.id.initialize({
        client_id: clientId,

        callback: async (response) => {
          try {
            setLoading(true);
            setError(null);

            const idToken = response.credential;

            if (!idToken) {
              throw new Error("Google ID Token tidak ditemukan.");
            }

            console.log("Google ID Token received");

            // ==========================
            // 1. VERIFY GOOGLE TOKEN
            // ==========================

            const verifyResponse = await api.verifyGoogleIdToken(idToken);

            console.log("VERIFY RESPONSE:", verifyResponse);

            const sessionToken = verifyResponse?.data?.session_token;

            if (!sessionToken) {
              throw new Error("Backend tidak mengembalikan session_token.");
            }

            // ==========================
            // 2. CHECK SESSION
            // ==========================

            const session = await api.getSession();

            console.log("SESSION RESPONSE:", session);

            if (!session?.data) {
              throw new Error("Session tidak valid.");
            }

            // ==========================
            // 3. GET USER PROFILE
            // ==========================

            const profile = await api.getCurrentUserProfile();

            console.log("PROFILE RESPONSE:", profile);

            console.log("LOGIN BERHASIL 🎉");

            // ==========================
            // 4. REDIRECT
            // ==========================

            window.location.replace("/feed");
          } catch (err) {
            console.error("GOOGLE LOGIN ERROR:", err);

            setError(
              err instanceof Error ? err.message : "Google login gagal.",
            );
          } finally {
            setLoading(false);
          }
        },
      });
    };

    // Google GIS sudah tersedia
    if (window.google) {
      initializeGoogle();
      return;
    }

    // Cek apakah script sudah ada
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", initializeGoogle);

      return () => {
        existingScript.removeEventListener("load", initializeGoogle);
      };
    }

    // Load Google GIS
    const script = document.createElement("script");

    script.src = "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    script.onload = initializeGoogle;

    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  const handleGoogleLogin = () => {
    if (!window.google) {
      setError("Google authentication belum siap. Silakan coba lagi.");
      return;
    }

    setError(null);

    window.google.accounts.id.prompt();
  };

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        {loading ? (
          "Authenticating..."
        ) : (
          <>
            {/* Google Icon */}
            <svg
              className="mr-2 h-5 w-5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M21.35 12.27c0-.68-.06-1.33-.17-1.95H12v3.69h5.22a4.46 4.46 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.93-4.18 2.93-7.1Z"
              />
              <path
                fill="#34A853"
                d="M12 21.75c2.63 0 4.84-.87 6.45-2.38l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.29v2.5A9.75 9.75 0 0 0 12 21.75Z"
              />
              <path
                fill="#FBBC05"
                d="M6.53 13.83A5.86 5.86 0 0 1 6.22 12c0-.64.11-1.26.31-1.83v-2.5H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.04 4.33l3.24-2.5Z"
              />
              <path
                fill="#EA4335"
                d="M12 6.14c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.84 3.15 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.71 5.42l3.24 2.5c.77-2.31 2.93-4.03 5.47-4.03Z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </Button>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </div>
  );
}
