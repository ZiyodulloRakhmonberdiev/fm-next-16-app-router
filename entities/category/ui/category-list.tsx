"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/shared/common/lib/locale-api";
import { usePublicCategoriesQuery } from "@/features/category/model/public-categories-query";
import { useTranslations } from "next-intl";

export default function CategoryList() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("common");
  const { data: categories = [] } = usePublicCategoriesQuery();
  return (
    <div className="hidden md:flex items-center gap-4 flex-wrap p-2 md:p-4">
      <Link href="/news" className="text-sm">
        <span>{t("news")}</span>
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={category.href || `/category/${category.slug}`}
          className="text-sm"
        >
          <span>{category.name[locale] ?? category.name.uz ?? category.slug}</span>
        </Link>
      ))}
      <Link href="/news/video" className="text-sm">
        <span>{t("video")}</span>
      </Link>
      <Link href="/news/audio" className="text-sm">
        <span>{t("audio")}</span>
      </Link>
    </div>
  );
}

export function CategoryListForSidebar() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("common");
  const { data: categories = [] } = usePublicCategoriesQuery();
  return (
    <div className="flex flex-col items-center py-4 justify-center gap-4 px-4">
      <Link href="/news" className="text-sm">
        <span className="text-xl font-medium">{t("news")}</span>
      </Link>
      {/* {categories.map((category) => (
        <Link
          key={category.slug}
          href={category.href || `/category/${category.slug}`}
          className="text-sm"
        >
          <span className="text-xl font-medium">{category.name[locale] ?? category.name.uz ?? category.slug}</span>
        </Link>
      ))} */}
      <Link href="/news/articles" className="text-sm">
        <span className="text-xl font-medium">{t("articles")}</span>
      </Link>
      <Link href="/news/video" className="text-sm">
        <span className="text-xl font-medium">{t("video")}</span>
      </Link>
      <Link href="/news/audio" className="text-sm">
        <span className="text-xl font-medium">{t("audio")}</span>
      </Link>
    </div>
  );
}

export function CategoryListForMobile() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("common");
  const { data: categories = [] } = usePublicCategoriesQuery();
  return (
    <div className="flex md:hidden items-center gap-4 flex-nowrap overflow-x-auto p-2 md:p-4 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <Link href="/news" className="text-sm">
        <span>{t("news")}</span>
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={category.href || `/category/${category.slug}`}
          className="text-sm"
        >
          <span>{category.name[locale] ?? category.name.uz ?? category.slug}</span>
        </Link>
      ))}
      <Link href="/news/video" className="text-sm">
        <span>{t("video")}</span>
      </Link>
    </div>
  );
}

export function CategoryListForNewsPage() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("common");
  const { data: categories = [] } = usePublicCategoriesQuery();
  return (
    <div className="flex flex-col items-start py-4 justify-start gap-4 px-4">
      <Link href="/news" className="text-sm">
        <span className="text-lg font-medium">{t("news")}</span>
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={category.href || `/category/${category.slug}`}
          className="text-sm"
        >
          <span className="text-lg font-medium">{category.name[locale] ?? category.name.uz ?? category.slug}</span>
        </Link>
      ))}
      <Link href="/news/video" className="text-sm">
        <span className="text-lg font-medium">{t("video")}</span>
      </Link>
    </div>
  );
}