import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

export const proxy = createMiddleware(routing);
