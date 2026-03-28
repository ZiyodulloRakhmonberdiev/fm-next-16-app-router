"use client"

import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/shared/common/lib/utils"
import { usePublicSiteSettingsQuery } from "@/shared/server/public-site-settings-query"
import { seed } from "@/scripts/seed"

export type AdSlotPlaceholderPlacement =
  | "header_top_full"
  | "sidebar_widget"
  | "home_bottom_full"
  | "article_bottom_full"

type Props = {
  placement?: AdSlotPlaceholderPlacement
}

export function AdSlotPlaceholder({ placement = "header_top_full" }: Props) {
  const t = useTranslations("ads")
  const isSidebar = placement === "sidebar_widget"
  const { data: settings } = usePublicSiteSettingsQuery()

  if (isSidebar) {
    return (
      <div className="w-full" data-ad-placeholder="sidebar">
        <div
          className={cn(
            "relative flex w-full min-h-[148px] flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-border px-3 py-5",
            "bg-cover bg-center bg-no-repeat shadow-sm"
          )}
          style={{ backgroundImage: "url(/images/bg-for-ad-placeholder.jpg)" }}
        >
          <div className="absolute inset-0 rounded-xl bg-black/35" aria-hidden />
          <div className="relative z-10 flex w-full max-w-[240px] flex-col items-center gap-2 text-center">
            <Link
              href="/contact"
              className="text-sm font-medium leading-snug text-white/95 underline-offset-2 hover:text-white hover:underline"
            >
              {t("placeholder_slot_text")}
            </Link>
            <Link href="/contact" className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-white/85">
                {t("placeholder_slot_label")}
              </span>
              {/* <span className="text-[11px] tabular-nums text-white/70">({t("placeholder_slot_size")})</span> */}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const telegramLink =
    settings?.socialMedia?.find((s) => s.slug === "telegram") ?? seed.socialMedia.find((s) => s.slug === "telegram")
  const telegramHref = telegramLink?.href ?? "https://t.me/ferganamedia"
  const isExternalTelegram = telegramHref.startsWith("http")

  return (
    <div className="w-full" data-ad-placeholder={placement}>
      <div
        className={cn(
          "relative grid min-h-0 w-full grid-cols-1 overflow-hidden rounded-xl shadow-sm aspect-video max-h-[120px] md:grid-cols-2 md:aspect-auto md:max-h-[140px] md:min-h-[140px] lg:max-h-[200px] lg:min-h-[200px]",
          "bg-cover bg-center bg-no-repeat",
          "border border-border"
        )}
        style={{ backgroundImage: "url(/images/bg-for-ad-placeholder.jpg)" }}
      >
        <div className="absolute inset-0 rounded-xl bg-black/25" aria-hidden />
        <div className="relative z-10 hidden flex-row items-center justify-center gap-2 p-4 md:flex">
          {isExternalTelegram ? (
            <a
              href={telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-[#0088cc]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0088cc]"
              aria-label="Telegram"
            >
              <svg className="size-16 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
          ) : (
            <Link
              href={telegramHref}
              className="flex flex-col items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-[#0088cc]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0088cc]"
              aria-label="Telegram"
            >
              <svg className="size-16 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </Link>
          )}
          <Link href={telegramHref} className="text-2xl text-white hover:underline">
            Telegram kanalimizga obuna bo&apos;ling
          </Link>
        </div>

        <div className="relative z-10 flex flex-row items-center justify-center gap-2 p-4">
          <Link
            href="/contact"
            className="hidden max-w-56 text-center text-sm font-medium text-white/95 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:block md:rounded md:px-2 md:py-1 line-clamp-2"
          >
            {t("placeholder_slot_text")}
          </Link>
          <Link href="/contact" className="flex flex-col items-center justify-center gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
              {t("placeholder_slot_label")}
            </span>
            <span className="text-xs tabular-nums text-white/70">({t("placeholder_slot_size")})</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
