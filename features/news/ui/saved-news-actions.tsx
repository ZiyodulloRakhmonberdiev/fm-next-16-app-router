"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button, buttonVariants } from "@/shared/common/components/ui/button"
import { toast } from "sonner"
import { Link } from "@/i18n/navigation"
import { Bookmark } from "lucide-react"
import { cn } from "@/shared/common/lib/utils"
import { useTranslations } from "next-intl"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/common/components/ui/tooltip"

export function SavedNewsActions({
  slug,
  newsId,
  overlay = false,
  unauthAction = overlay ? "link" : "message",
  size,
  variant,
  className,
  onToggle,
}: {
  slug: string
  newsId?: string
  overlay?: boolean
  unauthAction?: "link" | "message" | "toast"
  size?: React.ComponentProps<typeof Button>["size"]
  variant?: React.ComponentProps<typeof Button>["variant"]
  className?: string
  /** Saqlash/o‘chirish muvaffaqiyatli bo‘lganda */
  onToggle?: (saved: boolean) => void
}) {
  const { data: session } = useSession()
  const t = useTranslations("common")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return
    void (async () => {
      const res = await fetch("/api/me/saved-news", { cache: "no-store" })
      if (!res.ok) return
      const payload = (await res.json()) as { data?: Array<{ newsId?: string; newsSlug?: string }> }
      const rows = payload.data ?? []
      setSaved(
        rows.some((r) => (newsId && r.newsId === newsId) || r.newsSlug === slug)
      )
    })()
  }, [session?.user?.id, slug, newsId])

  async function toggle() {
    if (!session?.user?.id) {
      toast.error(t("save_requires_auth"))
      return
    }
    const res = await fetch("/api/me/saved-news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newsId ? { newsId, newsSlug: slug } : { newsSlug: slug }),
    })
    if (!res.ok) return toast.error(t("save_failed"))
    const data = await res.json()
    const isSaved = Boolean(data.saved)
    setSaved(isSaved)
    onToggle?.(isSaved)
    if (isSaved) {
      toast.success(t("saved"))
    }
  }

  if (!session?.user?.id) {
    if (unauthAction === "toast") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size={size ?? "icon"}
              variant={variant ?? (overlay ? "ghost" : "outline")}
              className={cn(overlay ? "size-8" : undefined, className)}
              aria-label={t("save")}
              onClick={() => toast.error(t("save_requires_auth"))}
            >
              <Bookmark className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("save")}</TooltipContent>
        </Tooltip>
      )
    }
    if (overlay || unauthAction === "link") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/auth/login"
              className={cn(
                buttonVariants({ size: size ?? "icon", variant: variant ?? "secondary" }),
                overlay ? "size-8" : undefined,
                className
              )}
              aria-label={t("save")}
            >
              <Bookmark className="size-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>{t("save")}</TooltipContent>
        </Tooltip>
      )
    }
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        <Link href="/auth/login" className="underline">{t("login")}</Link>{" "}
        {t("save_requires_auth_inline")}
      </p>
    )
  }

  if (overlay) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={size ?? "icon"}
            variant={saved ? "default" : (variant ?? "secondary")}
            className={cn("size-8", className)}
            onClick={() => void toggle()}
            aria-label={t("save")}
          >
            <Bookmark className={cn("size-4", saved ? "fill-current" : undefined)} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("save")}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size={size ?? "sm"}
          variant={saved ? "default" : (variant ?? "outline")}
          className={className}
          onClick={() => void toggle()}
          aria-label={t("save")}
        >
          {t("save")}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t("save")}</TooltipContent>
    </Tooltip>
  )
}
