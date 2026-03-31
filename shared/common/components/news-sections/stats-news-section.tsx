"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Play, Volume2 } from "lucide-react";
import {
  getNewsListForLocale,
  type NewsItem,
  type RawNewsItem,
} from "@/features/news/model";
import { usePublicNewsQuery } from "@/features/news/model/public-news-query";
import {
  usePublicCategoriesQuery,
  type PublicCategory,
} from "@/features/category/model/public-categories-query";
import { NewsSectionHeader } from "./news-section-header";
import { getCategoryLabelForNewsItem } from "@/features/category/model/use-category-label";
import type { AppLocale } from "@/shared/common/lib/formatter";
import {
  formatDateISO,
  formatDateTimeDotSlash,
} from "@/shared/common/lib/formatter";
import { VideoCardMediaPreview } from "@/features/news/ui/news-listing/video-card-media-preview";

type StatsNewsSectionProps = {
  initialNews?: RawNewsItem[];
  initialCategories?: PublicCategory[];
};

const STATS_NEWS_LIMIT = 8;

function isStatsNews(item: RawNewsItem): boolean {
  return item.stats === true;
}

function hasMedia(item: RawNewsItem): boolean {
  const hasImage =
    Array.isArray(item.images) &&
    item.images.some((src) => typeof src === "string" && src.trim() !== "");
  const hasVideo = Boolean(item.videoUrl && item.videoUrl.trim());
  const hasAudio = Boolean(item.audioUrl && item.audioUrl.trim());
  return hasImage || hasVideo || hasAudio;
}

export default function StatsNewsSection({
  initialNews,
  initialCategories,
}: StatsNewsSectionProps) {
  const locale = useLocale() as AppLocale;
  const { data: qNews = [] } = usePublicNewsQuery();
  const { data: qCats = [] } = usePublicCategoriesQuery();
  const publicNews = initialNews ?? qNews;
  const categories = initialCategories ?? qCats;

  const items = React.useMemo(() => {
    const raw = [...publicNews]
      .filter(isStatsNews)
      .filter(hasMedia)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      )
      .slice(0, STATS_NEWS_LIMIT);
    return getNewsListForLocale(raw, locale);
  }, [locale, publicNews]);

  if (items.length === 0) return null;

  return (
    <section className="w-full space-y-5 px-4 pt-4 md:px-6">
      <NewsSectionHeader
        title="Maqolalar"
        viewAllHref="/articles"
        variant="brand"
      />

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item: NewsItem) => {
          const categoryLabel = getCategoryLabelForNewsItem(
            categories,
            false,
            item,
            locale,
          );
          const hasVideo = Boolean(item.videoUrl?.trim());
          const hasAudio = Boolean(item.audioUrl?.trim());
          return (
            <li key={item.slug} className="flex h-full min-w-0">
              <Link
                href={`/news/${item.slug}`}
                className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-md bg-muted/50 text-left ring-1 ring-border/60 transition-[box-shadow,transform] duration-200 hover:bg-muted/40 hover:shadow-md dark:bg-muted/25"
              >
                <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted">
                  <VideoCardMediaPreview title={item.title} item={item} />
                  {hasVideo ? (
                    <span className="pointer-events-none absolute bottom-2 left-2 z-10 inline-flex size-8 items-center justify-center rounded-full bg-brand text-foreground shadow-md ring-1 ring-black/5">
                      <Play className="size-4 fill-current text-white" />
                    </span>
                  ) : hasAudio ? (
                    <span className="pointer-events-none absolute bottom-2 left-2 z-10 inline-flex size-8 items-center justify-center rounded-full bg-brand text-white shadow-md ring-1 ring-black/5">
                      <Volume2 className="size-4" />
                    </span>
                  ) : null}
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-3 bg-foreground/5 p-4">
                  <h3 className="line-clamp-4 text-[15px] font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary md:text-base">
                    {item.title}
                  </h3>
                  <div className="mt-auto flex items-center gap-1 text-[11px] leading-relaxed text-muted-foreground md:text-xs">
                    <span className="line-clamp-1">{categoryLabel}</span>
                    <span
                      className="mx-1.5 text-muted-foreground/40"
                      aria-hidden
                    >
                      |
                    </span>
                    <time dateTime={formatDateISO(item.publishedAt)}>
                      {formatDateTimeDotSlash(item.publishedAt)}
                    </time>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
