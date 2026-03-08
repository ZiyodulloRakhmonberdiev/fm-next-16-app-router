/**
 * Backend 4 tilda (en, ru, uz, uzb) ma'lumot qaytaradi.
 * Brauzerda tanlangan til — next-intl [locale] (URL dagi).
 * Fetch qilishda har doim locale ni yuboring.
 */

export type AppLocale = "en" | "ru" | "uz" | "uzb"

const LOCALES: AppLocale[] = ["en", "ru", "uz", "uzb"]

export function isAppLocale(locale: string): locale is AppLocale {
  return LOCALES.includes(locale as AppLocale)
}

/**
 * Backend dan locale bo‘yicha ma'lumot olish.
 * Masalan: news, categories, tags, siteConfig.
 *
 * @example
 * const news = await fetchLocaleJson<NewsItem>(`${API_URL}/news/${slug}`, locale)
 * const config = await fetchLocaleJson<SiteConfig>(`${API_URL}/config`, locale)
 */
export async function fetchLocaleJson<T>(
  url: string,
  locale: AppLocale,
  init?: RequestInit
): Promise<T> {
  const parsed = new URL(url)
  parsed.searchParams.set("locale", locale)
  const res = await fetch(parsed.toString(), {
    ...init,
    headers: {
      "Accept-Language": locale,
      ...init?.headers,
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.url}`)
  return res.json() as Promise<T>
}
