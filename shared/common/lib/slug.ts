/**
 * News uchun: title dan slug (URL).
 * @example titleToSlug("Nike Air Max 270") → "nike-air-max-270"
 */
export function titleToSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}
