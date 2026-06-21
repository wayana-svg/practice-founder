const fs = require("fs");

function writeFile(path, content) {
  const folder = path.split("/").slice(0, -1).join("/");
  if (folder) fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path, content);
}

writeFile(
  "middleware.ts",
  `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\\\\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath =
    pathname === "/login" ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/api/logout") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname);

  if (isPublicPath) {
    return NextResponse.next();
  }

  const accessToken = process.env.APP_ACCESS_TOKEN;

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("setup", "missing-token");
    return NextResponse.redirect(loginUrl);
  }

  const cookieToken = request.cookies.get("pf_access")?.value;

  if (cookieToken === accessToken) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
`
);

writeFile(
  "app/api/login/route.ts",
  `import { NextRequest, NextResponse } from "next/server";

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
`
);

writeFile(
  "app/api/logout/route.ts",
  `import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set("pf_access", "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}
`
);

writeFile(
  "app/login/page.tsx",
  `"use client";

import { FormEvent, useState } from "react";

const colors = {
  navy: "#1C2333",
  gold: "#C9A84C",
  cream: "#F8F5EE",
  white: "#FFFFFF",
  border: "rgba(28,35,51,0.14)",
};

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setMessage(result.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const nextPath = params.get("next") || "/";
      window.location.href = nextPath.startsWith("/") ? nextPath : "/";
    } catch {
      setMessage("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: colors.cream,
        display: "grid",
        placeItems: "center",
        padding: "28px",
        color: colors.navy,
        fontFamily: "DM Sans, Arial, sans-serif",
      }}
    >
      <section
        style={{
          width: "min(520px, 100%)",
          background: colors.white,
          border: \`1px solid \${colors.border}\`,
          boxShadow: "0 24px 80px rgba(28,35,51,0.14)",
          padding: "34px",
        }}
      >
        <p
          style={{
            margin: "0 0 10px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontSize: "12px",
            fontWeight: 900,
            color: colors.gold,
          }}
        >
          Practice Founder
        </p>

        <h1
          style={{
            margin: "0 0 10px",
            fontSize: "34px",
            lineHeight: 1.05,
            fontFamily: "Playfair Display, Georgia, serif",
          }}
        >
          Private Access
        </h1>

        <p style={{ margin: "0 0 24px", lineHeight: 1.6 }}>
          Enter the internal access password to open the app.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
          <label style={{ display: "grid", gap: "8px", fontWeight: 800 }}>
            Access Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
              required
              style={{
                border: \`1px solid \${colors.border}\`,
                padding: "13px 14px",
                fontSize: "16px",
                outline: "none",
              }}
            />
          </label>

          {message ? (
            <div
              style={{
                border: "1px solid rgba(180,50,50,0.28)",
                background: "rgba(180,50,50,0.08)",
                padding: "11px 12px",
                fontWeight: 700,
              }}
            >
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              border: "none",
              background: colors.navy,
              color: colors.white,
              padding: "13px 16px",
              fontSize: "15px",
              fontWeight: 900,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Checking..." : "Open Practice Founder"}
          </button>
        </form>
      </section>
    </main>
  );
}
`
);

console.log("Private login gate files created.");