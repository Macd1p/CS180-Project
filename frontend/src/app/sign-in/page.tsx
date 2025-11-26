/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type FormState = { email: string; password: string; remember: boolean };

declare global {
  interface Window {
    google?: any;
  }
}

import { Suspense } from "react";

function SignInContent() {
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/parking";

  // Google Identity
  const btnRef = useRef<HTMLDivElement>(null);
  const [gisReady, setGisReady] = useState(false);

  useEffect(() => {
    const id = "google-identity";
    if (document.getElementById(id)) {
      setGisReady(true);
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => setGisReady(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!gisReady || !window.google || !btnRef.current) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp: any) => {
        try {
          const idToken = resp.credential as string;

          const r = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google-signin`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: idToken }),
            }
          );

          // handle bad response
          if (!r.ok) {
            const j = await r.json().catch(() => ({}));
            throw new Error(j?.error || "Google sign-in failed");
          }

          // ✅ success: read access_token once
          const j = await r.json();

          // ✅ tell the app we’re authenticated
          localStorage.setItem("fms_token", j.access_token);
          localStorage.setItem("fms_authed", "1");
          localStorage.setItem("fms_avatar", "/images/default-avatar.png"); // or later from profile

          // ✅ notify any listeners (like SiteHeader)
          window.dispatchEvent(
            new StorageEvent("storage", { key: "fms_authed" })
          );

          // go to next page
          router.push(next);
        } catch (e: any) {
          setError(e?.message || "Google sign-in failed");
        }
      },
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      type: "standard",
      shape: "pill",
      theme: "outline",
      size: "large",
      text: "continue_with",
      logo_alignment: "left",
      width: 360,
    });
  }, [gisReady, router, next]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Invalid credentials");
      }

      // ✅ success: read access_token
      const j = await res.json();

      // ✅ tell the app we're authenticated
      localStorage.setItem("fms_token", j.access_token);
      localStorage.setItem("fms_authed", "1");
      localStorage.setItem("fms_avatar", "/images/default-avatar.png"); // or later from profile

      // ✅ notify any listeners (like AuthProvider)
      window.dispatchEvent(
        new StorageEvent("storage", { key: "fms_authed" })
      );

      router.push(next);
    } catch (err: any) {
      setError(err.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="
        min-h-screen
        bg-gradient-to-b from-gray-900 via-black to-gray-950
        text-gray-50
        flex items-center justify-center
        px-4
        pt-24
      "
    >
      {/* Card */}
      <div className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur text-gray-900">
        {/* Brand + intro */}
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-green-600">
            FINDMYSPOT
          </p>
          <h1 className="mt-1 text-2xl font-bold">
            Welcome back to FindMySpot
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Sign in to reserve spots, share your parking, and manage your
            account.
          </p>
        </div>

        {/* Email/password form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              className="h-3 w-3 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              checked={form.remember}
              onChange={(e) => setForm({ ...form, remember: e.target.checked })}
            />
            Remember me on this device
          </label>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-green-500 py-2.5 text-sm font-semibold text-gray-900 shadow hover:bg-green-400 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3 text-[10px] text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          <span>or continue with</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google Sign-in */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
          <div ref={btnRef} className="flex justify-center" />
        </div>

        {/* Meta + links */}
        <p className="mt-4 text-[10px] text-gray-500">
          After sign-in you&apos;ll be redirected to{" "}
          <span className="font-mono text-gray-700">{next}</span>.
        </p>

        <div className="mt-4 flex flex-col gap-1 text-sm">
          <p className="text-gray-700">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-purple-600 hover:underline"
            >
              Create an account
            </Link>
          </p>
          <p className="text-gray-500 text-xs">
            Prefer to look around first?{" "}
            <Link
              href="/"
              className="font-medium text-gray-700 hover:underline"
            >
              Back to homepage
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
