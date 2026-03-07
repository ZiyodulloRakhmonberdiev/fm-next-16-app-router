/**
 * Category nomidan slug (URL uchun).
 * @example slugFromCategory("Sports") → "sports"
 */
export function slugFromCategory(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-")
}

/**
 * Slug dan category nomi (sahifa sarlavhasi va filter uchun).
 * @example slugToCategory("sports") → "Sports"
 */
export function slugToCategory(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}
