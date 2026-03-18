"use client"

import { useTranslations } from "next-intl"
import { SocialMediaButtonsForSidebar } from "@/shared/common/components/ui/social-media-buttons-for-sidebar"

export default function StayConnectedSidebar() {
  const t = useTranslations("stayConnected")

  return (
    <section className="w-full border-t border-border px-4 pt-3">
      {/* <h2 className="text-base font-semibold text-foreground">{t("title")}</h2> */}
      <div className="" aria-hidden />
      <SocialMediaButtonsForSidebar
        variant="icon-box"
        className="grid grid-cols-4 gap-1"
      />
    </section>
  )
}
