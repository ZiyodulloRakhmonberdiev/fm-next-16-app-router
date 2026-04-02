import { Link } from "@/i18n/navigation";
import { getNewsListForLocale, type RawNewsItem } from "@/features/news/model";
import type { AppLocale } from "@/shared/common/lib/locale-api";
import type { LocaleMap } from "@/shared/common/lib/locale-types";
import { NewsSectionHeader } from "@/shared/common/components/news-sections/news-section-header";
import { MiniNewsCard } from "@/features/news/ui/mini-news-card";
import Image from "next/image";

type ThemeLike = {
  _id: string;
  slug: string;
  name?: LocaleMap;
  subtitle?: LocaleMap;
  description?: LocaleMap;
  imageUrl?: string;
};

function line(map: LocaleMap | undefined, locale: AppLocale): string {
  if (!map) return "";
  const order: AppLocale[] = [locale, "uz", "uzb", "ru", "en"];
  for (const loc of order) {
    const value = (map[loc] ?? "").trim();
    if (value) return value;
  }
  return "";
}

export function ThemeSection({
  theme,
  locale,
  allNews,
  limit = 8,
}: {
  theme: ThemeLike;
  locale: AppLocale;
  allNews: RawNewsItem[];
  limit?: number;
}) {
  const subtitle = line(theme.subtitle, locale);
  const description = line(theme.description, locale);
  const items = getNewsListForLocale(
    allNews.filter((n) => n.themeId === theme._id).slice(0, limit),
    locale,
  );

  if (items.length === 0) return null;

  const title = theme.name?.[locale] ?? theme.name?.uz ?? theme.slug;

  return (
    <section className="w-full px-4 pt-4 md:px-6">
      <div className="">
        <NewsSectionHeader
        className="border-none pb-0 mb-0"
          title={
            subtitle || description ? (
              <div className="md:px-4 md:py-3 max-w-4xl">
                <div className="flex items-center gap-3">
                  {theme.imageUrl ? (
                    <div className="hidden md:block relative mt-0.5 size-12 md:size-20 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border">
                      <Image
                        src={theme.imageUrl}
                        alt={title}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0">
                    {subtitle ? (
                      <p className="text-2xl font-bold">{subtitle}</p>
                    ) : null}
                    {description ? (
                      <p className="hidden md:block mt-1 text-sm text-muted-foreground">
                        {description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null
          }
          viewAllHref={`/theme/${theme.slug}`}
          linkWrap="onlyDesktop"
        />

        {/* <Link href={`/theme/${theme.slug}`} className="hover:underline">
          {title}
        </Link> */}

        <div className="grid grid-cols-1 md:gap-x-8 gap-y-4 mt-4 md:p-4 md:grid-cols-2">
          {items.map((item) => (
            <MiniNewsCard
              key={item.slug}
              item={item}
              locale={locale}
              variant="row"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
