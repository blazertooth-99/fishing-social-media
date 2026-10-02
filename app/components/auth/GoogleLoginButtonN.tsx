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
            ux_mode?: "popup" | "redirect";
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              width?: number;
              text?: "continue_with" | "signin_with" | "signup_with";
              shape?: "rectangular" | "pill" | "circle" | "square";
            },
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export default function GoogleLoginButtonN() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const [gisReady, setGisReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const renderGisButton = () => {
      if (
        cancelled ||
        !window.google?.accounts?.id ||
        !buttonRef.current ||
        initializedRef.current
      ) {
        return;
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (!clientId) {
        setError("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured.");
        return;
      }

      initializedRef.current = true;

      window.google.accounts.id.initialize({
        client_id: clientId,
        ux_mode: "popup",
        auto_select: false,

        callback: async (response) => {
          try {
            setLoading(true);
            setError(null);

            const idToken = response?.credential;

            if (!idToken) {
              throw new Error("Google ID token not found.");
            }

            // Verify Google ID token through backend
            const verifyResponse = await api.verifyGoogleIdToken(idToken);

            const sessionToken = verifyResponse?.data?.session_token;

            if (!sessionToken) {
              throw new Error("Backend did not return a session_token.");
            }

            // Verify session
            const session = await api.getSession();

            if (!session?.data) {
              throw new Error("Session is not valid.");
            }

            // Fetch current user profile
            await api.getCurrentUserProfile();

            // Redirect after successful authentication
            window.location.replace("/feed");
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Google login failed.",
            );
          } finally {
            setLoading(false);
          }
        },
      });

      const container = buttonRef.current;
      const width = Math.floor(container.clientWidth || 320);

      window.google.accounts.id.renderButton(container, {
        theme: "outline",
        size: "large",
        width,
        text: "continue_with",
        shape: "circle",
      });

      setGisReady(true);
    };

    // GIS script already loaded
    if (window.google?.accounts?.id) {
      renderGisButton();

      return () => {
        cancelled = true;
      };
    }

    // Reuse existing GIS script if available
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", renderGisButton);

      return () => {
        cancelled = true;
        existingScript.removeEventListener("load", renderGisButton);
      };
    }

    // Load GIS script
    const script = document.createElement("script");

    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGisButton;

    script.onerror = () => {
      if (!cancelled) {
        setError("Failed to load Google sign-in. Try again.");
      }
    };

    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.onload = null;

      try {
        window.google?.accounts?.id?.cancel();
      } catch {
        // Non-fatal
      }
    };
  }, []);

  return (
    <div className="w-full">
      {/* Loading placeholder */}
      {!gisReady && !error && (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled
        >
          Loading Google sign-in...
        </Button>
      )}

      {/* Google GIS button */}
      <div
        className="
          flex
          w-full
          justify-center
          overflow-hidden
        "
        aria-hidden={loading}
      >
        <div ref={buttonRef} className="w-full flex justify-center" />
      </div>

      {/* Authentication status */}
      {loading && (
        <p className="mt-3 text-center text-sm text-slate-500">
          Authenticating...
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-3 text-center text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
