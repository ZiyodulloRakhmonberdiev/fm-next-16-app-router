"use client"

import { useEffect, useState } from "react"
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
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquare,
} from "lucide-react"
import { useLocale } from "next-intl"
import { formatDateTimeLocale } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { cn } from "@/shared/common/lib/utils"

type Row = {
  _id: string
  newsSlug: string
  newsTitle?: Record<string, string>
  content: string
  status: "pending" | "approved" | "confirmed" | "rejected"
  createdAt: string
  confirmedAt?: string
}

function statusLabel(status: Row["status"]) {
  const map: Record<Row["status"], string> = {
    pending: "Ko‘rib chiqilmoqda",
    approved: "Tasdiqlangan",
    confirmed: "Tasdiqlangan",
    rejected: "Rad etilgan",
  }
  return map[status] ?? status
}

function statusBadgeClass(status: Row["status"]) {
  switch (status) {
    case "approved":
    case "confirmed":
      return "border-emerald-500/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
    case "rejected":
      return "border-destructive/25 bg-destructive/5 text-destructive"
    default:
      return "border-amber-500/25 bg-amber-500/5 text-amber-800 dark:text-amber-400"
  }
}

export default function MyCommentsPage() {
  const locale = useLocale() as AppLocale
  const [items, setItems] = useState<Row[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function load(nextPage = 1) {
    const res = await fetch(`/api/me/comments?page=${nextPage}&limit=50`, { cache: "no-store" })
    if (!res.ok) return
    const payload = (await res.json()) as {
      data?: Row[]
      meta?: { totalPages?: number; total?: number }
    }
    setItems(payload.data ?? [])
    setTotal(payload.meta?.total ?? 0)
    setTotalPages(Math.max(1, payload.meta?.totalPages ?? 1))
    setPage(nextPage)
  }
  useEffect(() => {
    void load(1)
  }, [])

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/comments/${pendingDelete._id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("O'chirib bo'lmadi")
        return
      }
      toast.success("Izoh o'chirildi")
      setPendingDelete(null)
      void load(page)
    } finally {
      setDeleting(false)
    }
  }

  const newsTitle = (item: Row) =>
    item.newsTitle?.[locale] ?? item.newsTitle?.uz ?? item.newsTitle?.uzb ?? item.newsSlug

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="flex flex-wrap items-baseline gap-2 text-lg font-semibold tracking-tight">
          <span>Mening izohlarim</span>
          <span className="text-sm font-normal tabular-nums text-muted-foreground">
            ({total})
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Yangiliklar bo‘yicha qoldirilgan izohlaringiz.
        </p>
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item._id}>
              <Card className="gap-0 border-border/80 py-0 shadow-none">
                <CardHeader className="space-y-3 px-4 pt-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Badge
                        variant="outline"
                        className={cn("text-[11px] font-normal", statusBadgeClass(item.status))}
                      >
                        {statusLabel(item.status)}
                      </Badge>
                      <CardTitle className="text-sm font-medium">
                        <Link
                          href={`/news/${item.newsSlug}`}
                          className="hover:underline"
                        >
                          <span className="line-clamp-2">{newsTitle(item)}</span>
                        </Link>
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-4 py-2 bg-accent">
                  <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap wrap-break-word">
                    {item.content}
                  </p>
                </CardContent>

                <CardFooter className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1 text-[11px] text-muted-foreground sm:flex-row sm:gap-4">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3 shrink-0 opacity-70" aria-hidden />
                      <time dateTime={item.createdAt}>{formatDateTimeLocale(item.createdAt, locale)}</time>
                    </span>
                    <span>
                      Tasdiqlangan:{" "}
                      {item.confirmedAt ? formatDateTimeLocale(item.confirmedAt, locale) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="link"  className="h-auto p-0 text-xs" asChild>
                      <Link href={`/news/${item.newsSlug}`}>Yangilikka o‘tish</Link>
                    </Button>
                    <span className="text-muted-foreground text-xs">|</span>
                    <Button variant="link" className="h-auto p-0 text-xs hover:text-destructive transition-colors" onClick={() => setPendingDelete(item)}>O'chirish</Button>
                  </div>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="border-dashed py-10 shadow-none">
          <CardContent className="flex flex-col items-center gap-2 px-4 text-center">
            <MessageSquare className="size-8 text-muted-foreground/40" aria-hidden />
            <p className="text-sm font-medium">Izohlar yo‘q</p>
            <p className="text-xs text-muted-foreground">Yangilik ostida izoh qoldiring.</p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/news">Yangiliklarga o‘tish</Link>
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
            Oldingi
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
            Keyingi
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
            <DialogTitle className="text-base">Izohni o‘chirish</DialogTitle>
            <DialogDescription>
              Bu izohni butunlay o‘chirasiz. Qayta tiklab bo‘lmaydi.
            </DialogDescription>
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
              Bekor qilish
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
                  O‘chirilmoqda
                </>
              ) : (
                "O‘chirish"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
