import { Footer } from "@/widgets/client-footer"
import { Header } from "@/widgets/client-header"
import { ClientSidebar } from "@/widgets/client-sidebar"
import ClientSiteNothingGate from "../../_components/client-site-nothing-gate"
import ClientServerOffGate from "../../_components/client-server-off-gate"
import { NewsListingPageContent } from "@/features/news/ui/news-listing-page-content"
import type { NewsListingVariant } from "@/features/news/ui/news-listing-page-content"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { getNewsListForLocale, type RawNewsItem } from "@/features/news/model"
import { headers } from "next/headers"

type NewsListResponse = {
  data: Array<
    Omit<RawNewsItem, "publishedAt" | "createdAt" | "updatedAt"> & {
      publishedAt: string | Date
      createdAt?: string | Date
      updatedAt?: string | Date
    }
  >
  meta?: { page: number; limit: number; totalPages: number }
}

function toDate(value?: string | Date): Date | undefined {
  if (!value) return undefined
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function normalizeRaw(item: NewsListResponse["data"][number]): RawNewsItem {
  return {
    ...(item as any),
    publishedAt: toDate(item.publishedAt) ?? new Date(0),
    createdAt: toDate(item.createdAt),
    updatedAt: toDate(item.updatedAt),
  }
}

async function fetchInitial(
  locale: AppLocale,
  variant: NewsListingVariant,
  categorySlugs?: string[],
  themeIds?: string[]
) {
  const sortBy = variant === "trending" ? "views" : "publishedAt"
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? "http"
  const origin = `${proto}://${host}`
  const params = new URLSearchParams()
  params.set("status", "published")
  params.set("sortBy", sortBy)
  params.set("page", "1")
  params.set("limit", "10")
  params.set("locale", locale)
  for (const slug of categorySlugs ?? []) {
    if (slug) params.append("category", slug)
  }
  for (const id of themeIds ?? []) {
    if (id) params.append("theme", id)
  }
  const params2 = new URLSearchParams(params)
  params2.set("page", "2")
  const [res1, res2] = await Promise.all([
    fetch(`${origin}/api/news?${params.toString()}`, { next: { revalidate: 60 } }),
    fetch(`${origin}/api/news?${params2.toString()}`, { next: { revalidate: 60 } }),
  ])
  if (!res1.ok) {
    return { items: [], page: 1, totalPages: 1 }
  }
  const json1 = (await res1.json()) as NewsListResponse
  const json2 = res2.ok ? ((await res2.json()) as NewsListResponse) : null
  const raw1 = Array.isArray(json1.data) ? json1.data.map(normalizeRaw) : []
  const raw2 = Array.isArray(json2?.data) ? json2.data.map(normalizeRaw) : []
  const raw = [...raw1, ...raw2].filter(
    (item, idx, arr) => arr.findIndex((x) => x.slug === item.slug) === idx
  )
  const totalPages = Math.max(1, Number(json1.meta?.totalPages ?? 1))
  return {
    items: getNewsListForLocale(raw, locale),
    page: totalPages >= 2 ? 2 : 1,
    totalPages,
  }
}

export async function NewsListingPage({
  locale,
  variant = "latest",
  initialCategorySlug,
  initialThemeId,
}: {
  locale: AppLocale
  variant?: NewsListingVariant
  initialCategorySlug?: string
  initialThemeId?: string
}) {
  const categorySlugs = initialCategorySlug ? [initialCategorySlug] : undefined
  const themeIds = initialThemeId ? [initialThemeId] : undefined
  const initial = await fetchInitial(locale, variant, categorySlugs, themeIds)
  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1">
          <ClientServerOffGate model="news">
            <div className="max-w-7xl mx-auto">
              <NewsListingPageContent
                variant={variant}
                initial={initial}
                initialCategorySlug={initialCategorySlug}
                initialThemeId={initialThemeId}
                pageSize={10}
              />
            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}

