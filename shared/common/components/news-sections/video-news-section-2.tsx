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
  type AppLocale,
} from "@/shared/common/lib/formatter";
import { useLocale, useTranslations } from "next-intl";
import { VideoNewsModal } from "@/shared/common/components/molecules";
import { NewsSectionHeader } from "@/shared/common/components/news-sections/news-section-header";
import { usePublicCategoriesQuery } from "@/features/category/model/public-categories-query";
import { getCategoryLabelForNewsItem } from "@/features/category/model/use-category-label";
import type { PublicCategory } from "@/features/category/model/public-categories-query";
import VideoNewsCard from "@/entities/news/cards/video-news-card";

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
  const { data: qCats = [], isPending: categoriesPending } = usePublicCategoriesQuery();

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
            categoriesPending,
            item,
            locale,
          );
          return (
            <VideoNewsCard
              key={item.slug}
              item={item}
              showCategory
              showPublishedAt
              categoryLabel={categoryLabel}
              onOpenVideo={handleOpenVideo}
            />
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
