import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Option A: just check cookie presence
  const token = req.cookies.get("fm_auth")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  // Option B (better): call a protected Flask endpoint to verify.
  // If you don't have one yet, stick with Option A.
  return NextResponse.json({ ok: true });
}
