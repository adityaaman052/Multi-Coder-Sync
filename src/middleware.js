import { NextResponse } from "next/server";

export function middleware(req) {
  const path = req.nextUrl.pathname;

  const publicPath =
    path === "/" || path === "/login" || path === "/signup";

  const token = req.cookies.get("token")?.value || "";

  // If user is logged in and tries to access login/signup, redirect to home
  if (publicPath && token && path !== "/") {
    return NextResponse.redirect(new URL("/home", req.nextUrl));
  }

  // If user is not logged in and tries to access protected routes
  if (!publicPath && !token) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/home",
    "/collaborate/:path*",
  ],
};
