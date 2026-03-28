import createMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { canAccessDashboardPath, getDefaultDashboardPath } from "@/shared/common/lib/rbac";

const intlMiddleware = createMiddleware(routing);

// In-memory rate limiter (Note: resets on server restart/cold start)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const LIMIT = 100; // requests
const WINDOW = 60 * 1000; // 1 minute in ms

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)" ],
};

export async function proxy(req: NextRequest) {
  // Rate Limiting Logic
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = (forwardedFor ? forwardedFor.split(",")[0] : null) || "127.0.0.1";
  const now = Date.now();

  const rateData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - rateData.lastReset > WINDOW) {
    rateData.count = 1;
    rateData.lastReset = now;
  } else {
    rateData.count++;
  }

  rateLimitMap.set(ip, rateData);

  if (rateData.count > LIMIT) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  // Intl + Auth Logic
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
    const target = fallback
      ? locale ? `/${locale}${fallback}` : fallback
      : locale ? `/${locale}/auth/login` : "/auth/login";
    return NextResponse.redirect(new URL(target, req.url));
  }

  return intlResponse;
}
