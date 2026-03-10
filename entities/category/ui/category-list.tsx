"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/shared/common/lib/locale-api";
import { usePublicCategoriesQuery } from "@/features/category/model/public-categories-query";

export default function CategoryList() {
  const locale = useLocale() as AppLocale;
  const { data: categories = [] } = usePublicCategoriesQuery();
  return (
    <div className="hidden md:flex items-center gap-4 flex-wrap p-2 md:p-4">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={category.href || `/category/${category.slug}`}
          className="text-sm"
        >
          <span>{category.name[locale] ?? category.name.uz ?? category.slug}</span>
        </Link>
      ))}
    </div>
  );
}

export function CategoryListForSidebar() {
  const locale = useLocale() as AppLocale;
  const { data: categories = [] } = usePublicCategoriesQuery();
  return (
    <div className="grid grid-cols-1 gap-2 px-4">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={category.href || `/category/${category.slug}`}
          className="text-sm"
        >
          <span>{category.name[locale] ?? category.name.uz ?? category.slug}</span>
        </Link>
      ))}
    </div>
  );
}

export function CategoryListForMobile() {
  const locale = useLocale() as AppLocale;
  const { data: categories = [] } = usePublicCategoriesQuery();
  return (
    <div className="flex md:hidden items-center gap-4 flex-nowrap overflow-x-auto p-2 md:p-4 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={category.href || `/category/${category.slug}`}
          className="text-sm"
        >
          <span>{category.name[locale] ?? category.name.uz ?? category.slug}</span>
        </Link>
      ))}
    </div>
  );
}