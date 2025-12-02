"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "../../app/providers/AuthProvider";

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "how-it-works", label: "How It Works" },
  { id: "contact", label: "Contact us" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated, signOut } = useAuth();
  
  const [activeId, setActiveId] = useState<string>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  
  // Default avatar if none provided
  const [avatarUrl, setAvatarUrl] = useState("/images/default-avatar.svg");

  // Ensure component is mounted before using pathname
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track section in view (only relevant for landing page)
  useEffect(() => {
    if (pathname !== "/") return;

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
  }, [pathname]);

  // Load avatar from local storage if available (or could come from auth context if we added it there)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const av = localStorage.getItem("fms_avatar");
      if (av) setAvatarUrl(av);
    }
  }, [isAuthenticated]);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    // If we are not on home page, let the link redirect to /#id
    if (pathname !== "/") return;

    const el = document.getElementById(id);
    if (!el) return;

    e.preventDefault();
    const OFFSET = 80;
    const top =
      window.scrollY + el.getBoundingClientRect().top - OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  };

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

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
  };

  const isParkingPage = mounted && (pathname?.startsWith("/parking") || pathname?.startsWith("/post"));

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
          {!isParkingPage ? (
            // Landing Page Nav
            SECTIONS.map(({ id, label }) => (
              <Link
                key={id}
                href={`/#${id}`}
                onClick={scrollToSection(id)}
                className={`pb-1 transition-colors ${
                  activeId === id && pathname === "/"
                    ? "border-b-2 border-purple-500 text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {label}
              </Link>
            ))
          ) : (
            // Parking/App Nav
            <>
              <Link
                href="/parking"
                className={`pb-1 transition-colors ${
                   pathname === "/parking"
                    ? "border-b-2 border-purple-500 text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Browse
              </Link>
              <Link
                href="/post"
                className={`pb-1 transition-colors ${
                   pathname === "/post"
                    ? "border-b-2 border-purple-500 text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Posts
              </Link>
              <Link
                href="/post/create"
                className="rounded-full bg-green-500 px-4 py-1.5 text-xs font-semibold text-gray-900 shadow-sm hover:bg-green-400"
              >
                Create Post
              </Link>
            </>
          )}

          {/* If not signed in: buttons */}
          {!isAuthenticated && (
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
          {isAuthenticated && (
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
