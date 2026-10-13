import { getPublicSidebarNews } from "@/shared/server/public-data-server"
import { isAppLocale } from "@/shared/common/lib/locale-api"

// Public, locale-only response: no cookies, session or visitor-specific cache keys.
export const revalidate = 3600
export const dynamic = "force-static"

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isAppLocale(locale)) return Response.json({ error: "Not found" }, { status: 404 })
  // Eleven lets every article exclude itself while still showing ten cards.
  return Response.json(await getPublicSidebarNews(locale, undefined, 11))
}
