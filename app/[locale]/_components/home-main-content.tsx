import * as React from "react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { StayConnected, TopBanner } from "@/shared/common/components/organisms";
import { ServerUnavailable } from "@/shared/common/components/molecules";
import { sortCategoriesByPriority } from "@/features/category/lib/category-utils";
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
  ThemeSection,
  ThemesTopScroller,
} from "@/shared/common/components/news-sections";
import RowSection from "@/shared/common/components/news-sections/row-section";
import VideoNewsSection2 from "@/shared/common/components/news-sections/video-news-section-2";
import { AdSlot } from "@/features/ads/ui/ad-slot";
import {
  getCachedPublicAdNews,
  getCachedPublicNews,
  getCachedPublicCategories,
  getCachedPublicStatsNews,
  getCachedPublicThemes,
} from "@/shared/server/public-data-server";
import type { AppLocale } from "@/shared/common/lib/locale-api";

export default async function HomeMainContent() {
  const publicNews = await getCachedPublicNews();
  const adNews = await getCachedPublicAdNews();
  const statsNews = await getCachedPublicStatsNews();
  const categories = await getCachedPublicCategories();
  const themes = await getCachedPublicThemes();
  const locale = (await getLocale()) as AppLocale;

  if (!publicNews || !categories) {
    return <ServerUnavailable />;
  }

  const categoriesByPriority = sortCategoriesByPriority(categories);

  const firstCategorySlug = categoriesByPriority[0]?.slug ?? "politics";
  const secondCategorySlug =
    categoriesByPriority[1]?.slug ?? categoriesByPriority[0]?.slug ?? "society";
  const thirdCategorySlug =
    categoriesByPriority[2]?.slug ??
    categoriesByPriority[1]?.slug ??
    categoriesByPriority[0]?.slug ??
    "uzbekistan";
  const fourthCategorySlug =
    categoriesByPriority[3]?.slug ??
    categoriesByPriority[2]?.slug ??
    categoriesByPriority[1]?.slug ??
    categoriesByPriority[0]?.slug ??
    "world";

  const fifthCategorySlug = categoriesByPriority[4]?.slug ?? "rights";

  const sixthCategorySlug = categoriesByPriority[5]?.slug ?? "economy";
  const seventhCategorySlug = categoriesByPriority[6]?.slug ?? "health";
  const eighthCategorySlug = categoriesByPriority[7]?.slug ?? "science";
  const ninthCategorySlug = categoriesByPriority[8]?.slug ?? "technology";
  const tenthCategorySlug = categoriesByPriority[9]?.slug ?? "sports";

  if (publicNews.length === 0) {
    return null;
  }

  const getSafeImageSrc = (raw?: string) => {
    if (!raw?.trim()) return "";
    const candidate =
      raw.startsWith("http://") ||
        raw.startsWith("https://") ||
        raw.startsWith("/")
        ? raw
        : `/uploads/images/${raw}`;
    try {
      new URL(candidate, "http://localhost");
      return candidate;
    } catch {
      return "";
    }
  };

  // Top scroller shows all active themes (themes API is active-only for public).
  const featuredThemes = themes.filter((theme: any) =>
    Boolean(theme.showInHomeList ?? theme.showInHomePage),
  );

  return (
    <>
      <ThemesTopScroller themes={themes} locale={locale} />
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
      <StatsNewsSection
        initialNews={statsNews}
        initialCategories={categories}
      />
      <VideoNewsSection2
        initialNews={publicNews}
        initialCategories={categories}
      />
      {/* <div className="px-4 md:px-6 py-4">
        <AdSlot placement="home_bottom_full" />
      </div> */}

      <AdNewsSection initialNews={adNews} />
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
      {featuredThemes.map((theme: any) => (
        <ThemeSection
          key={theme._id}
          theme={theme}
          locale={locale}
          allNews={publicNews}
          limit={8}
        />
      ))}
      <RowSection
        categorySlug={thirdCategorySlug}
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
  );
}
