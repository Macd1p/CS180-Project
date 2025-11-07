// app/components/SiteHeader.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "how-it-works", label: "How It Works" },
  { id: "contact", label: "Contact us" },
];

export default function SiteHeader() {
  const [activeId, setActiveId] = useState<string>("home");

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
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    const OFFSET = 80; // header height
    const top =
      window.scrollY + el.getBoundingClientRect().top - OFFSET;

    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    // FULL-WIDTH + FIXED so it never scrolls away
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-10 py-3">
        {/* Left: logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-black text-xs font-bold text-white">
            P
          </span>
          <span className="text-lg font-semibold tracking-tight">
            FindMySpot
          </span>
        </Link>

        {/* Right: nav links + sign in */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          {SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={scrollToSection(id)}
              className={`
                pb-1 transition-colors
                ${
                  activeId === id
                    ? "text-gray-900 border-b-2 border-purple-500"
                    : "text-gray-600 hover:text-gray-900"
                }
              `}
            >
              {label}
            </a>
          ))}

          <Link
            href="/signin"
            className="rounded-full border border-purple-500 px-4 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-50"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
