import type { AppLocale } from "./locale-api"
import { seed } from "@/scripts/seed"

export function getCategoryName(slug: string, locale: AppLocale): string {
  const cat = seed.categories.find((c) => c.slug === slug)
  return cat?.name[locale] ?? slug
}

export function getTagName(slug: string, locale: AppLocale): string {
  const tag = seed.tags.find((t) => t.slug === slug)
  return tag?.name[locale] ?? slug
}

export function getTagNames(slugs: string[] | undefined | null, locale: AppLocale): string[] {
  if (!slugs || !Array.isArray(slugs)) return []
  return slugs.map((slug) => getTagName(slug, locale))
}
