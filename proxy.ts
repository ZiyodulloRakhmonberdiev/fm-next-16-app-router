import createMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { canAccessDashboardPath, getDefaultDashboardPath } from "@/shared/common/lib/rbac";

const intlMiddleware = createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

export async function proxy(req: NextRequest) {
  const intlResponse = intlMiddleware(req);
  const pathname = req.nextUrl.pathname;

  const locale = routing.locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  const localizedPath = locale ? pathname.slice(locale.length + 1) || "/" : pathname;

  if (!localizedPath.startsWith("/dashboard")) {
    return intlResponse;
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  });

  if (!token?.id) {
    const loginPath = locale ? `/${locale}/auth/login` : "/auth/login";
    return NextResponse.redirect(new URL(loginPath, req.url));
  }

  if (!canAccessDashboardPath(typeof token.role === "string" ? token.role : undefined, localizedPath)) {
    const fallback = getDefaultDashboardPath(typeof token.role === "string" ? token.role : undefined);
    const target = fallback ? (locale ? `/${locale}${fallback}` : fallback) : (locale ? `/${locale}/auth/login` : "/auth/login");
    return NextResponse.redirect(new URL(target, req.url));
  }

  return intlResponse;
}
