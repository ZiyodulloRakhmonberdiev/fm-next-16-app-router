import type { AppLocale } from "@/shared/common/lib/locale-api"
import type { LocaleMap } from "@/shared/common/lib/locale-types"

export type PublicCategory = {
  _id?: string
  slug: string
  href?: string
  name: LocaleMap
  priority?: number
}

export function sortCategoriesByPriority(categories: PublicCategory[]): PublicCategory[] {
  return [...categories].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
}

export function getCategoryNameFromApi(
  categories: PublicCategory[],
  slug: string,
  locale: AppLocale
): string {
  const category = categories.find((item) => item.slug === slug)
  return category?.name?.[locale] ?? category?.name?.uz ?? slug
}
