"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "@/i18n/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/common/components/ui/card"
import { Button } from "@/shared/common/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/common/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/common/components/ui/table"
import { Badge } from "@/shared/common/components/ui/badge"
import { Loader2, Megaphone } from "lucide-react"

type FeedbackRow = {
  _id: string
  adId: string
  action: "hide" | "report"
  reason: string
  placement?: string
  createdAt: string
}

type AdListItem = {
  _id: string
  title: string
  siteName: string
}

type ListResponse = {
  items: FeedbackRow[]
  summary: {
    total: number
    byAction: Record<string, number>
    byReason: Record<string, number>
  }
  meta: {
    reasons: string[]
    placements: string[]
    adIds: string[]
  }
}

const ACTION_ALL = "__all__"
const REASON_ALL = "__all__"
const PLACEMENT_ALL = "__all__"
const AD_ALL = "__all__"

const placementLabels: Record<string, string> = {
  header_top_full: "Yuqori",
  sidebar_widget: "Yon panel",
  home_bottom_full: "Bosh sahifa pasti",
  article_bottom_full: "Maqola pasti",
}

export default function DashboardAdsFeedbackPage() {
  const [data, setData] = useState<ListResponse | null>(null)
  const [ads, setAds] = useState<AdListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState<string>(ACTION_ALL)
  const [reason, setReason] = useState<string>(REASON_ALL)
  const [placement, setPlacement] = useState<string>(PLACEMENT_ALL)
  const [adFilter, setAdFilter] = useState<string>(AD_ALL)

  const buildQuery = useCallback(() => {
    const p = new URLSearchParams()
    if (action !== ACTION_ALL) p.set("action", action)
    if (reason !== REASON_ALL) p.set("reason", reason)
    if (placement !== PLACEMENT_ALL) p.set("placement", placement)
    if (adFilter !== AD_ALL) p.set("adId", adFilter)
    const q = p.toString()
    return q ? `?${q}` : ""
  }, [action, reason, placement, adFilter])

  const loadFeedback = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/ads/feedback${buildQuery()}`, {
        cache: "no-store",
        credentials: "include",
      })
      if (!res.ok) {
        setData(null)
        return
      }
      setData((await res.json()) as ListResponse)
    } finally {
      setLoading(false)
    }
  }, [buildQuery])

  useEffect(() => {
    void loadFeedback()
  }, [loadFeedback])

  useEffect(() => {
    if (!data?.meta.placements) return
    if (placement !== PLACEMENT_ALL && !data.meta.placements.includes(placement)) {
      setPlacement(PLACEMENT_ALL)
    }
  }, [data?.meta.placements, placement])

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/ads", { cache: "no-store", credentials: "include" })
      if (!res.ok) return
      setAds((await res.json()) as AdListItem[])
    })()
  }, [])

  const adsById = useMemo(() => {
    const m = new Map<string, AdListItem>()
    for (const a of ads) {
      m.set(a._id, a)
    }
    return m
  }, [ads])

  const adsSorted = useMemo(() => {
    return [...ads].sort((a, b) => (a.title || "").localeCompare(b.title || "", "uz"))
  }, [ads])

  const topReasons = useMemo(() => {
    if (!data?.summary.byReason) return []
    return Object.entries(data.summary.byReason)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
  }, [data])

  function adLabel(adId: string) {
    const ad = adsById.get(adId)
    if (!ad) return `Noma'lum reklama`
    const parts = [ad.siteName?.trim(), ad.title?.trim()].filter(Boolean)
    return parts.length ? parts.join(" — ") : adId.slice(0, 8) + "…"
  }

  return (
    <Card className="p-0 py-4 md:py-6">
      <CardHeader className="space-y-2 px-4 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Reklama fikrlari</CardTitle>
            <CardDescription className="mt-1">
              Foydalanuvchilar yashirish yoki arz sabablari bo&apos;yicha yuborgan fikrlar. Filtrlar jadvaldagi
              yozuvlar va pastdagi qisqacha statistikaga ta&apos;sir qiladi.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0 gap-2">
            <Link href="/dashboard/ads">
              <Megaphone className="size-4" />
              Reklama e&apos;lonlari
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <div className="min-w-[160px] space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Amal</p>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Amal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ACTION_ALL}>Barchasi</SelectItem>
                <SelectItem value="hide">Yashirish</SelectItem>
                <SelectItem value="report">Arz qilish</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[200px] flex-1 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Sabab</p>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full min-w-[200px] max-w-[320px]">
                <SelectValue placeholder="Sabab" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={REASON_ALL}>Barcha sabablar</SelectItem>
                {(data?.meta.reasons ?? []).map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[180px] space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Joylashuv</p>
            <Select value={placement} onValueChange={setPlacement}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Joylashuv" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PLACEMENT_ALL}>Barcha joylar</SelectItem>
                {(data?.meta.placements ?? []).map((pl) => (
                  <SelectItem key={pl} value={pl}>
                    {placementLabels[pl] ?? pl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[220px] max-w-[min(100%,360px)] flex-1 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Reklama</p>
            <Select value={adFilter} onValueChange={setAdFilter}>
              <SelectTrigger className="w-full min-w-[220px]">
                <SelectValue placeholder="Reklama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AD_ALL}>Barcha reklamalar</SelectItem>
                {adsSorted.map((ad) => (
                  <SelectItem key={ad._id} value={ad._id}>
                    <span className="line-clamp-1">
                      {ad.siteName ? `${ad.siteName} — ` : ""}
                      {ad.title || ad._id.slice(0, 8)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="secondary" size="sm" onClick={() => void loadFeedback()} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Yangilash"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-4 md:px-6">
        {loading && !data ? (
          <div className="flex justify-center py-12 text-muted-foreground">
            <Loader2 className="size-8 animate-spin" />
          </div>
        ) : null}

        {data ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Jami (filtr)</p>
                <p className="text-2xl font-semibold tabular-nums">{data.summary.total}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Yashirish</p>
                <p className="text-2xl font-semibold tabular-nums">{data.summary.byAction.hide ?? 0}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Arz qilish</p>
                <p className="text-2xl font-semibold tabular-nums">{data.summary.byAction.report ?? 0}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Turli sabablar (filtr)</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {Object.keys(data.summary.byReason).length}
                </p>
              </div>
            </div>

            {topReasons.length > 0 ? (
              <div>
                <p className="mb-2 text-sm font-medium">Sabablar bo&apos;yicha (filtr natijasi)</p>
                <div className="flex flex-wrap gap-2">
                  {topReasons.map(([label, count]) => (
                    <Badge key={label} variant="secondary" className="gap-1.5 py-1 font-normal">
                      <span>{label}</span>
                      <span className="tabular-nums text-muted-foreground">×{count}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sana</TableHead>
                    <TableHead>Amal</TableHead>
                    <TableHead>Sabab</TableHead>
                    <TableHead>Joylashuv</TableHead>
                    <TableHead className="min-w-[200px]">Reklama</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Ma&apos;lumot yo&apos;q
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.items.map((row) => (
                      <TableRow key={row._id}>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(row.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.action === "report" ? "destructive" : "outline"}>
                            {row.action === "hide" ? "Yashirish" : "Arz"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[280px]">{row.reason}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.placement
                            ? placementLabels[row.placement] ?? row.placement
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/dashboard/ads?edit=${encodeURIComponent(row.adId)}`}
                            className="font-medium text-primary underline-offset-4 hover:underline"
                          >
                            {adLabel(row.adId)}
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        ) : !loading ? (
          <p className="text-center text-sm text-muted-foreground">Yuklab bo&apos;lmadi yoki ruxsat yo&apos;q.</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
