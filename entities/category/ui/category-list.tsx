"use client";

import { useEffect, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/shared/common/lib/locale-api";
import { usePublicCategoriesQuery } from "@/features/category/model/public-categories-query";
import type { PublicCategory } from "@/features/category/model/public-categories-query";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Button } from "@/shared/common/components/ui/button";
import { cn } from "@/shared/common/lib/utils";
import { ThemeSwitcherForHeader } from "@/widgets/theme-switcher/ui/theme-switcher";

/** Bosh sahifa nav: tartib va slug / nom bo‘yicha moslashuv. */
const HOME_NAV_SLOTS: { uz: string; slugCandidates: string[] }[] = [
  { uz: "O'zbekiston", slugCandidates: ["ozbekiston", "uzbekiston", "uzbekistan", "o-zbekiston"] },
  { uz: "Jamiyat", slugCandidates: ["jamiyat", "society", "community"] },
  { uz: "Jahon", slugCandidates: ["jahon", "world", "global"] },
  { uz: "Siyosat", slugCandidates: ["siyosat", "politics"] },
  { uz: "Sud-huquq", slugCandidates: ["judiciary", "sud_huquq", "sudhuquq", "law-and-order", "law"] },
];

function normKey(s: string) {
  return s
    .toLowerCase()
    .replace(/['ʼʻ`]/g, "")
    .replace(/_/g, "-")
    .replace(/\s+/g, "")
    .trim();
}

function normSlug(slug: string) {
  return slug.toLowerCase().replace(/_/g, "-").trim();
}

function categoryMatchesSlot(category: PublicCategory, slot: (typeof HOME_NAV_SLOTS)[number]) {
  if (slot.slugCandidates.some((s) => normSlug(category.slug) === normSlug(s))) {
    return true;
  }
  const uz = category.name?.uz?.trim();
  if (!uz) return false;
  return normKey(uz) === normKey(slot.uz);
}

function resolveHomeNavCategories(categories: PublicCategory[]): PublicCategory[] {
  const used = new Set<string>();
  const out: PublicCategory[] = [];
  for (const slot of HOME_NAV_SLOTS) {
    const found = categories.find((c) => !used.has(c.slug) && categoryMatchesSlot(c, slot));
    if (found) {
      used.add(found.slug);
      out.push(found);
    }
  }
  return out;
}

function categoryLabel(category: PublicCategory, locale: AppLocale) {
  return category.name[locale] ?? category.name.uz ?? category.slug;
}

type MegaMenuTriggerProps = {
  open: boolean;
  onToggle: () => void;
};

export function CategoryMegaMenuTrigger({ open, onToggle }: MegaMenuTriggerProps) {
  const t = useTranslations("common");
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="category-mega-menu"
      aria-label={t("nav_menu")}
      className="shrink-0"
    >
      {
        open ? <X className="size-5" /> : <Menu className="size-5" />
      }
    </Button>
  );
}

type MegaMenuDropdownProps = {
  open: boolean;
  onClose: () => void;
};

function DashLink({
  href,
  children,
  onNavigate,
  variant = "default",
}: {
  href: string;
  children: ReactNode;
  onNavigate?: () => void;
  variant?: "default" | "category";
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-start gap-2 py-1.5 transition-colors hover:text-brand",
        variant === "category" ? "text-base font-bold" : "text-sm font-normal"
      )}
    >
      <span className="text-muted-foreground select-none">-</span>
      <span>{children}</span>
    </Link>
  );
}

export function CategoryMegaMenuDropdown({ open, onClose }: MegaMenuDropdownProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("common");
  const { data: categories = [] } = usePublicCategoriesQuery();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const homeNav = resolveHomeNavCategories(categories);
  const pinnedSlugs = new Set(homeNav.map((c) => c.slug));
  const rest = categories.filter((c) => !pinnedSlugs.has(c.slug));
  const mid = Math.ceil(rest.length / 2);
  const restCol1 = rest.slice(0, mid);
  const restCol2 = rest.slice(mid);

  const staticLinks = [
    { href: "/news", labelKey: "news" as const },
    { href: "/articles", labelKey: "articles" as const },
    { href: "/news/video", labelKey: "video" as const },
    { href: "/about", labelKey: "about_us" as const },
  ];

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-49 cursor-default"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        id="category-mega-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t("nav_menu")}
        className={cn(
          "absolute left-0 right-0 top-full z-50 max-h-[min(72vh,640px)] overflow-y-auto",
          "border-t border-border/50 shadow-lg",
          "bg-background/90 backdrop-blur-sm supports-backdrop-filter:bg-background/85"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-0 lg:divide-x lg:divide-border/60">
            <div
              className={cn(
                "grid flex-1 gap-8 lg:gap-6 lg:pr-6",
                rest.length === 0
                  ? "grid-cols-1 lg:grid-cols-1"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              )}
            >
              {rest.length > 0 ? (
                <>
                  <div className="min-w-0 space-y-1 border-b border-border/50 pb-6 sm:border-b-0 sm:pb-0 lg:border-b-0 lg:pb-0">
                    {restCol1.map((category) => (
                      <DashLink
                        key={category.slug}
                        href={category.href || `/category/${category.slug}`}
                        onNavigate={onClose}
                        variant="category"
                      >
                        {categoryLabel(category, locale)}
                      </DashLink>
                    ))}
                  </div>
                  <div className="min-w-0 space-y-1 border-b border-border/50 pb-6 sm:border-b-0 sm:pb-0 lg:border-b-0 lg:pb-0">
                    {restCol2.map((category) => (
                      <DashLink
                        key={category.slug}
                        href={category.href || `/category/${category.slug}`}
                        onNavigate={onClose}
                        variant="category"
                      >
                        {categoryLabel(category, locale)}
                      </DashLink>
                    ))}
                  </div>
                </>
              ) : null}
              <div className={cn("min-w-0 space-y-1", rest.length > 0 && "lg:pl-2")}>
                {/* <p className="mb-2  font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("quick_links")}
                </p> */}
                {staticLinks.map((item) => (
                  <DashLink key={item.href} href={item.href} onNavigate={onClose} variant="category">
                    {t(item.labelKey)}
                  </DashLink>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-stretch lg:w-[200px] lg:flex-col lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <div className="shrink-0 border-t border-border/60 pt-4 sm:mt-0 sm:w-[220px] sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 lg:w-full lg:border-l-0 lg:pl-0 lg:pt-4">
                <p className="text-sm font-bold">{t("mega_menu_sidebar_title")}</p>
                <div className="mt-4 flex items-center justify-start">
                  <ThemeSwitcherForHeader />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CategoryList() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("common");
  const { data: categories = [] } = usePublicCategoriesQuery();
  const visible = resolveHomeNavCategories(categories);
  return (
    <div className="hidden md:flex items-center gap-4 text-[16px] flex-wrap p-2 md:p-4 font-bold">
      {visible.map((category) => (
        <Link
          key={category.slug}
          href={category.href || `/category/${category.slug}`}
          className="hover:text-brand transition-colors"
        >
          <span>{categoryLabel(category, locale)}</span>
        </Link>
      ))}
      <Link href="/news/audio" className="hover:text-brand transition-colors">
        <span>{t("audio")}</span>
      </Link>
    </div>
  );
}

export function CategoryListForSidebar() {
  // const locale = useLocale() as AppLocale;
  const t = useTranslations("common");
  // const { data: categories = [] } = usePublicCategoriesQuery();
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
      <Link href="/articles" className="text-sm">
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
          <span>{categoryLabel(category, locale)}</span>
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
    <div className="flex flex-col items-start py-4 justify-start gap-4 px-4 font-semibold">
      <Link href="/news" className="text-sm">
        <span className="text-lg font-medium">{t("news")}</span>
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={category.href || `/category/${category.slug}`}
          className="text-sm"
        >
          <span className="text-lg font-medium">{categoryLabel(category, locale)}</span>
        </Link>
      ))}
      <Link href="/news/video" className="text-sm">
        <span className="text-lg font-medium">{t("video")}</span>
      </Link>
    </div>
  );
}
