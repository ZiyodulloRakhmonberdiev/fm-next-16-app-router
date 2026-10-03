import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { isAppLocale } from "@/shared/common/lib/locale-api"

export type LocalePageProps = { params: Promise<{ locale: string }> }

// Call before translations in each public page/metadata function: Next can render
// layouts and pages independently. Never replace request headers with empty values.
export function setPageLocale(locale: string) {
  if (!isAppLocale(locale)) notFound()
  setRequestLocale(locale)
  return locale
}
