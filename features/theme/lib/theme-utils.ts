import type { AppLocale } from "@/shared/common/lib/locale-api"
import type { LocaleMap } from "@/shared/common/lib/locale-types"

export type PublicTheme = {
  _id: string
  slug: string
  name: LocaleMap
  subtitle: LocaleMap
  description: LocaleMap
  showInHomePage?: boolean
  showInHomeList?: boolean
  status: "active" | "inactive"
}

export function getThemeNameByIdFromApi(
  themes: PublicTheme[],
  id: string,
  locale: AppLocale
): string {
  const theme = themes.find((item) => item._id === id)
  return theme?.name?.[locale] ?? theme?.name?.uz ?? id
}

export function getThemeBySlug(
  themes: PublicTheme[],
  slug: string
): PublicTheme | undefined {
  return themes.find((item) => item.slug === slug)
}

function localeLine(map: LocaleMap | undefined, locale: AppLocale): string {
  return (map?.[locale] ?? map?.uz ?? "").trim()
}

/** Theme listing sahifasi: subtitle bo'lsa faqat u; bo'lmasa title + description. */
export type ThemeListingHeading =
  | { kind: "subtitle"; subtitle: string }
  | { kind: "titleDescription"; title: string; description: string }
  | { kind: "nameOnly"; title: string }

export function getThemeListingHeading(
  themes: PublicTheme[],
  id: string,
  locale: AppLocale
): ThemeListingHeading {
  const theme = themes.find((item) => item._id === id)
  const fallbackTitle = theme?.name?.[locale] ?? theme?.name?.uz ?? id

  if (!theme) {
    return { kind: "nameOnly", title: fallbackTitle }
  }

  const sub = localeLine(theme.subtitle, locale)
  if (sub) {
    return { kind: "subtitle", subtitle: sub }
  }

  const title = theme.name?.[locale] ?? theme.name?.uz ?? id
  const description = localeLine(theme.description, locale)
  return { kind: "titleDescription", title, description }
}

