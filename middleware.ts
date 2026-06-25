import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\\.(.*)$/;

const PUBLIC_FORM_PATHS = [
  "/daily-receptionist-tracker",
  "/daily-physician-tracker",
  "/weekly-financial-report",
  "/membership-tracker",
  "/deliverables",
  "/tasks",
  "/issues-breakdowns",
  "/roles",
  "/employees",
  "/ar-report-submissions",
  "/charge-lag",
  "/daily-billing-claims",
  "/daily-operations-logs",
  "/weekly-claims-summary",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath =
    PUBLIC_FORM_PATHS.includes(pathname) ||
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
