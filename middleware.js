import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isAuthPage = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";
  const isPublicPage = nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/api/auth");

  // 1. Redirect if user is not logged in and attempts to access private pages
  if (!isLoggedIn && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 2. Redirect if user is logged in and tries to hit login/register again
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 3. Prevent Supervisors from viewing payroll or expenses
  if (isLoggedIn && userRole === "supervisor") {
    const isProhibitedPath = 
      nextUrl.pathname.startsWith("/payroll") || 
      nextUrl.pathname.startsWith("/expenses") ||
      nextUrl.pathname.startsWith("/projects/finance");
      
    if (isProhibitedPath) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  // 4. Prevent Accountants from doing admin operations
  if (isLoggedIn && userRole === "accountant") {
    const isProhibitedPath = 
      nextUrl.pathname.startsWith("/settings/billing") ||
      (nextUrl.pathname.startsWith("/workers") && nextUrl.searchParams.get("action") === "create");
      
    if (isProhibitedPath) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
