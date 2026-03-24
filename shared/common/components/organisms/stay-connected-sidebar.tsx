"use client"

import { SocialMediaButtonsForSidebar } from "@/shared/common/components/ui/social-media-buttons-for-sidebar"

export default function StayConnectedSidebar() {
  return (
    <section className="w-full border-t border-border/40 px-4 pt-4 pb-2">
      <SocialMediaButtonsForSidebar
        variant="icon-only"
        className="flex flex-wrap items-center justify-center gap-2 sm:justify-start"
      />
    </section>
  )
}
