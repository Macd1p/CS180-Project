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
  const [method, setMethod] = useState<"google" | "manual">("google");

  //profile state for manual signup
  const [profile, setProfile] = useState<ProfileState & { email?: string; password?: string }>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
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
    if (!gisReady || !window.google || !btnRef.current || method !== "google") return;

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
  }, [gisReady, method]);

  //handle manual signup submission
  const handleManualSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profile.email,
          password: profile.password,
          username: profile.username,
          firstname: profile.firstName,
          lastname: profile.lastName,
        }),
      });

      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || "Registration failed");
      }

      const j = await r.json();
      //save token + mark authed
      localStorage.setItem("fms_token", j.access_token);
      localStorage.setItem("fms_authed", "1");

      //also save profile locally for header/avatar immediately
      localStorage.setItem("fms_profile", JSON.stringify({
        firstName: profile.firstName,
        lastName: profile.lastName,
        username: profile.username,
        avatarUrl: profile.avatarUrl
      }));
      localStorage.setItem("fms_avatar", profile.avatarUrl);

      router.push(next);
    } catch (e: any) {
      setErr(e?.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  //finalize google signup store profile locally 
  const handleGoogleProfileFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const token = localStorage.getItem("fms_token");
      if (!token) throw new Error("No access token found");

      const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          firstname: profile.firstName,
          lastname: profile.lastName,
          username: profile.username
        }),
      });

      if (!r.ok) {
        throw new Error("Failed to update profile");
      }

      //save a lightweight client profile so header/avatar can show
      localStorage.setItem("fms_profile", JSON.stringify(profile));
      localStorage.setItem("fms_avatar", profile.avatarUrl);
      //token was already saved in Step 1
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
          {method === "google" && (
            <div className="mb-6 flex items-center gap-3 text-xs">
              <span className={`rounded-full px-2 py-1 ${step === 1 ? "bg-purple-600 text-white" : "bg-gray-200"}`}>1</span>
              <span className={step === 1 ? "font-semibold" : "text-gray-500"}>Sign up method</span>
              <span className="text-gray-400">/</span>
              <span className={`rounded-full px-2 py-1 ${step === 2 ? "bg-purple-600 text-white" : "bg-gray-200"}`}>2</span>
              <span className={step === 2 ? "font-semibold" : "text-gray-500"}>Profile details</span>
            </div>
          )}

          {method === "manual" ? (
            <div>
              <h2 className="text-xl font-semibold">Sign up with Email</h2>
              <p className="mt-1 text-sm text-gray-600">Enter your details to create an account.</p>

              <form onSubmit={handleManualSignup} className="mt-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">First name</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      placeholder="Jane"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Last name</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      placeholder="Smith"
                      required
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
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="jane@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Password</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                    value={profile.password}
                    onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
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

                <button
                  type="button"
                  onClick={() => { setMethod("google"); setErr(""); }}
                  className="w-full text-center text-xs text-gray-500 hover:text-gray-800 mt-2"
                >
                  Back to Google Sign up
                </button>
              </form>
            </div>
          ) : (
            //google flow
            step === 1 ? (
              <div>
                <h2 className="text-xl font-semibold">Continue with Google</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Or sign up manually below.
                </p>

                <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <div ref={btnRef} className="flex justify-center" />
                </div>

                <div className="mt-4 flex flex-col items-center gap-2">
                  <div className="text-xs text-gray-400">OR</div>
                  <button
                    onClick={() => setMethod("manual")}
                    className="w-full rounded-full border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Sign up with Email
                  </button>
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
              //google step 2: profile
              <div>
                <h2 className="text-xl font-semibold">Tell us about you</h2>
                <p className="mt-1 text-sm text-gray-600">Add a name and pick a username for your profile.</p>

                <form onSubmit={handleGoogleProfileFinalize} className="mt-4 space-y-4">
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
            )
          )}
        </div>
      </div>
    </main>
  );
}

