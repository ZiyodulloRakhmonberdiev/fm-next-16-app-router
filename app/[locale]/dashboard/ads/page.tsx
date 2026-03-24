"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/common/components/ui/card"
import { Input } from "@/shared/common/components/ui/input"
import { Label } from "@/shared/common/components/ui/label"
import { Button } from "@/shared/common/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/common/components/ui/select"
import { Switch } from "@/shared/common/components/ui/switch"
import { Textarea } from "@/shared/common/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/common/components/ui/table"
import { Link, useRouter } from "@/i18n/navigation"
import { Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react"
import { uploadVideoViaApiOrCloudinary } from "@/shared/common/lib/cloudinary-client-upload"

type AdItem = {
  _id: string
  type: "content" | "image"
  placement: "header_top_full" | "sidebar_widget" | "home_bottom_full" | "article_bottom_full"
  media?: string | string[]
  mediaMobile?: string | string[]
  logo?: string
  siteName: string
  title: string
  description?: string
  links?: Array<{ label: string; href: string }>
  adUrl?: string
  advertiserUrl?: string
  adInfoUrl?: string
  advertiseWithUsUrl?: string
  active: boolean
  priority: number
  displaySeconds: number
}

const placementKeys: AdItem["placement"][] = ["header_top_full", "sidebar_widget", "home_bottom_full", "article_bottom_full"]
const adTypes: AdItem["type"][] = ["content", "image"]

const emptyForm = {
  type: "content" as AdItem["type"],
  placement: "header_top_full" as AdItem["placement"],
  media: [""] as string[],
  logo: "",
  siteName: "",
  title: "",
  description: "",
  links: [{ label: "", href: "" }],
  adUrl: "",
  advertiserUrl: "",
  adInfoUrl: "",
  advertiseWithUsUrl: "",
  active: true,
  priority: 1,
  displaySeconds: 12,
}

function applyAdItemToForm(item: AdItem) {
  return {
    type: item.type ?? "content",
    placement: item.placement ?? "header_top_full",
    media: Array.isArray(item.media) ? item.media : item.media ? [item.media] : [""],
    logo: item.logo ?? "",
    siteName: item.siteName ?? "",
    title: item.title ?? "",
    description: item.description ?? "",
    links: item.links?.length ? item.links : [{ label: "", href: "" }],
    adUrl: item.adUrl ?? "",
    advertiserUrl: item.advertiserUrl ?? "",
    adInfoUrl: item.adInfoUrl ?? "",
    advertiseWithUsUrl: item.advertiseWithUsUrl ?? "",
    active: item.active,
    priority: item.priority ?? 0,
    displaySeconds: item.displaySeconds ?? 12,
  }
}

function DashboardAdsPage() {
  const t = useTranslations("ads")
  const router = useRouter()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<AdItem[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [mediaUploading, setMediaUploading] = useState(false)
  const mediaFileRef = useRef<HTMLInputElement>(null)
  const logoFileRef = useRef<HTMLInputElement>(null)
  const formTopRef = useRef<HTMLDivElement>(null)
  const appliedEditFromQuery = useRef<string | null>(null)

  const clearEditQuery = useCallback(() => {
    appliedEditFromQuery.current = null
    router.replace("/dashboard/ads")
  }, [router])

  const openAdForEdit = useCallback((item: AdItem) => {
    setEditId(item._id)
    setForm(applyAdItemToForm(item))
  }, [])

  async function uploadMedia(file: File, kind: "image" | "video"): Promise<string> {
    if (kind === "video") {
      return uploadVideoViaApiOrCloudinary(file, { credentials: "include" })
    }
    const formData = new FormData()
    formData.append("file", file)
    formData.append("kind", kind)
    const res = await fetch("/api/uploads", { method: "POST", credentials: "include", body: formData })
    const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null
    if (!res.ok || !data?.url) throw new Error(data?.error || "Yuklab bo'lmadi")
    return data.url
  }

  async function handleMediaFileChange(e: React.ChangeEvent<HTMLInputElement>, atIndex?: number) {
    const files = e.target.files
    if (!files?.length) return
    const maxNew = 10 - (form.media.length - (form.media.filter(Boolean).length ? 0 : 1))
    if (maxNew <= 0) {
      toast.error("Maksimum 10 ta media")
      return
    }
    setMediaUploading(true)
    try {
      const urls: string[] = []
      for (let i = 0; i < Math.min(files.length, maxNew); i++) {
        const file = files[i]
        const ext = (file.name?.split(".").pop() ?? "").toLowerCase()
        const kind = ["mp4", "webm", "ogg", "mov", "m4v"].includes(ext) ? "video" : "image"
        const url = await uploadMedia(file, kind)
        urls.push(url)
      }
      setForm((p) => {
        const list = [...p.media]
        const filled = list.filter(Boolean)
        if (atIndex !== undefined && atIndex >= 0 && atIndex < list.length) {
          list[atIndex] = urls[0] ?? ""
          return { ...p, media: list }
        }
        const newList = filled.length ? [...filled, ...urls] : [urls[0] ?? "", ...urls.slice(1)]
        return { ...p, media: newList.slice(0, 10) }
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Media yuklab bo'lmadi")
    } finally {
      setMediaUploading(false)
      e.target.value = ""
    }
  }

  async function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadMedia(file, "image")
      setForm((p) => ({ ...p, logo: url }))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Logo yuklab bo'lmadi")
    } finally {
      e.target.value = ""
    }
  }

  async function loadAds() {
    const res = await fetch("/api/ads", { cache: "no-store" })
    if (!res.ok) {
      toast.error("Reklamalarni yuklab bo'lmadi")
      return
    }
    setItems((await res.json()) as AdItem[])
  }

  useEffect(() => {
    void loadAds()
  }, [])

  useEffect(() => {
    const id = searchParams.get("edit")?.trim()
    if (!id) {
      appliedEditFromQuery.current = null
      return
    }
    if (!items.length) return
    if (appliedEditFromQuery.current === id) return
    const item = items.find((x) => x._id === id)
    if (!item) return
    appliedEditFromQuery.current = id
    openAdForEdit(item)
    window.setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }, [searchParams, items, openAdForEdit])

  async function saveAd() {
    const mediaList = form.media.filter(Boolean)
    if (!mediaList.length) {
      toast.error("Kamida bitta media majburiy")
      return
    }
    if (mediaList.length > 10) {
      toast.error("Maksimum 10 ta media")
      return
    }
    if (!form.adUrl?.trim()) {
      toast.error("Reklama URL majburiy")
      return
    }
    if (!form.title.trim()) {
      toast.error("Sarlavha majburiy")
      return
    }
    if (!form.description?.trim()) {
      toast.error("Tavsif majburiy")
      return
    }
    if (!form.logo?.trim()) {
      toast.error("Logo majburiy")
      return
    }
    if (!form.siteName?.trim()) {
      toast.error("Sayt nomi majburiy")
      return
    }
    setLoading(true)
    const url = editId ? `/api/ads/${editId}` : "/api/ads"
    const method = editId ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        media: mediaList,
        priority: Number(form.priority) || 0,
        displaySeconds: Number(form.displaySeconds) || 12,
        type: form.type ?? "content",
        placement: form.placement ?? "header_top_full",
        links: form.links.filter((item) => item.label.trim() && item.href.trim()),
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as {
        error?: string
        issues?: {
          fieldErrors?: Record<string, string[]>
          formErrors?: string[]
        }
      } | null
      const fieldMessages = Object.entries(err?.issues?.fieldErrors ?? {}).flatMap(([field, msgs]) =>
        (msgs ?? []).map((m) => `${field}: ${m}`)
      )
      const formMessages = err?.issues?.formErrors ?? []
      const allMessages = [...fieldMessages, ...formMessages]
      const description = allMessages.length ? allMessages.join(" | ") : err?.error
      toast.error(err?.error ?? "Saqlab bo'lmadi", { description: description || undefined })
      return
    }
    toast.success(editId ? "Reklama yangilandi" : "Reklama yaratildi")
    setForm(emptyForm)
    setEditId(null)
    clearEditQuery()
    void loadAds()
  }

  async function removeAd(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/ads/${id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("O'chirib bo'lmadi")
        return
      }
      toast.success("Reklama o'chirildi")
      void loadAds()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      <div ref={formTopRef} className="scroll-mt-4" />
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-3 space-y-0 px-4 py-4 sm:px-6 sm:py-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <CardTitle className="text-lg sm:text-xl">Reklama qo'shish</CardTitle>
            <CardDescription className="text-pretty">Reklama ma'lumotlarini kiriting</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="w-full shrink-0 sm:w-auto" asChild>
            <Link href="/dashboard/ads/feedback">Reklama fikrlari</Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 p-4 sm:p-6 md:grid-cols-2">
          {/* 1. Media (1–10 ta) - URL yoki lokaldan; davomiylik ular orasida teng taqsimlanadi */}
          <div className="space-y-2 md:col-span-2">
            <Label>Reklama media (1–10 ta) *</Label>
            <p className="text-xs text-muted-foreground">
              Davomiylik barcha rasmlar/videolar orasida teng bo&#39;lib taqsimlanadi.
            </p>
            <p className="text-xs text-muted-foreground">
              Tavsiya: banner 728×90 px yoki 16:9 nisbat; rasm/video sloyda <strong>object-cover</strong> bilan kesiladi (o&#39;lcham moslashtiriladi).
            </p>
            <div className="space-y-3">
              {form.media.map((url, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      value={url}
                      onChange={(e) => setForm((p) => ({ ...p, media: p.media.map((u, i) => (i === index ? e.target.value : u)) }))}
                      placeholder={`Media ${index + 1} URL`}
                      className="min-w-0 flex-1"
                    />
                    <input
                    ref={index === 0 ? mediaFileRef : null}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(ev) => handleMediaFileChange(ev, index)}
                    data-media-index={index}
                  />
                    <div className="flex shrink-0 gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10 shrink-0 sm:size-9"
                    disabled={mediaUploading}
                    onClick={() => {
                      const input = index === 0 ? mediaFileRef.current : document.querySelector<HTMLInputElement>(`input[data-media-index="${index}"]`)
                      input?.click()
                    }}
                    title="Yuklash"
                  >
                    <Upload className="size-4" />
                  </Button>
                  {form.media.length > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-10 shrink-0 sm:size-9"
                      onClick={() => setForm((p) => ({ ...p, media: p.media.filter((_, i) => i !== index) }))}
                      title="O'chirish"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                    </div>
                  </div>
                  {url.trim() ? (
                    <div className="h-20 w-full max-w-full overflow-hidden rounded-md border bg-muted sm:max-w-[320px]">
                      {/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url.trim()) ? (
                        <video src={url.trim()} className="h-full w-full object-cover" muted playsInline />
                      ) : (
                        <img src={url.trim()} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
              {form.media.length < 10 ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    id="add-media-file"
                    multiple
                    onChange={(e) => handleMediaFileChange(e)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center sm:w-auto"
                    disabled={mediaUploading}
                    onClick={() => document.getElementById("add-media-file")?.click()}
                  >
                    <Plus className="mr-2 size-4 shrink-0" />
                    Media qo&#39;shish (lokal)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center sm:w-auto"
                    onClick={() => setForm((p) => ({ ...p, media: [...p.media, ""] }))}
                  >
                    <Plus className="mr-2 size-4 shrink-0" />
                    URL qo&#39;shish
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reklama URL *</Label>
            <Input
              value={form.adUrl}
              onChange={(e) => setForm((p) => ({ ...p, adUrl: e.target.value }))}
              placeholder="https://..."
              className="min-w-0"
            />
          </div>
          <div className="space-y-2">
            <Label>Reklama logo *</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input value={form.logo} onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))} placeholder="URL yoki lokaldan" className="min-w-0 flex-1" />
              <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFileChange} />
              <Button
                type="button"
                variant="outline"
                className="w-full shrink-0 justify-center gap-2 sm:w-auto sm:justify-center"
                title="Logo yuklash"
                onClick={() => logoFileRef.current?.click()}
              >
                <Upload className="size-4 shrink-0" />
                <span className="sm:hidden">Yuklash</span>
              </Button>
            </div>
          </div>
          {/* 3. Reklama turi (majburiy) */}
          {/* <div className="space-y-2">
            <Label>{t("ad_type")} *</Label>
            <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as AdItem["type"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {adTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>
          </div> */}
          {/* <div className="space-y-2">
            <Label>{t("placement")} *</Label>
            <Select
              value={form.placement}
              onValueChange={(v) => setForm((p) => ({ ...p, placement: v as AdItem["placement"] }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {placementKeys.map((p) => (
                  <SelectItem key={p} value={p}>{t(`placement_${p}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
          <div className="space-y-2">
            <Label>Reklama nomi *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="min-w-0"
            />
          </div>
          <div className="space-y-2">
            <Label>Reklama sayt nomi *</Label>
            <Input
              value={form.siteName}
              onChange={(e) => setForm((p) => ({ ...p, siteName: e.target.value }))}
              className="min-w-0"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
            <div className="space-y-2">
              <Label>Ustuvorlik *</Label>
              <Input
                type="number"
                inputMode="numeric"
                className="min-w-0"
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Davomiylik *</Label>
              <Input
                type="number"
                inputMode="numeric"
                className="min-w-0"
                value={form.displaySeconds}
                onChange={(e) => setForm((p) => ({ ...p, displaySeconds: Number(e.target.value) }))}
                min={3}
                max={120}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reklama tavsifi *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="min-h-[100px] min-w-0 resize-y"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Label className="text-base sm:text-sm">Reklama havolalar (Ixtiyoriy)</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full shrink-0 sm:w-auto"
                onClick={() => setForm((p) => ({ ...p, links: [...p.links, { label: "", href: "" }] }))}
              >
                <Plus className="mr-2 size-4 shrink-0" />
                Havola qo'shish
              </Button>
            </div>
            <div className="space-y-3">
              {form.links.map((link, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-2 rounded-md border p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                >
                  <Input
                    value={link.label}
                    placeholder="Link nomi"
                    className="min-w-0"
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        links: p.links.map((item, i) => (i === index ? { ...item, label: e.target.value } : item)),
                      }))
                    }
                  />
                  <Input
                    value={link.href}
                    placeholder="Href"
                    className="min-w-0"
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        links: p.links.map((item, i) => (i === index ? { ...item, href: e.target.value } : item)),
                      }))
                    }
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="size-10 justify-self-start sm:justify-self-auto"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        links: p.links.length === 1 ? [{ label: "", href: "" }] : p.links.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reklama beruvchi haqida (Ixtiyoriy)</Label>
            <Input
              value={form.advertiserUrl}
              onChange={(e) => setForm((p) => ({ ...p, advertiserUrl: e.target.value }))}
              className="min-w-0"
            />
          </div>
          <div className="space-y-2">
            <Label>Reklama haqida (Ixtiyoriy)</Label>
            <Input
              value={form.adInfoUrl}
              onChange={(e) => setForm((p) => ({ ...p, adInfoUrl: e.target.value }))}
              className="min-w-0"
            />
          </div>
          <div className="space-y-2">
            <Label>Bizga reklam berish (Ixtiyoriy)</Label>
            <Input
              value={form.advertiseWithUsUrl}
              onChange={(e) => setForm((p) => ({ ...p, advertiseWithUsUrl: e.target.value }))}
              className="min-w-0"
            />
          </div>
          <div className="flex min-h-11 items-center justify-between gap-3 rounded-md border px-3 py-2.5 sm:py-2 md:col-span-2">
            <Label htmlFor="ad-active-switch" className="cursor-pointer">
              Faol
            </Label>
            <Switch
              id="ad-active-switch"
              checked={form.active}
              onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap md:col-span-2">
            <Button onClick={() => void saveAd()} disabled={loading} className="w-full gap-2 sm:w-auto">
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {editId ? "Tahrirlash" : "Qo'shish"}
            </Button>
            {editId ? (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  setEditId(null)
                  setForm(emptyForm)
                  clearEditQuery()
                }}
              >
                Bekor qilish
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
          <CardTitle className="text-lg sm:text-xl">Reklamlar ro'yxati</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 sm:p-6">
          <div className="md:hidden">
            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Reklama yo&apos;q</p>
            ) : (
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item._id}
                    className="rounded-lg border bg-card p-4 shadow-sm"
                  >
                    <p className="font-medium leading-snug">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.siteName}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Faol: {item.active ? "Ha" : "Yo'q"}</span>
                      <span>Ustuvorlik: {item.priority}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="min-h-10 flex-1 gap-2"
                        onClick={() => {
                          appliedEditFromQuery.current = item._id
                          openAdForEdit(item)
                          void router.replace(`/dashboard/ads?edit=${encodeURIComponent(item._id)}`)
                          window.setTimeout(() => {
                            formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                          }, 50)
                        }}
                      >
                        <Pencil className="size-4 shrink-0" />
                        Tahrirlash
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="min-h-10 flex-1 gap-2"
                        disabled={deletingId === item._id}
                        onClick={() => void removeAd(item._id)}
                      >
                        {deletingId === item._id ? (
                          <Loader2 className="size-4 shrink-0 animate-spin" />
                        ) : (
                          <Trash2 className="size-4 shrink-0" />
                        )}
                        O&apos;chirish
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="hidden md:block md:overflow-x-auto md:rounded-md md:border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reklama nomi</TableHead>
                  <TableHead>Sayt</TableHead>
                  <TableHead>Faol</TableHead>
                  <TableHead>Ustuvorlik</TableHead>
                  <TableHead className="w-[120px]">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Reklama yo&apos;q
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="max-w-[200px] truncate font-medium">{item.title}</TableCell>
                      <TableCell className="max-w-[160px] truncate">{item.siteName}</TableCell>
                      <TableCell>{item.active ? "Ha" : "Yo'q"}</TableCell>
                      <TableCell>{item.priority}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-9 shrink-0"
                            title="Tahrirlash"
                            onClick={() => {
                              appliedEditFromQuery.current = item._id
                              openAdForEdit(item)
                              void router.replace(`/dashboard/ads?edit=${encodeURIComponent(item._id)}`)
                              window.setTimeout(() => {
                                formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                              }, 50)
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-9 shrink-0"
                            title="O'chirish"
                            disabled={deletingId === item._id}
                            onClick={() => void removeAd(item._id)}
                          >
                            {deletingId === item._id ? (
                              <Loader2 className="size-4 animate-spin" />
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
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardAdsPageWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
        </div>
      }
    >
      <DashboardAdsPage />
    </Suspense>
  )
}
