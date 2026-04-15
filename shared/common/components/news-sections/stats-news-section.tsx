"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
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
import ArticleNewsCard from "@/entities/news/cards/article-news-card";

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
  const t = useTranslations("common");
  const { data: qNews = [] } = usePublicNewsQuery();
  const { data: qCats = [], isPending: categoriesPending } = usePublicCategoriesQuery();
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
    <section className="w-full space-y-5 px-4 py-4 md:px-6">
      <NewsSectionHeader
        title={t("articles")}
        viewAllHref="/articles"
        variant="brand"
      />

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item: NewsItem) => {
          const categoryLabel = getCategoryLabelForNewsItem(
            categories,
            categoriesPending,
            item,
            locale,
          );
          return (
            <ArticleNewsCard
              key={item.slug}
              item={item}
              showCategory
              categoryLabel={categoryLabel}
              className="bg-muted dark:bg-card/80"
            />
          );
        })}
      </ul>
    </section>
  );
}
