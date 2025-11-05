"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeaderAuth() {
  const [checking, setChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch("/api/auth/whoami", { method: "GET" });
        if (!mounted) return;
        setIsAuthed(r.ok);
      } catch {
        if (!mounted) return;
        setIsAuthed(false);
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } finally {
      setIsAuthed(false);
      // send them home (adjust if you prefer a soft refresh)
      window.location.assign("/");
    }
  };

  if (checking) {
    return <div className="h-8 w-24 animate-pulse rounded-xl bg-gray-100" />;
  }

  if (!isAuthed) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/sign-in"
          className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/create-post"
        className="rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-gray-900"
      >
        Create post
      </Link>
      <button
        onClick={signOut}
        className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
      >
        Sign out
      </button>
    </div>
  );
}
