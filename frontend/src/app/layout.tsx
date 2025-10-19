import type { Metadata } from "next";
import Link from "next/link";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: " Find My Spot",
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
        {/* Skip link for accessibility */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-black focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-black font-bold text-white">
                P
              </span>
              <span className="text-lg font-semibold tracking-tight">
                FindMySpot
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Sign in
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main id="main">{children}</main>

        {/* Footer */}
        <footer className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-600">
            © {new Date().getFullYear()}  Find My Spot
          </div>
        </footer>
      </body>
    </html>
  );
}
