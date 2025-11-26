// app/layout.tsx
import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "./providers/AuthProvider";
import SiteHeader from "../components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Find My Spot",
  description: "Parking finder (demo)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <AuthProvider>
          {/* Skip link for accessibility */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-black focus:px-3 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>

          {/* Sticky navbar with active section underline */}
          <SiteHeader />

          {/* Page content */}
          <main id="main">{children}</main>

          {/* Minimal footer: just FindMySpot */}
          <footer className="border-t">
            <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-600">
              FindMySpot
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
