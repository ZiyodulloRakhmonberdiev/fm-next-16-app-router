import { Link } from "@/i18n/navigation"
import { getNewsListForLocale, type RawNewsItem } from "@/features/news/model"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import type { LocaleMap } from "@/shared/common/lib/locale-types"
import { NewsSectionHeader } from "@/shared/common/components/news-sections/news-section-header"
import { MiniNewsCard } from "@/features/news/ui/mini-news-card"

type ThemeLike = {
  _id: string
  slug: string
  name?: LocaleMap
  subtitle?: LocaleMap
  description?: LocaleMap
}

function line(map: LocaleMap | undefined, locale: AppLocale): string {
  return (map?.[locale] ?? map?.uz ?? "").trim()
}

export function ThemeSection({
  theme,
  locale,
  allNews,
  limit = 8,
}: {
  theme: ThemeLike
  locale: AppLocale
  allNews: RawNewsItem[]
  limit?: number
}) {
  const subtitle = line(theme.subtitle, locale)
  const description = line(theme.description, locale)
  const items = getNewsListForLocale(
    allNews.filter((n) => n.themeId === theme._id).slice(0, limit),
    locale
  )

  if (items.length === 0) return null

  const title = theme.name?.[locale] ?? theme.name?.uz ?? theme.slug

  return (
    <section className="w-full px-4 pt-4 md:px-6">
      <div className="rounded-lg border bg-background">
        <NewsSectionHeader
          title={
            <Link href={`/theme/${theme.slug}`} className="hover:underline">
              {title}
            </Link>
          }
          viewAllHref={`/theme/${theme.slug}`}
          variant="inline"
          linkWrap="link"
          showBrandLine
        />

        {(subtitle || description) ? (
          <div className="px-4 pb-3 -mt-1">
            {subtitle ? (
              <p className="text-sm font-medium text-foreground/80">{subtitle}</p>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-x-8 gap-y-4 p-4 md:grid-cols-2">
          {items.map((item) => (
            <MiniNewsCard key={item.slug} item={item} locale={locale} variant="row" />
          ))}
        </div>
      </div>
    </section>
  )
}

