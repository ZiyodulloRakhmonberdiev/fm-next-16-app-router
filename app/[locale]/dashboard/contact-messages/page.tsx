"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/shared/common/components/ui/badge"
import { Button } from "@/shared/common/components/ui/button"
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
import { cn } from "@/shared/common/lib/utils"
import { Archive, CheckCheck, Eye, Loader2, RotateCcw, Send, Trash2 } from "lucide-react"

type ContactAdminStatus = "new" | "in_progress" | "resolved" | "archived"
type TelegramStatus = "pending" | "sent" | "failed"

type ContactRow = {
  _id: string
  firstName: string
  lastName?: string
  email: string
  phoneCode?: string
  phoneNumber?: string
  message: string
  locale?: string
  adminStatus: ContactAdminStatus
  handledByUserName?: string
  handledAt?: string
  telegramStatus: TelegramStatus
  telegramError?: string
  createdAt: string
}

type Counts = Record<ContactAdminStatus, number>

const STATUS_LABELS: Record<ContactAdminStatus, string> = {
  new: "Yangi",
  in_progress: "Jarayonda",
  resolved: "Yechilgan",
  archived: "Arxiv",
}

const TELEGRAM_LABELS: Record<TelegramStatus, string> = {
  pending: "Kutilmoqda",
  sent: "Yuborildi",
  failed: "Xato",
}

function fullName(row: ContactRow) {
  return [row.firstName, row.lastName].filter(Boolean).join(" ").trim() || "—"
}

function fullPhone(row: ContactRow) {
  return [row.phoneCode, row.phoneNumber].filter(Boolean).join(" ").trim() || "—"
}

export default function DashboardContactMessagesPage() {
  const [items, setItems] = useState<ContactRow[]>([])
  const [counts, setCounts] = useState<Counts>({
    new: 0,
    in_progress: 0,
    resolved: 0,
    archived: 0,
  })
  const [status, setStatus] = useState<ContactAdminStatus>("new")
  const [preview, setPreview] = useState<ContactRow | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)

  const loadCounts = useCallback(async () => {
    const res = await fetch("/api/contact?counts=1", { cache: "no-store" })
    if (!res.ok) return
    const data = (await res.json()) as Partial<Counts>
    setCounts({
      new: data.new ?? 0,
      in_progress: data.in_progress ?? 0,
      resolved: data.resolved ?? 0,
      archived: data.archived ?? 0,
    })
  }, [])

  const load = useCallback(async () => {
    const res = await fetch(`/api/contact?adminStatus=${status}`, { cache: "no-store" })
    if (!res.ok) return
    setItems((await res.json()) as ContactRow[])
  }, [status])

  const refreshAll = useCallback(() => {
    void load()
    void loadCounts()
  }, [load, loadCounts])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    void loadCounts()
  }, [loadCounts])

  async function updateStatus(id: string, adminStatus: ContactAdminStatus) {
    setBusyKey(`status:${id}:${adminStatus}`)
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminStatus }),
      })
      if (!res.ok) {
        toast.error("Statusni saqlab bo'lmadi")
        return
      }
      toast.success("Status yangilandi")
      refreshAll()
    } finally {
      setBusyKey(null)
    }
  }

  async function resendTelegram(id: string) {
    setBusyKey(`telegram:${id}`)
    try {
      const res = await fetch(`/api/contact/${id}/telegram`, { method: "POST" })
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null
        toast.error(json?.error ?? "Telegramga qayta yuborib bo'lmadi")
        return
      }
      toast.success("Telegramga qayta yuborildi")
      refreshAll()
    } finally {
      setBusyKey(null)
    }
  }

  async function remove(id: string) {
    setBusyKey(`delete:${id}`)
    try {
      const res = await fetch(`/api/contact/${id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Xabarni o'chirib bo'lmadi")
        return
      }
      toast.success("Xabar o'chirildi")
      refreshAll()
      if (preview?._id === id) setPreview(null)
    } finally {
      setBusyKey(null)
    }
  }

  const summary = useMemo(
    () => [
      { key: "new", label: "Yangi", value: counts.new },
      { key: "in_progress", label: "Jarayonda", value: counts.in_progress },
      { key: "resolved", label: "Yechilgan", value: counts.resolved },
      { key: "archived", label: "Arxiv", value: counts.archived },
    ],
    [counts]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium tracking-tight">Xabarlar</h1>
        <p className="text-sm text-muted-foreground">Kelgan murojaatlar, Telegram holati va admin boshqaruvi</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((card) => (
          <div key={card.key} className="rounded-xl border bg-card/40 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{card.value}</p>
          </div>
        ))}
      </div>

      <div
        role="tablist"
        aria-label="Contact status"
        className="flex flex-wrap gap-2 border-b border-border pb-3"
      >
        {(Object.keys(STATUS_LABELS) as ContactAdminStatus[]).map((key) => {
          const active = status === key
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
              {STATUS_LABELS[key]}
              <Badge
                variant={active ? "secondary" : "outline"}
                className={cn(
                  "min-w-6 justify-center px-1.5 tabular-nums",
                  active && "border-primary-foreground/30 bg-primary-foreground/15 text-primary-foreground"
                )}
              >
                {counts[key]}
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
                <TableHead>Yuboruvchi</TableHead>
                <TableHead>Aloqa</TableHead>
                <TableHead className="min-w-[260px]">Xabar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Telegram</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Xabar topilmadi
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="align-top">
                      <p className="font-medium">{fullName(item)}</p>
                      <p className="text-xs text-muted-foreground">{item.locale || "—"}</p>
                    </TableCell>
                    <TableCell className="align-top text-sm">
                      <p>{item.email}</p>
                      <p className="text-muted-foreground">{fullPhone(item)}</p>
                    </TableCell>
                    <TableCell className="align-top">
                      <p className="max-w-md text-sm text-muted-foreground line-clamp-3">{item.message}</p>
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs text-primary"
                        onClick={() => setPreview(item)}
                      >
                        To'liq ko'rish
                      </Button>
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge variant={item.adminStatus === "resolved" ? "default" : "outline"}>
                        {STATUS_LABELS[item.adminStatus]}
                      </Badge>
                      {item.handledByUserName ? (
                        <p className="mt-1 text-xs text-muted-foreground">{item.handledByUserName}</p>
                      ) : null}
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge
                        variant={
                          item.telegramStatus === "failed"
                            ? "destructive"
                            : item.telegramStatus === "sent"
                              ? "default"
                              : "outline"
                        }
                      >
                        {TELEGRAM_LABELS[item.telegramStatus]}
                      </Badge>
                      {item.telegramError ? (
                        <p className="mt-1 max-w-[180px] text-xs text-muted-foreground line-clamp-2">
                          {item.telegramError}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          title="Jarayonda"
                          disabled={busyKey !== null}
                          onClick={() => void updateStatus(item._id, "in_progress")}
                        >
                          {busyKey === `status:${item._id}:in_progress` ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          title="Yechildi"
                          disabled={busyKey !== null}
                          onClick={() => void updateStatus(item._id, "resolved")}
                        >
                          {busyKey === `status:${item._id}:resolved` ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <CheckCheck className="size-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          title="Telegramga qayta yuborish"
                          disabled={busyKey !== null}
                          onClick={() => void resendTelegram(item._id)}
                        >
                          {busyKey === `telegram:${item._id}` ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : item.telegramStatus === "sent" ? (
                            <RotateCcw className="size-4" />
                          ) : (
                            <Send className="size-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          title="Arxivlash"
                          disabled={busyKey !== null}
                          onClick={() => void updateStatus(item._id, "archived")}
                        >
                          {busyKey === `status:${item._id}:archived` ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Archive className="size-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          title="O'chirish"
                          disabled={busyKey !== null}
                          onClick={() => void remove(item._id)}
                        >
                          {busyKey === `delete:${item._id}` ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{preview ? fullName(preview) : "Xabar"}</DialogTitle>
          </DialogHeader>
          {preview ? (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Email</p>
                  <p className="mt-1">{preview.email}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Telefon</p>
                  <p className="mt-1">{fullPhone(preview)}</p>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Xabar</p>
                <p className="mt-2 whitespace-pre-wrap leading-7">{preview.message}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void updateStatus(preview._id, "in_progress")}
                  disabled={busyKey !== null}
                >
                  Jarayonda
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void updateStatus(preview._id, "resolved")}
                  disabled={busyKey !== null}
                >
                  Yechildi
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void resendTelegram(preview._id)}
                  disabled={busyKey !== null}
                >
                  Telegramga qayta yuborish
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
