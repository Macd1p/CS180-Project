import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));

  // Demo check: use demo@demo.com / password
  if (email === "demo@demo.com" && password === "password") {
    // In production: set an httpOnly cookie (session/JWT) here
    return NextResponse.json({ ok: true, user: { email } }, { status: 200 });
  }
  return NextResponse.json(
    { ok: false, error: "Invalid credentials" },
    { status: 401 }
  );
}
