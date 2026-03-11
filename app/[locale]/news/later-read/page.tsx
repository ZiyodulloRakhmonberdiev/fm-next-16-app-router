import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"

export default async function LaterReadNewsPage() {
  const locale = await getLocale()
  redirect(`/${locale}/news/saved`)
}
