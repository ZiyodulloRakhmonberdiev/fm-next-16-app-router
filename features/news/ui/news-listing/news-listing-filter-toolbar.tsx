"use client"

import type { ReactNode } from "react"
// import { ChevronDown } from "lucide-react"
import { Button } from "@/shared/common/components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/shared/common/components/ui/dropdown-menu"
import type { PublicCategory } from "@/features/category/model/public-categories-query"
import type { AppLocale } from "@/shared/common/lib/formatter"
import type { FilterType } from "./news-listing-types"

type NewsListingFilterToolbarProps = {
  pageHeading: ReactNode
  locale: AppLocale
  categories: PublicCategory[]
  activeFilter: FilterType
  selectedCategorySlugs: string[]
  selectedCount: number
  onFilterChange: (filter: FilterType) => void
  onCategoryToggle: (slug: string, checked: boolean) => void
  onApplyCategories: () => void
  onClearCategories: () => void
  labels: {
    filterLatest: string
    filterPopular: string
    categories: string
    apply: string
    clear: string
  }
}

function getCategoryLabel(c: PublicCategory, locale: AppLocale) {
  return c.name?.[locale] ?? c.name?.uz ?? c.slug
}

export function NewsListingFilterToolbar({
  pageHeading,
  // locale,
  // categories,
  activeFilter,
  // selectedCategorySlugs,
  // selectedCount,
  onFilterChange,
  // onCategoryToggle,
  // onApplyCategories,
  // onClearCategories,
  labels,
}: NewsListingFilterToolbarProps) {
  const filterButtons: { key: FilterType; label: string }[] = [
    { key: "latest", label: labels.filterLatest },
    { key: "popular", label: labels.filterPopular },
  ]

  return (
    <div className="mb-2 md:mb-4 md:pt-4 flex flex-col gap-1 bg-background py-2 sm:flex-row sm:items-center sm:justify-between md:top-17 md:gap-3 z-20 border-b">
      <h1 className="text-xl md:text-3xl md:mb-2 font-bold">{pageHeading}</h1>
      <div className="flex items-center gap-2">
        <div className="w-full flex-wrap">
          <div className="flex-wrap items-center gap-4 rounded-md bg-background py-1">
            {filterButtons.map((btn) => (
              <Button
                key={btn.key}
                type="button"
                size="sm"
                variant="ghost"
                className={[
                  "h-8 rounded-sm px-2",
                  activeFilter === btn.key
                    ? "text-brand underline underline-offset-4"
                    : "text-muted-foreground",
                ].join(" ")}
                onClick={() => onFilterChange(btn.key)}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>

        {/* <div className="hidden">
          <DropdownMenu >
            <DropdownMenuTrigger asChild>
              <Button type="button" size="sm" variant="ghost" className="h-8 gap-2">
                <span>{labels.categories}</span>
                {selectedCount > 0 ? (
                  <span className="text-muted-foreground">({selectedCount})</span>
                ) : null}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xs">
              <DropdownMenuLabel>{labels.categories}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((c) => {
                const checked = selectedCategorySlugs.includes(c.slug)
                return (
                  <DropdownMenuCheckboxItem
                    key={c.slug}
                    checked={checked}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(next) => onCategoryToggle(c.slug, Boolean(next))}
                  >
                    {getCategoryLabel(c, locale)}
                  </DropdownMenuCheckboxItem>
                )
              })}
              <DropdownMenuSeparator />
              <div className="flex w-full flex-row gap-2 p-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 justify-start gap-2 bg-foreground text-background rounded-xs"
                  onClick={onApplyCategories}
                >
                  {labels.apply}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 justify-start gap-2 rounded-xs"
                  onClick={onClearCategories}
                >
                  {labels.clear}
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}
      </div>
    </div>
  )
}
