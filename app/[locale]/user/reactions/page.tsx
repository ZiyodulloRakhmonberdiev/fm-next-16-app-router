"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/shared/common/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/common/components/ui/card"
import { Badge } from "@/shared/common/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/common/components/ui/dialog"
import { toast } from "sonner"
import { Link } from "@/i18n/navigation"
import { Calendar, ChevronLeft, ChevronRight, Loader2, Smile } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { formatDateTimeLocale } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { UserActivityListSkeleton } from "@/features/user/ui/user-activity-list-skeleton"

type ReactionType = "like" | "love" | "laugh" | "sad" | "angry"

type Row = {
  _id: string
  newsSlug: string
  type: ReactionType
  newsTitle?: Record<string, string>
  createdAt: string
}

type ReactionFilter = "all" | ReactionType

const FILTERS: { id: ReactionFilter; labelKey: string; emoji: string }[] = [
  { id: "all", labelKey: "reaction_filter_all", emoji: "" },
  { id: "like", labelKey: "reaction_type_like", emoji: "👍" },
  { id: "love", labelKey: "reaction_type_love", emoji: "❤️" },
  { id: "laugh", labelKey: "reaction_type_laugh", emoji: "😂" },
  { id: "sad", labelKey: "reaction_type_sad", emoji: "😢" },
  { id: "angry", labelKey: "reaction_type_angry", emoji: "😡" },
]

const emojiMap: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  laugh: "😂",
  sad: "😢",
  angry: "😡",
}

export default function MyReactionsPage() {
  const locale = useLocale() as AppLocale
  const t = useTranslations("auth")
  const tc = useTranslations("common")
  const [items, setItems] = useState<Row[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState<ReactionFilter>("all")
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [ready, setReady] = useState(false)

  const load = useCallback(
    async (nextPage = 1) => {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: "50",
      })
      if (filter !== "all") params.set("type", filter)
      const res = await fetch(`/api/me/reactions?${params}`, { cache: "no-store" })
      if (!res.ok) {
        setReady(true)
        return
      }
      const payload = (await res.json()) as {
        data?: Row[]
        meta?: { totalPages?: number; total?: number }
      }
      setItems(payload.data ?? [])
      setTotal(payload.meta?.total ?? 0)
      setTotalPages(Math.max(1, payload.meta?.totalPages ?? 1))
      setPage(nextPage)
      setReady(true)
    },
    [filter]
  )

  useEffect(() => {
    void load(1)
  }, [load])

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/news/${pendingDelete.newsSlug}/reactions`, {
        method: "DELETE",
      })
      if (!res.ok) {
        toast.error(t("reaction_delete_failed"))
        return
      }
      toast.success(t("reaction_removed"))
      setPendingDelete(null)
      void load(page)
    } finally {
      setDeleting(false)
    }
  }

  const newsTitle = (item: Row) =>
    item.newsTitle?.[locale] ?? item.newsTitle?.uz ?? item.newsTitle?.uzb ?? item.newsSlug

  const reactionTypeKeys: Record<ReactionType, "reaction_type_like" | "reaction_type_love" | "reaction_type_laugh" | "reaction_type_sad" | "reaction_type_angry"> = {
    like: "reaction_type_like",
    love: "reaction_type_love",
    laugh: "reaction_type_laugh",
    sad: "reaction_type_sad",
    angry: "reaction_type_angry",
  }

  const reactionLabel = (type: ReactionType) => t(reactionTypeKeys[type])

  if (!ready) {
    return <UserActivityListSkeleton variant="reactions" />
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="flex flex-wrap items-baseline gap-2 text-lg font-semibold tracking-tight">
          <span>{t("my_reactions")}</span>
          <span className="text-sm font-normal tabular-nums text-muted-foreground">({total})</span>
        </h1>
        <p className="text-sm text-muted-foreground">{t("user_reactions_page_description")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.id}
            type="button"
            size="sm"
            variant={filter === f.id ? "default" : "outline"}
            className="h-8 gap-1.5 rounded-full px-3 text-xs"
            onClick={() => setFilter(f.id)}
          >
            {f.emoji ? <span aria-hidden>{f.emoji}</span> : null}
            {t(f.labelKey)}
          </Button>
        ))}
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item._id}>
              <Card className="gap-0 border-border/80 py-0 shadow-none">
                <CardHeader className="space-y-3 px-4 py-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Badge variant="outline" className="text-[11px] font-normal">
                        <span className="mr-1" aria-hidden>
                          {emojiMap[item.type]}
                        </span>
                        {reactionLabel(item.type)}
                      </Badge>
                      <CardTitle className="text-sm font-medium leading-snug">
                        <Link href={`/news/${item.newsSlug}`} className="hover:underline">
                          <span className="line-clamp-2">{newsTitle(item)}</span>
                        </Link>
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardFooter className="flex justify-between gap-2 border-border/60 bg-accent/30 px-4 py-3 sm:flex-row sm:items-center">
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="size-3 shrink-0 opacity-70" aria-hidden />
                    <time dateTime={item.createdAt}>{formatDateTimeLocale(item.createdAt, locale)}</time>
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                      <Link href={`/news/${item.newsSlug}`}>{t("go_to_article")}</Link>
                    </Button>
                    <span className="text-xs text-muted-foreground">|</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs transition-colors hover:text-destructive"
                      onClick={() => setPendingDelete(item)}
                    >
                      {tc("delete")}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="border-dashed py-10 shadow-none">
          <CardContent className="flex flex-col items-center gap-2 px-4 text-center">
            <Smile className="size-8 text-muted-foreground/40" aria-hidden />
            <p className="text-sm font-medium">{t("user_reactions_empty")}</p>
            <p className="text-xs text-muted-foreground">
              {filter === "all"
                ? t("user_reactions_empty_hint_all")
                : t("user_reactions_empty_hint_filtered")}
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/news">{t("go_to_news_cta")}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3 border-t border-border/60 pt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => void load(page - 1)}
            className="h-8 gap-1"
          >
            <ChevronLeft className="size-4" />
            {tc("pagination_prev")}
          </Button>
          <span className="min-w-16 text-center text-xs tabular-nums text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => void load(page + 1)}
            className="h-8 gap-1"
          >
            {tc("pagination_next")}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      ) : null}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null)
        }}
      >
        <DialogContent className="gap-4 sm:max-w-sm" showCloseButton={!deleting}>
          <DialogHeader>
            <DialogTitle className="text-base">{t("delete_reaction_dialog_title")}</DialogTitle>
            <DialogDescription>{t("delete_reaction_dialog_description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deleting}
              onClick={() => {
                if (!deleting) setPendingDelete(null)
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={() => void confirmDelete()}
              className="min-w-28"
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("deleting")}
                </>
              ) : (
                tc("delete")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
