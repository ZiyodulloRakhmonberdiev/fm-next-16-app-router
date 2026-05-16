import { Link } from "@/i18n/navigation"
import { HomeIcon, Flame, History, VideoIcon, Volume2, Radio } from "lucide-react"
import { CategoryListForNewsPage } from "@/entities/category"
import { getTranslations } from "next-intl/server"
import { leanDocToPayload, SITE_SETTINGS_DOCUMENT_ID, SiteSettingsModel } from "@/features/dashboard/configs/site-settings.model"

export default async function NewsSlugSidebar() {
  const settingsDoc = await SiteSettingsModel.findById(SITE_SETTINGS_DOCUMENT_ID).lean()
  const settingsPayload = leanDocToPayload(settingsDoc)
  const socialMap = new Map(
    (settingsPayload?.socialMedia ?? []).map((item) => [item.slug, item.href])
  )
  const socialLinks = [
    { label: "Telegram", href: socialMap.get("telegram") ?? "" },
    { label: "Instagram", href: socialMap.get("instagram") ?? "" },
    { label: "Facebook", href: socialMap.get("facebook") ?? "" },
    { label: "YouTube", href: socialMap.get("youtube") ?? "" },
  ].filter((item) => item.href.trim())

  const t = await getTranslations("common")
  return (
    <aside className="hidden lg:flex lg:flex-col lg:col-span-1 gap-4">
      <div className="px-4 text-lg">
        <nav className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2">
            <HomeIcon className="w-5 h-5" /> <span className="text-lg whitespace-nowrap">{t("nav_home")}</span>
          </Link>
          <Link href="/news/trending" className="flex items-center gap-3">
            <Flame className="w-5 h-5" /> <span className="text-lg">{t("nav_trending")}</span>
          </Link>
          <Link href="/news/latest" className="flex items-center gap-3">
            <History className="w-5 h-5" /> <span className="text-lg">{t("nav_latest")}</span>
          </Link>
          <Link href="/news/video" className="flex items-center gap-3">
            <VideoIcon className="w-5 h-5" /> <span className="text-lg">{t("nav_video")}</span>
          </Link>
          <Link href="/news/audio" className="flex items-center gap-3">
            <Volume2 className="w-5 h-5" /> <span className="text-lg">{t("audio")}</span>
          </Link>
          {/* <Link href="/news/radio" className="flex items-center gap-3">
            <Radio className="w-5 h-5" /> <span className="text-lg">{t("radio")}</span>
          </Link> */}
        </nav>
      </div>
      <div className="border-t border-b border-border">
        <CategoryListForNewsPage />
      </div>
      <div className="px-4 text-sm">
        <nav className="flex flex-col gap-2">
          {socialLinks.map((item) => (
            <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="flex items-center gap-3">
              <span className="text-lg">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}