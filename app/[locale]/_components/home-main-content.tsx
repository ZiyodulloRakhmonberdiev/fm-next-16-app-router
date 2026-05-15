import { getLocale } from "next-intl/server";
import { TopBanner } from "@/shared/common/components/organisms";
import { ServerUnavailable } from "@/shared/common/components/molecules";
import { sortCategoriesByPriority } from "@/features/category/lib/category-utils";
import {
  BannerSection,
  BreakingSection,
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

  if (publicNews.length === 0) {
    return null;
  }
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
        allNews={publicNews}
        limit={8}
      />
    );
  };

  return (
    <>
      <ThemesTopScroller themes={themes} locale={locale} />
      <HeaderNewsCarousel initialNews={publicNews} />
      <TopBanner />
      {/* first category */}
      <BannerSection
        categorySlug="uzbekistan"
        initialNews={publicNews}
        initialCategories={categories}
      />
      {/* second category */}
      <SlideNewsSection
        categorySlug="innovation"
        initialNews={publicNews}
        initialCategories={categories}
      />
      {/* third category */}
      <RowSection
        categorySlug="digital-economy"
        initialNews={publicNews}
        initialCategories={categories}
      />
      {/* fourth category */}
      <SlideNewsSection
        categorySlug="corruption"
        initialNews={publicNews}
        initialCategories={categories}
      />

      <StatsNewsSection
        initialNews={statsNews}
        initialCategories={categories}
      />
      {/* <TextNewsSection
        initialNews={publicNews}
        initialCategories={categories}
      /> */}
      {/* {renderNextTheme()} */}

      {/* <div className="px-4 md:px-6 py-4">
        <AdSlot placement="home_bottom_full" />
      </div> */}

      <BreakingSection
        initialNews={publicNews}
        initialCategories={categories}
      />
      {/* fifth category */}
      <RowSection
        categorySlug="medicine"
        initialNews={publicNews}
        initialCategories={categories}
      />
      {/* sixth category */}
      <SlideNewsSection
        categorySlug="world"
        initialNews={publicNews}
        initialCategories={categories}
      />
      {renderNextTheme()}
      {/* seventh category */}
      <BannerSection
        categorySlug="politics"
        featuredPosition="left"
        initialNews={publicNews}
        initialCategories={categories}
      />
      <VideoNewsSection2
        initialNews={publicNews}
        initialCategories={categories}
      />
      {/* eighth category */}
      <RowSection
        categorySlug="bankers-diary"
        initialNews={publicNews}
        initialCategories={categories}
      />

      {/* {featuredThemes.slice(themeCursor).map((theme: any) => (
        <ThemeSection
          key={theme._id}
          theme={theme}
          locale={locale}
          allNews={publicNews}
          limit={8}
        />
      ))} */}
      {/* ninth category */}
      <SlideNewsSection
        categorySlug="education"
        initialNews={publicNews}
        initialCategories={categories}
      />
      {/* tenth category */}
      <BannerSection
        categorySlug="judiciary"
        initialNews={publicNews}
        initialCategories={categories}
      />
      <AdNewsSection initialNews={adNews} />
      {renderNextTheme()}
      {/* eleventh category */}
      <RowSection
        categorySlug="sports"
        initialNews={publicNews}
        initialCategories={categories}
      />
      {/* twelfth category */}
      <RowSection
        categorySlug="society"
        initialNews={publicNews}
        initialCategories={categories}
      />
    </>
  );
}
