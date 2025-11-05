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

export default function SignInPage() {
  const [form, setForm] = useState<FormState>({ email: "", password: "", remember: false });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/parking";

  // ---- Google Identity Services setup ----
  const btnRef = useRef<HTMLDivElement>(null);
  const [gisReady, setGisReady] = useState(false);

  // load the GIS script once
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

  // render the Google button when ready
  useEffect(() => {
    if (!gisReady || !window.google || !btnRef.current) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp: any) => {
        try {
          const idToken = resp.credential as string;
          const r = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: idToken }),
          });
          if (!r.ok) {
            const j = await r.json().catch(() => ({}));
            throw new Error(j?.error || "Google sign-in failed");
          }
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

  // ---- (Optional) Email/password flow you already had ----
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email.includes("@")) return setError("Enter a valid email.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Invalid credentials");
      }

      router.push(next);
    } catch (err: any) {
      setError(err.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="mt-1 text-sm text-gray-600">
        You can browse spots without an account. To reserve or create a post, sign in.
      </p>

      {/* Email/password (optional) */}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
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
            className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => setForm({ ...form, remember: e.target.checked })}
          />
          Remember me
        </label>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black py-2 font-semibold text-white hover:bg-gray-900 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3 text-xs text-gray-500">
        <div className="h-px flex-1 bg-gray-200" />
        <span>or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Google Sign-in */}
      <div className="rounded-2xl border p-4">
        <div ref={btnRef} className="flex justify-center" />
      </div>

      <p className="mt-4 text-sm text-gray-600">
        You’ll go to: <span className="font-mono">{next}</span>
      </p>

      <p className="mt-4 text-sm text-gray-600">
        Don’t have an account?{" "}
        <Link href="/learn-more" className="underline">
          Learn more
        </Link>
      </p>
    </main>
  );
}


