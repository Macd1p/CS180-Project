"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "how-it-works", label: "How It Works" },
  { id: "contact", label: "Contact us" },
];

export default function SiteHeader() {
  const [activeId, setActiveId] = useState<string>("home");
  const [authed, setAuthed] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/images/default-avatar.png");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Track section in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0.1,
      }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    const el = document.getElementById(id);
    // If section doesn’t exist (e.g. on /parking), let link act normally
    if (!el) return;

    e.preventDefault();
    const OFFSET = 80;
    const top =
      window.scrollY + el.getBoundingClientRect().top - OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // Read auth state from localStorage
  useEffect(() => {
    const readAuth = () => {
      if (typeof window === "undefined") return;
      const authedFlag = localStorage.getItem("fms_authed");
      const token = localStorage.getItem("fms_token");
      const av = localStorage.getItem("fms_avatar");

      const isAuthed = authedFlag === "1" || !!token;
      setAuthed(isAuthed);
      if (av) setAvatarUrl(av);
    };

    readAuth();
    window.addEventListener("storage", readAuth);
    return () => window.removeEventListener("storage", readAuth);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      window.addEventListener("click", handleClick);
    }
    return () => window.removeEventListener("click", handleClick);
  }, [menuOpen]);

  const handleSignOut = () => {
    // Clear our local auth markers
    localStorage.removeItem("fms_token");
    localStorage.removeItem("fms_authed");
    localStorage.removeItem("fms_avatar");
    localStorage.removeItem("fms_profile");

    // Let header & any other listeners react
    window.dispatchEvent(
      new StorageEvent("storage", { key: "fms_authed" })
    );

    setMenuOpen(false);
    // Simple redirect home
    window.location.href = "/";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="flex w-full items-center justify-between px-8 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-black text-xs font-bold text-white">
            P
          </span>
          <span className="text-lg font-semibold tracking-tight">
            FindMySpot
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          {SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              href={`/#${id}`}
              onClick={scrollToSection(id)}
              className={`pb-1 transition-colors ${
                activeId === id
                  ? "border-b-2 border-purple-500 text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {label}
            </a>
          ))}

          {/* If not signed in: buttons */}
          {!authed && (
            <>
              <Link
                href="/signup"
                className="rounded-full bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-500"
              >
                Create account
              </Link>
              <Link
                href="/sign-in"
                className="rounded-full border border-purple-500 px-4 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-50"
              >
                Sign in
              </Link>
            </>
          )}

          {/* If signed in: avatar + dropdown */}
          {authed && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((open) => !open);
                }}
                className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-purple-500/30"
              >
                <Image
                  src={avatarUrl}
                  alt="Your profile"
                  fill
                  className="object-cover"
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-100 bg-white py-1 text-xs text-gray-700 shadow-lg">
                  <Link
                    href="/account"
                    className="block px-3 py-2 hover:bg-gray-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Edit account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full px-3 py-2 text-left text-red-600 hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
