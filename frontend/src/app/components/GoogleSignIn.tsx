"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onSuccess?: () => void;
};

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleSignIn({ onSuccess }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = "google-identity";
    if (document.getElementById(id)) {
      setReady(true);
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!ready || !window.google || !btnRef.current) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp: any) => {
        const idToken = resp.credential as string;
        const r = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken }),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          alert(j?.error || "Google sign-in failed");
          return;
        }
        onSuccess?.();
      },
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      type: "standard",
      shape: "pill",
      theme: "outline",
      size: "large",
      text: "continue_with",
      logo_alignment: "left",
    });
  }, [ready, onSuccess]);

  return <div ref={btnRef} className="w-full" />;
}
