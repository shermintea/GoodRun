import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const role = req.cookies.get("gr_role")?.value;
  const { pathname } = req.nextUrl;

  // Public routes (do not block)
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) return NextResponse.next();

  // Require auth for protected pages
  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Role gates
  if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard/volunteer";
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/dashboard/volunteer") && role !== "volunteer") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile", "/availableJobs", "/ongoingJobs"],
};
