"use client"

import { useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/shared/common/components/ui/button"
import { cn } from "@/shared/common/lib/utils"

const SHOW_AFTER_PX = 400

export function ScrollToTopButton() {
  const t = useTranslations("common")
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon-lg"
      aria-label={t("scroll_to_top")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed right-4 z-40 size-11 rounded-full border border-border/60 bg-background/90 shadow-lg backdrop-blur transition-all duration-300",
        "bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      )}
    >
      <ChevronUp className="size-5" />
    </Button>
  )
}
