import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ru", "uz", "uzb"],
  defaultLocale: "uz",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/category/[slug]": "/category/[slug]",
    "/news/[slug]": "/news/[slug]",
  }
})