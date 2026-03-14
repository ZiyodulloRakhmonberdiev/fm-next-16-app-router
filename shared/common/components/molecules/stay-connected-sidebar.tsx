"use client"

import { useTranslations } from "next-intl"
import { SocialMediaButtons } from "@/shared/common/components/ui/social-media-buttons"

export default function StayConnectedSidebar() {
  const t = useTranslations("stayConnected")

  return (
    <section className="w-full space-y-3 border-t border-border px-4 pt-3">
      <h2 className="text-base font-semibold text-foreground">{t("title")}</h2>
      <div className="border-b border-border" aria-hidden />
      <SocialMediaButtons
        variant="icon-box"
        className="grid grid-cols-4 gap-1"
      />
    </section>
  )
}
