export function slugFromCategory(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-")
}

export function slugToCategory(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}
