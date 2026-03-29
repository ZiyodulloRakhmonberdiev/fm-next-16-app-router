"use client"

import { useState } from "react"
import { Link } from "@/i18n/navigation"
import { ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/shared/common/lib/utils"
import { useLocale, useTranslations } from "next-intl"
import { seed } from "@/scripts/seed"
import { usePublicSiteSettingsQuery } from "@/shared/server/public-site-settings-query"
import { AppLocale } from "@/shared/common/lib/locale-api"

type InteractiveSectionsPageProps = {
  title: string
  sections: string[]
  ctaHref?: string
  ctaLabel?: string
}

export function InteractiveSectionsPage({
  title,
  sections,
  ctaHref,
  ctaLabel,
}: InteractiveSectionsPageProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeText = sections[activeIndex] ?? sections[0] ?? ""
  const { data: settings } = usePublicSiteSettingsQuery()
  const locale = useLocale() as AppLocale
  const description = settings?.description?.[locale] ?? seed.description[locale]

  const t = useTranslations("common")

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden md:rounded-[28px] md:border">
        <div className="grid md:gap-4 md:px-10 md:py-12">
          <div className="space-y-4">
            <h1 className="max-w-3xl text-xl font-bold tracking-tight text-foreground md:text-5xl">
              {title}
            </h1>
            <p className="hidden md:block max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {/* {description} */}
              {activeText}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {sections.map((section, index) => (
              <button
                key={`${title}-metric-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all",
                  activeIndex === index
                    ? "border-brand bg-brand text-white shadow-lg"
                    : "border-brand/15 bg-white/85 hover:-translate-y-0.5 hover:border-brand/35 dark:bg-card/80"
                )}
              >
                <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", activeIndex === index ? "text-white/80" : "text-brand")}>
                  0{index + 1}
                </p>
                <p className={cn("mt-2 text-sm leading-relaxed", activeIndex === index ? "text-white" : "text-muted-foreground")}>
                  {section}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
