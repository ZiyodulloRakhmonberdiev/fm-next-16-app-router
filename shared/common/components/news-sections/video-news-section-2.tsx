"use client";

import * as React from "react";
import {
  getNewsListForLocale,
  isVideoRawNews,
  type NewsItem,
  type RawNewsItem,
} from "@/features/news/model";
import { usePublicNewsQuery } from "@/features/news/model/public-news-query";
import {
  formatDateISO,
  formatDateTimeDotSlash,
  type AppLocale,
} from "@/shared/common/lib/formatter";
import { useLocale, useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { VideoNewsModal } from "@/shared/common/components/molecules";
import { NewsSectionHeader } from "@/shared/common/components/news-sections/news-section-header";
import { usePublicCategoriesQuery } from "@/features/category/model/public-categories-query";
import { getCategoryLabelForNewsItem } from "@/features/category/model/use-category-label";
import { VideoCardMediaPreview } from "@/features/news/ui/news-listing/video-card-media-preview";
import type { PublicCategory } from "@/features/category/model/public-categories-query";

type VideoNewsSection2Props = {
  initialNews?: RawNewsItem[];
  initialCategories?: PublicCategory[];
};

const VIDEO_NEWS_LIMIT = 8;

export default function VideoNewsSection2({
  initialNews,
  initialCategories,
}: VideoNewsSection2Props) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("common");
  const { data: qNews = [] } = usePublicNewsQuery();
  const { data: qCats = [] } = usePublicCategoriesQuery();

  const publicNews = initialNews ?? qNews;
  const categories = initialCategories ?? qCats;
  const [selected, setSelected] = React.useState<NewsItem | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const items = React.useMemo(() => {
    const raw = [...publicNews]
      .filter(isVideoRawNews)
      // Poster bo'lmasa ham card ko'rinishi kerak — faqat videoUrl bo'lmaganlarni chiqarib yuboramiz.
      .filter((n) => Boolean((n as RawNewsItem).videoUrl))
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      )
      .slice(0, VIDEO_NEWS_LIMIT);
    return getNewsListForLocale(raw, locale);
  }, [locale, publicNews]);

  const handleOpenVideo = (item: NewsItem) => {
    if (!item.videoUrl) return;
    setSelected(item);
    setIsOpen(true);
  };

  if (items.length === 0) return null;

  return (
    <section className="w-full space-y-5 px-4 pt-4 md:px-6">
      <NewsSectionHeader
        title={t("video_news")}
        viewAllHref="/news/video"
        variant="brand"
      />

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const categoryLabel = getCategoryLabelForNewsItem(
            categories,
            false, // isPending not relevant with initial data or already fetched query data
            item,
            locale,
          );
          const metaLine = formatDateTimeDotSlash(item.publishedAt);
          return (
            <li key={item.slug} className="flex h-full min-w-0">
              <button
                type="button"
                className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-md bg-muted/50 text-left ring-1 ring-border/60 transition-[box-shadow,transform] duration-200 hover:bg-muted/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-muted/25"
                onClick={() => handleOpenVideo(item)}
              >
                <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted">
                  <VideoCardMediaPreview title={item.title} item={item} />
                  <span
                    className="pointer-events-none absolute bottom-2 left-2 z-10 inline-flex size-8 items-center justify-center rounded-full bg-brand text-foreground shadow-md ring-1 ring-black/5"
                    aria-hidden
                  >
                    <Play className="size-4 fill-current text-white" />
                  </span>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 bg-brand/5 dark:bg-card">
                  <h3 className="line-clamp-4 text-[15px] font-bold leading-snug tracking-tight text-foreground md:text-base">
                    {item.title}
                  </h3>
                  <div className="mt-auto text-[11px] leading-relaxed text-muted-foreground md:text-xs flex items-center gap-1">
                    <span className="line-clamp-1">{categoryLabel}</span>
                    <span
                      className="mx-1.5 text-muted-foreground/40"
                      aria-hidden
                    >
                      |
                    </span>
                    <time dateTime={formatDateISO(item.publishedAt)}>
                      {metaLine}
                    </time>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <VideoNewsModal
        item={selected}
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setSelected(null);
        }}
      />
    </section>
  );
}
