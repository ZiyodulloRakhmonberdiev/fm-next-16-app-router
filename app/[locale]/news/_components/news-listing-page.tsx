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
  params.set("limit", "4")
  for (const slug of categorySlugs ?? []) {
    if (slug) params.append("category", slug)
  }
  for (const id of themeIds ?? []) {
    if (id) params.append("theme", id)
  }
  const res = await fetch(`${origin}/api/news?${params.toString()}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    return { items: [], page: 1, totalPages: 1 }
  }
  const json = (await res.json()) as NewsListResponse
  const raw = Array.isArray(json.data) ? json.data.map(normalizeRaw) : []
  return {
    items: getNewsListForLocale(raw, locale),
    page: Number(json.meta?.page ?? 1),
    totalPages: Math.max(1, Number(json.meta?.totalPages ?? 1)),
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
              />
            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}

