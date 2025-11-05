import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
    const upstream = await fetch(`${base}/auth/google-signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Flask expects { token: <id_token> }
      body: JSON.stringify({ token }),
    });

    const data = await upstream.json().catch(() => ({} as any));
    if (!upstream.ok) {
      return NextResponse.json(
        { error: data?.error || "Auth failed" },
        { status: upstream.status || 401 }
      );
    }

    const access = data?.access_token as string;
    if (!access) {
      return NextResponse.json(
        { error: "No access token from server" },
        { status: 500 }
      );
    }

    // Set secure httpOnly cookie for ~7 days (adjust to your JWT expiry)
    const res = NextResponse.json({ ok: true });
    res.cookies.set("fm_auth", access, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
