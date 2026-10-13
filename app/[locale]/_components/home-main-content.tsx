import { getLocale } from "next-intl/server";
import TopNewsCarousel from "@/shared/common/components/news-sections/top-news-carousel";
import AuthorsChoice from "@/shared/common/components/news-sections/authors-choice";
import LatestNews from "@/entities/news/lists/latest-news";
import { selectSidebarNews } from "@/features/news/lib/sidebar-news";
import { isImageTypeRawNews } from "@/features/news/model/types";
import { ServerUnavailable } from "@/shared/common/components/molecules";
import { publicCardPayload } from "@/features/news/lib/public-card-payload";
import { selectHomeNews } from "@/features/news/lib/home-news-selection";
import {
  BannerSection,
  BreakingSection,
  AdNewsSection,
  HeaderNewsCarousel,
  SlideNewsSection,
  StatsNewsSection,
  ThemeSection,
  ThemesTopScroller,
} from "@/shared/common/components/news-sections";
import RowSection from "@/shared/common/components/news-sections/row-section";
import VideoNewsSection2 from "@/shared/common/components/news-sections/video-news-section-2";
import {
  getCachedPublicAdNews,
  getCachedPublicNews,
  getCachedPublicCategories,
  getCachedPublicStatsNews,
  getCachedPublicThemes,
} from "@/shared/server/public-data-server";
import type { AppLocale } from "@/shared/common/lib/locale-api";
import HomePublicDataProvider from "./home-public-data-provider";

export default async function HomeMainContent() {
  const [publicNews, adNews, statsNews, categories, themes] = await Promise.all([
    getCachedPublicNews(),
    getCachedPublicAdNews(),
    getCachedPublicStatsNews(),
    getCachedPublicCategories(),
    getCachedPublicThemes(),
  ]);
  const locale = (await getLocale()) as AppLocale;

  if (!publicNews || !categories) {
    return <ServerUnavailable />;
  }

  if (publicNews.length === 0) {
    return null;
  }
  // Reuse the same localized records across section props so RSC can deduplicate them.
  const publicCards = publicCardPayload(publicNews, locale);
  const adCards = publicCardPayload(adNews, locale);
  const statsCards = publicCardPayload(statsNews, locale);

  // Top scroller shows all active themes (themes API is active-only for public).
  const featuredThemes = themes.filter((theme: any) =>
    Boolean(theme.showInHomeList ?? theme.showInHomePage),
  );

  let themeCursor = 0;
  const renderNextTheme = () => {
    const theme = featuredThemes[themeCursor];
    if (!theme) return null;
    themeCursor += 1;
    return (
      <ThemeSection
        key={`theme-slot-${theme._id}`}
        theme={theme}
        locale={locale}
        allNews={publicCards.filter((item) => item.themeId === theme._id).slice(0, 8)}
        limit={8}
      />
    );
  };

  return (
    <HomePublicDataProvider categories={categories}>
      <ThemesTopScroller themes={themes} locale={locale} />
      <HeaderNewsCarousel initialNews={selectHomeNews(publicCards, "header")} />
      {publicNews.some(isImageTypeRawNews) ? (
        <div className="w-full flex flex-col lg:flex-row gap-4 px-4 md:px-6 lg:items-stretch">
          <div className="flex flex-col gap-4 lg:max-w-[72%]">
            <TopNewsCarousel initialNews={selectHomeNews(publicCards, "top")} />
            <AuthorsChoice initialNews={selectHomeNews(publicCards, "authors")} />
          </div>
          <LatestNews items={selectSidebarNews(publicNews, locale)} />
        </div>
      ) : null}
      <BannerSection
        categorySlug="uzbekistan"
        initialNews={selectHomeNews(publicCards, "banner", "uzbekistan")}
        initialCategories={categories}
      />
      <SlideNewsSection
        categorySlug="innovation"
        initialNews={selectHomeNews(publicCards, "slide", "innovation")}
        initialCategories={categories}
      />
      <RowSection
        categorySlug="digital-economy"
        initialNews={selectHomeNews(publicCards, "row", "digital-economy")}
        initialCategories={categories}
      />
      <SlideNewsSection
        categorySlug="corruption"
        initialNews={selectHomeNews(publicCards, "slide", "corruption")}
        initialCategories={categories}
      />

      <StatsNewsSection
        initialNews={selectHomeNews(statsCards, "stats")}
        initialCategories={categories}
      />

      <BreakingSection
        initialNews={selectHomeNews(publicCards, "breaking")}
        initialCategories={categories}
      />
      <RowSection
        categorySlug="medicine"
        initialNews={selectHomeNews(publicCards, "row", "medicine")}
        initialCategories={categories}
      />
      <SlideNewsSection
        categorySlug="world"
        initialNews={selectHomeNews(publicCards, "slide", "world")}
        initialCategories={categories}
      />
      {renderNextTheme()}
      <BannerSection
        categorySlug="politics"
        featuredPosition="left"
        initialNews={selectHomeNews(publicCards, "banner", "politics")}
        initialCategories={categories}
      />
      <VideoNewsSection2
        initialNews={selectHomeNews(publicCards, "video")}
        initialCategories={categories}
      />
      <RowSection
        categorySlug="bankers-diary"
        initialNews={selectHomeNews(publicCards, "row", "bankers-diary")}
        initialCategories={categories}
      />
      <SlideNewsSection
        categorySlug="education"
        initialNews={selectHomeNews(publicCards, "slide", "education")}
        initialCategories={categories}
      />
      <BannerSection
        categorySlug="judiciary"
        initialNews={selectHomeNews(publicCards, "banner", "judiciary")}
        initialCategories={categories}
      />
      <AdNewsSection initialNews={selectHomeNews(adCards, "ads")} />
      {renderNextTheme()}
      <RowSection
        categorySlug="sports"
        initialNews={selectHomeNews(publicCards, "row", "sports")}
        initialCategories={categories}
      />
      <RowSection
        categorySlug="society"
        initialNews={selectHomeNews(publicCards, "row", "society")}
        initialCategories={categories}
      />
    </HomePublicDataProvider>
  );
}
