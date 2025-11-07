"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type ProfileState = { firstName: string; lastName: string; username: string; avatarUrl: string };

declare global { interface Window { google?: any; } }

export default function SignUpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/parking";

  const [step, setStep] = useState<1 | 2>(1);
  const [profile, setProfile] = useState<ProfileState>({
    firstName: "",
    lastName: "",
    username: "",
    avatarUrl: "/images/default-avatar.png",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Google Identity
  const btnRef = useRef<HTMLDivElement>(null);
  const [gisReady, setGisReady] = useState(false);

  useEffect(() => {
    const id = "google-identity";
    if (document.getElementById(id)) { setGisReady(true); return; }
    const s = document.createElement("script");
    s.id = id; s.src = "https://accounts.google.com/gsi/client";
    s.async = true; s.defer = true; s.onload = () => setGisReady(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!gisReady || !window.google || !btnRef.current) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp: any) => {
        try {
          setErr("");
          // Send token to your backend's ONLY auth endpoint
          const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google-signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: resp.credential }),
          });
          if (!r.ok) {
            const j = await r.json().catch(() => ({}));
            throw new Error(j?.error || "Google sign-in failed");
          }
          const j = await r.json();
          // Save token + mark authed; header will react to this
          localStorage.setItem("fms_token", j.access_token);
          localStorage.setItem("fms_authed", "1");

          // Move to Step 2 to collect local profile details
          setStep(2);
        } catch (e: any) {
          setErr(e?.message || "Google sign-in failed");
        }
      },
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      type: "standard",
      shape: "pill",
      theme: "outline",
      size: "large",
      text: "signup_with",
      logo_alignment: "left",
      width: 320,
    });
  }, [gisReady]);

  // Finalize: store profile locally (since backend has no endpoint yet)
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      // Save a lightweight client profile so header/avatar can show
      localStorage.setItem("fms_profile", JSON.stringify(profile));
      localStorage.setItem("fms_avatar", profile.avatarUrl);
      // token was already saved in Step 1
      router.push(next);
    } catch (e: any) {
      setErr(e?.message || "Could not complete profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 pt-24 text-gray-50">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 md:grid-cols-2">
        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-center">
          <p className="text-xs font-semibold tracking-[0.18em] text-green-500">FINDMYSPOT</p>
          <h1 className="mt-2 text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-gray-300">
            Join the community to post available spots, reserve parking, and follow trusted posters.
          </p>
          <div className="mt-6 relative h-56 w-full overflow-hidden rounded-3xl">
            <Image src="/images/hero-parking.jpg" alt="Parking" fill className="object-cover opacity-70" />
          </div>
        </div>

        {/* Right card */}
        <div className="rounded-3xl bg-white/95 p-6 text-gray-900 shadow-2xl backdrop-blur">
          <div className="mb-6 flex items-center gap-3 text-xs">
            <span className={`rounded-full px-2 py-1 ${step === 1 ? "bg-purple-600 text-white" : "bg-gray-200"}`}>1</span>
            <span className={step === 1 ? "font-semibold" : "text-gray-500"}>Sign up method</span>
            <span className="text-gray-400">/</span>
            <span className={`rounded-full px-2 py-1 ${step === 2 ? "bg-purple-600 text-white" : "bg-gray-200"}`}>2</span>
            <span className={step === 2 ? "font-semibold" : "text-gray-500"}>Profile details</span>
          </div>

          {step === 1 ? (
            <div>
              <h2 className="text-xl font-semibold">Continue with Google</h2>
              <p className="mt-1 text-sm text-gray-600">
                Email & password signup isn’t enabled yet.
              </p>

              <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div ref={btnRef} className="flex justify-center" />
              </div>

              {err && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {err}
                </div>
              )}

              <p className="mt-4 text-xs text-gray-600">
                Already have an account?{" "}
                <Link href="/sign-in" className="font-semibold text-purple-600 hover:underline">Sign in</Link>
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold">Tell us about you</h2>
              <p className="mt-1 text-sm text-gray-600">Add a name and pick a username for your profile.</p>

              <form onSubmit={handleCreateAccount} className="mt-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">First name</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Last name</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Username</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    placeholder="janesmith"
                  />
                  <p className="mt-1 text-[10px] text-gray-500">This is how others will see you.</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-purple-500/40">
                    <Image src={profile.avatarUrl} alt="Avatar" fill className="object-cover" />
                  </div>
                  <span className="text-xs text-gray-600">Profile picture (optional) — using default for now.</span>
                </div>

                {err && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {err}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-purple-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-purple-500 disabled:opacity-60"
                >
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </form>

              <p className="mt-4 text-xs text-gray-600">
                Prefer to sign in instead?{" "}
                <Link href="/sign-in" className="font-semibold text-purple-600 hover:underline">Sign in</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

