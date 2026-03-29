"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import { usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/common/components/ui/card"
import { LanguageSwitcherForSidebar } from "@/widgets/language-switcher"
import { ThemeSwitcherForHeader } from "@/widgets/theme-switcher"
import { Bell, ChevronRight, Globe, Mail, Moon, Phone } from "lucide-react"
import { Switch } from "@/shared/common/components/ui/switch"
import { cn } from "@/shared/common/lib/utils"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useTheme } from "next-themes"

type MenuCopy = {
  title: string
  categoryTitle: string
  sectionsTitle: string
  settingsTitle: string
  settingsUiTitle: string
  contactLabel: string
  appLanguageLabel: string
  notificationsLabel: string
  darkModeLabel: string
  darkModeValue: string
  lightModeValue: string
  sections: Array<{ title: string; href: string }>
}

const LOCALE_STORAGE_KEY = "preferred-locale"

const localeMeta: Record<string, { short: string; label: string; flag: string }> = {
  uz: { short: "Uz", label: "O'zbek", flag: "🇺🇿" },
  uzb: { short: "Уз", label: "Ўзбек", flag: "🇺🇿" },
  ru: { short: "Ru", label: "Русский", flag: "🇷🇺" },
  en: { short: "En", label: "English", flag: "🇺🇸" },
}

const copyByLocale: Record<AppLocale, MenuCopy> = {
  uz: {
    title: "Menu",
    categoryTitle: "Ruknlar",
    sectionsTitle: "Bo'limlar",
    settingsTitle: "Sozlamalar",
    settingsUiTitle: "Sozlamalar",
    contactLabel: "Murojaat yo'llash",
    appLanguageLabel: "Ilova tili",
    notificationsLabel: "Bildirishnoma",
    darkModeLabel: "Kechki rejim",
    darkModeValue: "Tungi",
    lightModeValue: "Kunduzgi",
    sections: [
      { title: "Yangiliklar", href: "/news" },
      { title: "Audio", href: "/news/audio" },
      { title: "Video", href: "/news/video" },
      { title: "Dolzarb yangiliklar", href: "/news/breaking" },
      { title: "Muallif tanlovi", href: "/news" },
      { title: "Bizning jamoa", href: "/team" },
      { title: "Biz haqimizda", href: "/about" },
      { title: "Maxfiylik siyosati", href: "/privacy" },
      { title: "Foydalanish shartlari", href: "/terms" },
    ],
  },
  uzb: {
    title: "Меню",
    categoryTitle: "Рукнлар",
    sectionsTitle: "Бўлимлар",
    settingsTitle: "Созламалар",
    settingsUiTitle: "Созламалар",
    contactLabel: "Мурожаат йўллаш",
    appLanguageLabel: "Илова тили",
    notificationsLabel: "Билдиришнома",
    darkModeLabel: "Кечки режим",
    darkModeValue: "Тунги",
    lightModeValue: "Кундузги",
    sections: [
      { title: "Янгиликлар", href: "/news" },
      { title: "Видео", href: "/news/video" },
      { title: "Аудио", href: "/news/audio" },
      { title: "Долзарб янгиликлар", href: "/news/breaking" },
      { title: "Муаллиф танлови", href: "/news" },
      { title: "Бизнинг жамоа", href: "/team" },
      { title: "Биз ҳақимизда", href: "/about" },
      { title: "Махфийлик сиёсати", href: "/privacy" },
      { title: "Фойдаланиш шартлари", href: "/terms" },
    ],
  },
  ru: {
    title: "Меню",
    categoryTitle: "Категории",
    sectionsTitle: "Разделы",
    settingsTitle: "Настройки",
    settingsUiTitle: "Настройки",
    contactLabel: "Связаться с нами",
    appLanguageLabel: "Язык приложения",
    notificationsLabel: "Уведомления",
    darkModeLabel: "Темный режим",
    darkModeValue: "Темный",
    lightModeValue: "Светлый",
    sections: [
      { title: "Новости", href: "/news" },
      { title: "Видео", href: "/news/video" },
      { title: "Аудио", href: "/news/audio" },
      { title: "Срочные новости", href: "/news/breaking" },
      { title: "Выбор автора", href: "/news" },
      { title: "Наша команда", href: "/team" },
      { title: "О нас", href: "/about" },
      { title: "Условия использования", href: "/terms" },
      { title: "Политика конфиденциальности", href: "/privacy" },
    ],
  },
  en: {
    title: "Menu",
    categoryTitle: "Categories",
    sectionsTitle: "Sections",
    settingsTitle: "Settings",
    settingsUiTitle: "Settings",
    contactLabel: "Contact us",
    appLanguageLabel: "App language",
    notificationsLabel: "Notifications",
    darkModeLabel: "Dark mode",
    darkModeValue: "Dark",
    lightModeValue: "Light",
    sections: [
      { title: "News", href: "/news" },
      { title: "Video", href: "/news/video" },
      { title: "Audio", href: "/news/audio" },
      { title: "Breaking news", href: "/news/breaking" },
      { title: "Author's choice", href: "/news" },
      { title: "Our team", href: "/team" },
      { title: "About us", href: "/about" },
      { title: "Privacy policy", href: "/privacy" },
      { title: "Terms of use", href: "/terms" },
    ],
  },
}

export default function MenuPageClient() {
  const locale = useLocale() as AppLocale
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const copy = copyByLocale[locale] ?? copyByLocale.uz
  const { data: categories = [] } = usePublicCategoriesQuery()
  const [selectedLocale, setSelectedLocale] = React.useState(locale)
  const [showLocaleOptions, setShowLocaleOptions] = React.useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)

  React.useEffect(() => {
    setSelectedLocale(locale)
  }, [locale])

  const handleSetLocale = (nextLocale: AppLocale) => {
    setSelectedLocale(nextLocale)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
    }
    router.replace(pathname, { locale: nextLocale as any })
  }

  const locales = ["uz", "uzb", "ru", "en"] as const
  const currentLocaleMeta = localeMeta[selectedLocale] ?? localeMeta[locale] ?? localeMeta.uz

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 md:px-6">
      {/* <section className="space-y-3">
        <h1 className="text-2xl font-bold md:text-3xl">{copy.title}</h1>
      </section> */}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{copy.categoryTitle}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={category.href || `/category/${category.slug}`}
              className="flex justify-between items-center rounded-xl border border-border bg-card px-3 py-3 text-sm font-medium transition-colors hover:border-brand/50 hover:text-brand"
            >
              <span>{category.name[locale] ?? category.name.uz ?? category.slug}</span>
              <ChevronRight className="size-4" />
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{copy.sectionsTitle}</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
          {copy.sections.map((section) => (
            <Link
              key={`${section.href}-${section.title}`}
              href={section.href}
              className="flex justify-between items-center rounded-xl border border-border bg-card px-3 py-3 text-sm font-medium transition-colors hover:border-brand/50 hover:text-brand"
            >
              <span>{section.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <Card className="gap-3">
        <CardHeader className="px-4 pb-0">
          <CardTitle>{copy.settingsTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
            <span className="text-sm font-medium">Til</span>
            <LanguageSwitcherForSidebar />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
            <span className="text-sm font-medium">Theme</span>
            <ThemeSwitcherForHeader />
          </div>
          <Link
            href="/contact"
            className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
          >
            <Mail className="size-4" />
            {copy.contactLabel}
          </Link>
        </CardContent>
      </Card>

    </div>
  )
}
