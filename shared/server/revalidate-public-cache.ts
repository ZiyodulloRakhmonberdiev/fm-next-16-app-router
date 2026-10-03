import { revalidatePath, revalidateTag } from "next/cache"

const PUBLIC_LOCALES = ["uz", "uzb", "ru", "en"] as const

/** Admin yozuvidan keyin kesh darhol eskirsin (Next.js 16 ikkinchi argument majburiy) */
const REVALIDATE_NOW = { expire: 0 } as const

/** Barcha locale layoutlari va sitemap — SSR keshini yangilash */
function revalidatePublicLayouts() {
  for (const locale of PUBLIC_LOCALES) {
    revalidatePath(`/${locale}`, "layout")
  }
  revalidatePath("/sitemap.xml")
}

/** Yangiliklar (bosh sahifa, ad, stats) — `unstable_cache` tag: news */
export function revalidateNewsPublicCache(slug?: string) {
  revalidateTag("news", REVALIDATE_NOW)
  if (slug) {
    for (const locale of PUBLIC_LOCALES) {
      revalidatePath(`/${locale}/news/${slug}`)
    }
  }
  revalidatePublicLayouts()
}

export function revalidateCategoriesPublicCache() {
  revalidateTag("categories", REVALIDATE_NOW)
  revalidatePublicLayouts()
}

export function revalidateThemesPublicCache() {
  revalidateTag("themes", REVALIDATE_NOW)
  revalidatePublicLayouts()
}

export function revalidateTagsPublicCache() {
  revalidateTag("tags", REVALIDATE_NOW)
}

export function revalidateAdsPublicCache() {
  revalidateTag("ads", REVALIDATE_NOW)
  revalidatePublicLayouts()
}

export function revalidateTeamPublicCache() {
  revalidateTag("team", REVALIDATE_NOW)
  for (const locale of PUBLIC_LOCALES) revalidatePath(`/${locale}/team`)
}
