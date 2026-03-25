"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/shared/common/components/ui/button"
import { Badge } from "@/shared/common/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/common/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/common/components/ui/table"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { truncateChars } from "@/shared/common/lib/truncate"
import { cn } from "@/shared/common/lib/utils"

const TITLE_MAX = 36
const CONTENT_PREVIEW = 64

type CommentRow = {
  _id: string
  newsSlug: string
  newsTitle?: string
  userName: string
  content: string
  status: "pending" | "confirmed" | "rejected" | "approved"
  createdAt: string
  confirmedAt?: string
  confirmedByUserId?: string
  confirmedByUserName?: string
}

type CommentStatusTab = "pending" | "confirmed" | "rejected"

type Counts = { pending: number; confirmed: number; rejected: number }

const TAB_LABELS: Record<CommentStatusTab, string> = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlandi",
  rejected: "Rad etildi",
}

function newsLinkLabel(item: CommentRow): string {
  const raw = (item.newsTitle?.trim() || item.newsSlug || "—").trim()
  return truncateChars(raw, TITLE_MAX)
}

export default function DashboardCommentsPage() {
  const [items, setItems] = useState<CommentRow[]>([])
  const [status, setStatus] = useState<CommentStatusTab>("pending")
  const [counts, setCounts] = useState<Counts>({ pending: 0, confirmed: 0, rejected: 0 })
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [moderatingKey, setModeratingKey] = useState<string | null>(null)
  const [preview, setPreview] = useState<CommentRow | null>(null)

  const loadCounts = useCallback(async () => {
    const res = await fetch("/api/comments?counts=1", { cache: "no-store" })
    if (!res.ok) return
    const data = (await res.json()) as Counts
    setCounts({
      pending: data.pending ?? 0,
      confirmed: data.confirmed ?? 0,
      rejected: data.rejected ?? 0,
    })
  }, [])

  const load = useCallback(async () => {
    const res = await fetch(`/api/comments?status=${status}`, { cache: "no-store" })
    if (!res.ok) return
    setItems((await res.json()) as CommentRow[])
  }, [status])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    void loadCounts()
  }, [loadCounts, status])

  const refreshAll = useCallback(() => {
    void load()
    void loadCounts()
  }, [load, loadCounts])

  async function moderate(id: string, nextStatus: "confirmed" | "rejected") {
    setModeratingKey(`${id}:${nextStatus}`)
    try {
      const res = await fetch(`/api/comments/${id}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) {
        toast.error("Tasdiqlashda xatolik")
        return
      }
      toast.success(nextStatus === "confirmed" ? "Izoh tasdiqlandi" : "Izoh rad etildi")
      refreshAll()
    } finally {
      setModeratingKey(null)
    }
  }

  async function remove(id: string) {
    setDeletingId(id)
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" })
    setDeletingId(null)
    if (!res.ok) return toast.error("O'chirib bo'lmadi")
    toast.success("Izoh o'chirildi")
    refreshAll()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium tracking-tight">Izohlar</h1>
        <p className="text-sm text-muted-foreground">Moderatsiya va ro&apos;yxat</p>
      </div>

      <div
        role="tablist"
        aria-label="Izohlar holati"
        className="flex flex-wrap gap-2 border-b border-border pb-3"
      >
        {(Object.keys(TAB_LABELS) as CommentStatusTab[]).map((key) => {
          const active = status === key
          const count = counts[key]
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStatus(key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {TAB_LABELS[key]}
              <Badge
                variant={active ? "secondary" : "outline"}
                className={cn(
                  "min-w-[1.5rem] justify-center px-1.5 tabular-nums",
                  active && "border-primary-foreground/30 bg-primary-foreground/15 text-primary-foreground"
                )}
              >
                {count}
              </Badge>
            </button>
          )
        })}
      </div>

      <div className="rounded-lg border bg-card/30">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px] font-medium">Yangilik</TableHead>
                <TableHead className="font-medium">Muallif</TableHead>
                <TableHead className="min-w-[200px] font-medium">Matn</TableHead>
                <TableHead className="whitespace-nowrap font-medium">Tasdiqlovchi</TableHead>
                <TableHead className="whitespace-nowrap font-medium">Sana</TableHead>
                <TableHead className="text-right font-medium">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const fullTitle = item.newsTitle?.trim() || item.newsSlug || "—"
                return (
                  <TableRow key={item._id} className="border-b border-border/60">
                    <TableCell className="align-top">
                      <Link
                        href={`/dashboard/news/${item.newsSlug}/edit`}
                        className="text-sm text-primary underline-offset-4 hover:underline"
                        title={fullTitle}
                      >
                        {newsLinkLabel(item)}
                      </Link>
                    </TableCell>
                    <TableCell className="align-top text-sm">{item.userName}</TableCell>
                    <TableCell className="align-top">
                      <p className="max-w-md text-sm text-muted-foreground">{truncateChars(item.content, CONTENT_PREVIEW)}</p>
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs text-primary"
                        onClick={() => setPreview(item)}
                      >
                        To&apos;liq matn
                      </Button>
                    </TableCell>
                    <TableCell className="align-top text-sm text-muted-foreground">
                      {item.confirmedByUserName?.trim() ? (
                        <span title={item.confirmedByUserId}>{item.confirmedByUserName}</span>
                      ) : (
                        <span>—</span>
                      )}
                      {item.confirmedAt ? (
                        <p className="mt-1 text-xs text-muted-foreground/80">
                          {new Date(item.confirmedAt).toLocaleString()}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="align-top text-right">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8"
                          disabled={moderatingKey !== null}
                          onClick={() => void moderate(item._id, "confirmed")}
                        >
                          {moderatingKey === `${item._id}:confirmed` ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            "Tasdiq"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          disabled={moderatingKey !== null}
                          onClick={() => void moderate(item._id, "rejected")}
                        >
                          {moderatingKey === `${item._id}:rejected` ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            "Rad"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={deletingId === item._id}
                          onClick={() => void remove(item._id)}
                        >
                          {deletingId === item._id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            "O'chirish"
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        {items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">Izohlar yo&apos;q.</p>
        ) : null}
      </div>

      <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Izoh matni</DialogTitle>
            {preview ? (
              <p className="text-left text-sm font-normal text-muted-foreground">
                {preview.userName} · {new Date(preview.createdAt).toLocaleString()}
              </p>
            ) : null}
          </DialogHeader>
          {preview ? (
            <div className="space-y-3 text-sm">
              <p className="whitespace-pre-wrap break-words text-foreground">{preview.content}</p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/news/${preview.newsSlug}/edit`}>Yangilikka o&apos;tish</Link>
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
