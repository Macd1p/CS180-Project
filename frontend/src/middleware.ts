import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/create-post", "/reserve"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get("fm_auth")?.value;
  if (!token) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/create-post/:path*", "/reserve/:path*"],
};
