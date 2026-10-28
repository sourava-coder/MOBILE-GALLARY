import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_PIN_COOKIE, verifyAdminPinSession } from "@/lib/admin-pin";

export function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/admin/login";
  const hasValidPin = verifyAdminPinSession(request.cookies.get(ADMIN_PIN_COOKIE)?.value);
  if (isLoginPage) {
    if (hasValidPin) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!hasValidPin) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("redirect", request.nextUrl.pathname);
    const redirectResponse = NextResponse.redirect(login);
    redirectResponse.cookies.delete(ADMIN_PIN_COOKIE);
    return redirectResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
