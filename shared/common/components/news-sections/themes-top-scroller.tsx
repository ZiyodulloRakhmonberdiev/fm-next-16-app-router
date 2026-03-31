import { Link } from "@/i18n/navigation"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import type { LocaleMap } from "@/shared/common/lib/locale-types"

type ThemeLike = {
  _id: string
  slug: string
  name?: LocaleMap
}

export function ThemesTopScroller({
  themes,
  locale,
}: {
  themes: ThemeLike[]
  locale: AppLocale
}) {
  if (!themes || themes.length === 0) return null

  return (
    <section className="px-4 md:px-6 pt-2 pb-1">
      <div className="flex items-center justify-between gap-4 border-b pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {themes.map((theme) => (
          <Link
            key={theme._id}
            href={`/theme/${theme.slug}`}
            className="shrink-0 rounded-full bg-background px-4 py-1.5 text-xs md:text-md font-medium flex items-center gap-3 border md:border-none"
          >
            <span className="hidden md:block size-2 shrink-0 bg-foreground/50 rounded-full" />
            <span>{theme.name?.[locale] ?? theme.name?.uz ?? theme.slug}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

