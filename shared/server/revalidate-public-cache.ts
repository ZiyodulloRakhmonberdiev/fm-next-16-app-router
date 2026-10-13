import { revalidatePath, revalidateTag } from "next/cache"

const PUBLIC_LOCALES = ["uz", "uzb", "ru", "en"] as const
const REVALIDATE_NOW = { expire: 0 } as const

function revalidateLocalizedPages(suffixes: string[]) {
  for (const locale of PUBLIC_LOCALES) {
    for (const suffix of suffixes) revalidatePath(`/${locale}${suffix}`)
  }
}

/** Listings with direct DB reads need explicit invalidation. Never flush a locale layout. */
function revalidateNewsListings() {
  revalidateLocalizedPages(["", "/articles", "/announcements", "/news", "/news/latest",
    "/news/trending", "/news/breaking", "/news/video", "/news/audio", "/news/authors-choice"])
  for (const pattern of ["/[locale]/category/[slug]", "/[locale]/theme/[slug]", "/[locale]/author/[id]"]) {
    revalidatePath(pattern, "page")
  }
  for (const locale of PUBLIC_LOCALES) revalidatePath(`/api/news/sidebar/${locale}`)
  revalidatePath("/sitemap.xml")
}

/** Create, edit, unpublish, delete and slug changes all use this entrypoint. */
export function revalidateNewsPublicCache(slug?: string) {
  revalidateTag("news", REVALIDATE_NOW)
  if (slug) revalidateLocalizedPages([`/news/${slug}`])
  revalidateNewsListings()
}

export function revalidateCategoriesPublicCache() {
  revalidateTag("categories", REVALIDATE_NOW)
  revalidateNewsListings()
}

export function revalidateThemesPublicCache() {
  revalidateTag("themes", REVALIDATE_NOW)
  revalidateNewsListings()
}

export function revalidateTagsPublicCache() {
  revalidateTag("tags", REVALIDATE_NOW)
}

export function revalidateAdsPublicCache() {
  revalidateTag("ads", REVALIDATE_NOW)
  revalidateLocalizedPages(["", "/announcements"])
}

export function revalidateTeamPublicCache() {
  revalidateTag("team", REVALIDATE_NOW)
  revalidateLocalizedPages(["/team"])
}
