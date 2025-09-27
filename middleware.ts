import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_ONLY_PATHS = [/^\/admin(\/.*)?$/];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.redirect(new URL(`/auth/sign-in?callbackUrl=${encodeURIComponent(request.url)}`, request.url));
  }

  const isAdminPath = ADMIN_ONLY_PATHS.some((regex) => regex.test(request.nextUrl.pathname));
  if (isAdminPath && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
