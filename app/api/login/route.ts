import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const password = String(body.password || "");

  const expectedPassword = process.env.APP_ACCESS_PASSWORD;
  const accessToken = process.env.APP_ACCESS_TOKEN;

  if (!expectedPassword || !accessToken) {
    return NextResponse.json(
      { ok: false, message: "Login is not configured yet." },
      { status: 500 }
    );
  }

  if (password !== expectedPassword) {
    return NextResponse.json(
      { ok: false, message: "Wrong password. Please try again." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set("pf_access", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
