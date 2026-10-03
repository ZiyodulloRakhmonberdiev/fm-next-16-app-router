import { setPageLocale, type LocalePageProps } from "@/i18n/set-page-locale"
import { redirect } from "@/i18n/navigation"
import { getLocale } from "next-intl/server"

export default async function ContactUsAliasPage({ params }: LocalePageProps) {
  setPageLocale((await params).locale)
  const locale = await getLocale()
  redirect({ href: "/contact", locale })
}
