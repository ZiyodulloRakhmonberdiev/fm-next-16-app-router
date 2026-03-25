"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/common/components/ui/button";
import { cn } from "@/shared/common/lib/utils";

export type NewsSectionHeaderVariant =
  | "brand"
  | "subtle"
  | "brandThin"
  | "brandAccent"
  | "inline";

export type NewsSectionHeaderProps = {
  title: ReactNode;
  viewAllHref: string;
  variant?: NewsSectionHeaderVariant;
  className?: string;
  titleClassName?: string;
  viewAllClassName?: string;
  /** `link` — Button variant="link" (banner, row); `ghost` — column-section */
  linkWrap?: "none" | "link" | "ghost";
  /** row-section: pastida brand chiziq */
  showBrandLine?: boolean;
  /** `linkWrap="link"` bo‘lsa: matn va tugma `text-primary` o‘rniga oddiy foreground (oq/qora) */
  neutralViewAll?: boolean;
};

function rowClass(variant: NewsSectionHeaderVariant): string {
  switch (variant) {
    case "brand":
      return "flex items-center justify-between gap-2 border-b-2 border-brand pb-4 mb-4";
    case "subtle":
      return "flex items-center justify-between gap-2 border-b border-border pb-3";
    case "brandThin":
      return "flex flex-wrap items-center justify-between gap-3 border-b border-brand pb-2 pt-4 px-4 md:px-6";
    case "brandAccent":
      return "flex items-center justify-between gap-2 border-b-2 border-brand pb-2 mb-4 text-brand";
    case "inline":
      return "flex items-center justify-between gap-3 px-4 py-3";
    default:
      return "";
  }
}

function defaultTitleClass(variant: NewsSectionHeaderVariant): string {
  switch (variant) {
    case "subtle":
      return "text-lg font-bold tracking-tight text-foreground md:text-xl";
    case "inline":
      return "text-base font-semibold";
    default:
      return "text-lg font-semibold";
  }
}

function defaultViewAllClass(
  variant: NewsSectionHeaderVariant,
  linkWrap: NewsSectionHeaderProps["linkWrap"]
): string {
  if (linkWrap === "link" || linkWrap === "ghost") {
    return "";
  }
  switch (variant) {
    case "subtle":
      return "flex shrink-0 items-center gap-1 text-xs font-medium transition-colors hover:text-foreground hover:underline md:text-sm";
    case "brandThin":
      return "text-xs md:text-sm flex items-center gap-1";
    default:
      return "flex items-center gap-1 text-xs font-medium hover:underline md:text-sm";
  }
}

export function NewsSectionHeader({
  title,
  viewAllHref,
  variant = "brand",
  className,
  titleClassName,
  viewAllClassName,
  linkWrap = "none",
  showBrandLine = false,
  neutralViewAll = false,
}: NewsSectionHeaderProps) {
  const t = useTranslations("common");

  const label =
    neutralViewAll && linkWrap === "link" ? (
      <span className="flex items-center text-foreground gap-1.5">
        {t("view_all")}
        <ChevronRight className="size-4 shrink-0 opacity-70" aria-hidden />
      </span>
    ) : (
      <div className="flex items-center gap-2">
        {t("view_all")}
        <ChevronRight className="size-5 shrink-0 rounded-full bg-foreground p-1 text-background" aria-hidden />
      </div>
    );

  const linkClasses = cn(defaultViewAllClass(variant, linkWrap), viewAllClassName);

  const link =
    linkWrap === "ghost" ? (
      <Button variant="link" size="sm" asChild className="">
        <Link
          href={viewAllHref}
          className={cn(
            "text-xs md:text-sm hover:underline flex items-center gap-1",
            viewAllClassName
          )}
        >
          {label}
        </Link>
      </Button>
    ) : linkWrap === "link" ? (
      <Button
        variant={neutralViewAll ? "ghost" : "link"}
        size="sm"
        asChild
        className={
          neutralViewAll
            ? "h-auto px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
            : ""
        }
      >
        <Link
          href={viewAllHref}
          className={cn(
            "flex items-center gap-1 text-xs hover:underline md:text-sm",
            viewAllClassName
          )}
        >
          {label}
        </Link>
      </Button>
    ) : (
      <Link href={viewAllHref} className={linkClasses}>
        {label}
      </Link>
    );

  const inner = (
    <div className={cn(rowClass(variant), className)}>
      <h2 className={cn(defaultTitleClass(variant), titleClassName)}>{title}</h2>
      {link}
    </div>
  );

  if (showBrandLine) {
    return (
      <>
        {inner}
        <div className="h-px w-full bg-brand" aria-hidden />
      </>
    );
  }

  return inner;
}
