import * as React from "react"
import { getLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import {
  StayConnected,
  TopBanner,
} from "@/shared/common/components/organisms"
import { ServerUnavailable } from "@/shared/common/components/molecules"
import {
  sortCategoriesByPriority,
} from "@/features/category/lib/category-utils"
import {
  AdsShowcaseSection,
  BannerSection,
  BreakingSection,
  ColumnSection,
  AdNewsSection,
  HeaderNewsCarousel,
  SlideNewsSection,
  StatsNewsSection,
  TextNewsSection,
} from "@/shared/common/components/news-sections"
import RowSection from "@/shared/common/components/news-sections/row-section"
import VideoNewsSection2 from "@/shared/common/components/news-sections/video-news-section-2"
import { AdSlot } from "@/features/ads/ui/ad-slot"
import {
  getCachedPublicAdNews,
  getCachedPublicNews,
  getCachedPublicCategories,
  getCachedPublicStatsNews,
  getCachedPublicThemes,
} from "@/shared/server/public-data-server"
import type { AppLocale } from "@/shared/common/lib/locale-api"

export default async function HomeMainContent() {
  const publicNews = await getCachedPublicNews()
  const adNews = await getCachedPublicAdNews()
  const statsNews = await getCachedPublicStatsNews()
  const categories = await getCachedPublicCategories()
  const themes = await getCachedPublicThemes()
  const locale = (await getLocale()) as AppLocale

  if (!publicNews || !categories) {
    return <ServerUnavailable />
  }

  const categoriesByPriority = sortCategoriesByPriority(categories)

  const firstCategorySlug = categoriesByPriority[0]?.slug ?? "politics"
  const secondCategorySlug =
    categoriesByPriority[1]?.slug ?? categoriesByPriority[0]?.slug ?? "society"
  const thirdCategorySlug =
    categoriesByPriority[2]?.slug ??
    categoriesByPriority[1]?.slug ??
    categoriesByPriority[0]?.slug ??
    "uzbekistan"
  const fourthCategorySlug =
    categoriesByPriority[3]?.slug ??
    categoriesByPriority[2]?.slug ??
    categoriesByPriority[1]?.slug ??
    categoriesByPriority[0]?.slug ??
    "world"

  const fifthCategorySlug =
    categoriesByPriority[4]?.slug ??
    "rights"

  const sixthCategorySlug =
    categoriesByPriority[5]?.slug ??
    "economy"
  const seventhCategorySlug =
    categoriesByPriority[6]?.slug ??
    "health"
  const eighthCategorySlug =
    categoriesByPriority[7]?.slug ??
    "science"
  const ninthCategorySlug =
    categoriesByPriority[8]?.slug ??
    "technology"
  const tenthCategorySlug =
    categoriesByPriority[9]?.slug ??
    "sports"

  if (publicNews.length === 0) {
    return null
  }

  const getSafeImageSrc = (raw?: string) => {
    if (!raw?.trim()) return ""
    const candidate =
      raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")
        ? raw
        : `/uploads/images/${raw}`
    try {
      new URL(candidate, "http://localhost")
      return candidate
    } catch {
      return ""
    }
  }

  const featuredThemes = themes.filter((theme: any) => Boolean(theme.showInHomePage))

  return (
    <>
      {themes.length > 0 ? (
        <section className="px-4 md:px-6 pt-2 pb-1">
          <div className="flex items-center justify-between gap-4 border-b pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {themes.map((theme: { _id: string; slug: string; name?: Record<string, string> }) => (
              <Link
                key={theme._id}
                href={`/theme/${theme.slug}`}
                className="shrink-0 rounded-full bg-background px-3 py-1.5 text-md font-medium flex items-center gap-3"
              >
                <span className="block size-2 shrink-0 bg-foreground/50 rounded-full"></span>
                <span>
                  {theme.name?.[locale] ?? theme.name?.uz ?? theme.slug}

                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <HeaderNewsCarousel initialNews={publicNews} />
      <TopBanner />
      <BannerSection
        categorySlug={firstCategorySlug}
        featuredPosition="right"
        initialNews={publicNews}
        initialCategories={categories}
      />
      <SlideNewsSection
        categorySlug={fourthCategorySlug}
        initialNews={publicNews}
        initialCategories={categories}
      />
      <BreakingSection
        initialNews={publicNews}
        initialCategories={categories}
      />
      <BannerSection
        categorySlug={secondCategorySlug}
        featuredPosition="left"
        initialNews={publicNews}
        initialCategories={categories}
      />
      <TextNewsSection
        initialNews={publicNews}
        initialCategories={categories}
      />
      {featuredThemes.map((theme: any) => {
        const themeSubtitle = (theme.subtitle?.[locale] ?? theme.subtitle?.uz ?? "").trim()
        const themeDescription = (theme.description?.[locale] ?? theme.description?.uz ?? "").trim()
        const items = publicNews
          .filter((n: any) => n.themeId === theme._id)
          .slice(0, 8)
        if (items.length < 1) return null

        return (
          <section key={theme._id} className="px-4 py-4 md:px-6">
            <div className="mb-3 border-b pb-2">
              <Link href={`/theme/${theme.slug}`} className="text-xl font-semibold hover:underline">
                {theme.name?.[locale] ?? theme.name?.uz ?? theme.slug}
              </Link>
              {themeSubtitle ? (
                <p className="mt-1 text-sm font-medium text-foreground/80">{themeSubtitle}</p>
              ) : null}
              {themeDescription ? (
                <p className="mt-1 text-sm text-muted-foreground">{themeDescription}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {items.map((item: any) => {
                const title =
                  item.title?.[locale] ||
                  item.title?.uz ||
                  item.slug
                const desc =
                  item.description?.[locale] ||
                  item.description?.uz ||
                  ""
                const image = getSafeImageSrc(item.images?.[0])
                return (
                  <Link
                    key={item.slug}
                    href={`/news/${item.slug}`}
                    className="group grid grid-cols-[120px_1fr] gap-3 rounded-sm border p-2 hover:bg-muted/40"
                  >
                    <div className="h-[86px] overflow-hidden rounded-sm bg-muted">
                      {image ? (
                        <img src={image} alt={title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-semibold transition-colors group-hover:text-primary">
                        {title}
                      </h3>
                      {desc ? (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{desc}</p>
                      ) : null}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}
      <StatsNewsSection initialNews={statsNews} initialCategories={categories} />
      <AdNewsSection initialNews={adNews} />
      <VideoNewsSection2
        initialNews={publicNews}
        initialCategories={categories}
      />
      <div className="px-4 md:px-6 py-4">
        <AdSlot placement="home_bottom_full" />
      </div>
      <RowSection
        categorySlug={thirdCategorySlug}
        initialNews={publicNews}
        initialCategories={categories}
      />
      <SlideNewsSection
        categorySlug={fifthCategorySlug}
        initialNews={publicNews}
        initialCategories={categories}
      />
      <ColumnSection
        categorySlug={sixthCategorySlug}
        initialNews={publicNews}
        initialCategories={categories}
      />
      <RowSection
        categorySlug={seventhCategorySlug}
        initialNews={publicNews}
        initialCategories={categories}
      />
      <BannerSection
        categorySlug={eighthCategorySlug}
        featuredPosition="right"
        initialNews={publicNews}
        initialCategories={categories}
      />
      <SlideNewsSection
        categorySlug={ninthCategorySlug}
        initialNews={publicNews}
        initialCategories={categories}
      />
      <ColumnSection
        categorySlug={tenthCategorySlug}
        initialNews={publicNews}
        initialCategories={categories}
      />
    </>
  )
}
