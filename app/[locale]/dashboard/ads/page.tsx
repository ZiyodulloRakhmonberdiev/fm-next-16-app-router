"use client"

import { useEffect, useRef, useState } from "react"
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
import { Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react"

type AdItem = {
  _id: string
  type: "content" | "image"
  placement: "header_top_full" | "sidebar_widget" | "home_bottom_full" | "article_bottom_full"
  media?: string
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
  media: "",
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

export default function DashboardAdsPage() {
  const t = useTranslations("ads")
  const [items, setItems] = useState<AdItem[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [mediaUploading, setMediaUploading] = useState(false)
  const mediaFileRef = useRef<HTMLInputElement>(null)
  const logoFileRef = useRef<HTMLInputElement>(null)

  async function uploadMedia(file: File, kind: "image" | "video"): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("kind", kind)
    const res = await fetch("/api/uploads", { method: "POST", body: formData })
    const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null
    if (!res.ok || !data?.url) throw new Error(data?.error || "Yuklab bo'lmadi")
    return data.url
  }

  async function handleMediaFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMediaUploading(true)
    try {
      const ext = (file.name?.split(".").pop() ?? "").toLowerCase()
      const kind = ["mp4", "webm", "ogg", "mov", "m4v"].includes(ext) ? "video" : "image"
      const url = await uploadMedia(file, kind)
      setForm((p) => ({ ...p, media: url }))
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

  async function saveAd() {
    if (!form.media.trim()) {
      toast.error("Media majburiy")
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
        priority: Number(form.priority) || 0,
        displaySeconds: Number(form.displaySeconds) || 12,
        type: form.type ?? "content",
        placement: form.placement ?? "header_top_full",
        links: form.links.filter((item) => item.label.trim() && item.href.trim()),
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const err = await res.json().catch(() => null) as {
        error?: string
        issues?: {
          fieldErrors?: Record<string, string[]>
          formErrors?: string[]
        }
      } | null
      const fieldMessages = Object.entries(err?.issues?.fieldErrors ?? {})
        .flatMap(([field, msgs]) => msgs.map((m) => `${field}: ${m}`))
      const formMessages = err?.issues?.formErrors ?? []
      const allMessages = [...fieldMessages, ...formMessages]
      toast.error(err?.error ?? "Saqlab bo'lmadi", {
        description: allMessages.length ? allMessages.join(" | ") : undefined,
      })
      return
    }
    toast.success(editId ? "Reklama yangilandi" : "Reklama yaratildi")
    setForm(emptyForm)
    setEditId(null)
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reklama qo'shish</CardTitle>
          <CardDescription>Reklama ma'lumotlarini kiriting</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {/* 1. Media (majburiy) - URL yoki lokaldan */}
          <div className="space-y-2 md:col-span-2">
            <Label>Reklama media *</Label>
            <div className="flex gap-2">
              <Input
                value={form.media}
                onChange={(e) => setForm((p) => ({ ...p, media: e.target.value }))}
                placeholder="Reklama media URL yoki lokaldan"
                className="flex-1"
              />
              <input
                ref={mediaFileRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleMediaFileChange}
              />
              <Button
                type="button"
                variant="outline"
                disabled={mediaUploading}
                onClick={() => mediaFileRef.current?.click()}
              >
                <Upload className="mr-2 size-4" />
                Reklama media lokalda tanlash
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reklama URL *</Label>
            <Input value={form.adUrl} onChange={(e) => setForm((p) => ({ ...p, adUrl: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Reklama logo *</Label>
            <div className="flex gap-2">
              <Input value={form.logo} onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))} placeholder="URL yoki lokaldan" className="flex-1" />
              <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFileChange} />
              <Button type="button" variant="outline" onClick={() => logoFileRef.current?.click()}>
                <Upload className="size-4" />
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
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Reklama sayt nomi *</Label>
            <Input value={form.siteName} onChange={(e) => setForm((p) => ({ ...p, siteName: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label>Ustuvorlik *</Label>
            <Input type="number" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: Number(e.target.value) }))} />
          </div>
          <div className="space-y-2">
            <Label>Davomiylik *</Label>
            <Input type="number" value={form.displaySeconds} onChange={(e) => setForm((p) => ({ ...p, displaySeconds: Number(e.target.value) }))} min={3} max={120} />
          </div>

          <div className="space-y-2">
            <Label>Reklama tavsifi *</Label>
            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex justify-between items-center">
            <Label>Reklama havolalar (Ixtiyoriy)</Label>
              <Button type="button" size="sm" variant="outline" onClick={() => setForm((p) => ({ ...p, links: [...p.links, { label: "", href: "" }] }))}>
                <Plus className="mr-2 size-4" />
                Havola qo'shish
              </Button>
            </div>
            <div className="space-y-3">
              {form.links.map((link, index) => (
                <div key={index} className="grid gap-2 rounded-md border p-3 md:grid-cols-[1fr_1fr_auto]">
                  <Input value={link.label} placeholder="Link nomi" onChange={(e) => setForm((p) => ({ ...p, links: p.links.map((item, i) => (i === index ? { ...item, label: e.target.value } : item)) }))} />
                  <Input value={link.href} placeholder="Href" onChange={(e) => setForm((p) => ({ ...p, links: p.links.map((item, i) => (i === index ? { ...item, href: e.target.value } : item)) }))} />
                  <Button type="button" size="icon" variant="outline" onClick={() => setForm((p) => ({ ...p, links: p.links.length === 1 ? [{ label: "", href: "" }] : p.links.filter((_, i) => i !== index) }))}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reklama beruvchi haqida (Ixtiyoriy)</Label>
            <Input value={form.advertiserUrl} onChange={(e) => setForm((p) => ({ ...p, advertiserUrl: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Reklama haqida (Ixtiyoriy)</Label>
            <Input value={form.adInfoUrl} onChange={(e) => setForm((p) => ({ ...p, adInfoUrl: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Bizga reklam berish (Ixtiyoriy)</Label>
            <Input value={form.advertiseWithUsUrl} onChange={(e) => setForm((p) => ({ ...p, advertiseWithUsUrl: e.target.value }))} />
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <Label>Faol</Label>
            <Switch checked={form.active} onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))} />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button onClick={() => void saveAd()} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {editId ? "Tahrirlash" : "Qo'shish"}
            </Button>
            {editId ? <Button variant="outline" onClick={() => { setEditId(null); setForm(emptyForm) }}>Bekor qilish</Button> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reklamlar ro'yxati</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reklama nomi</TableHead>
                {/* <TableHead>Turi</TableHead> */}
                <TableHead>Sayt</TableHead>
                {/* <TableHead>{t("placement")}</TableHead> */}
                <TableHead>Faol</TableHead>
                <TableHead>Ustuvorlik</TableHead>
                <TableHead>Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.title}</TableCell>
                  {/* <TableCell>{item.type}</TableCell> */}
                  <TableCell>{item.siteName}</TableCell>
                  {/* <TableCell>{t(`placement_${item.placement}`)}</TableCell> */}
                  <TableCell>{item.active ? "Ha" : "Yo'q"}</TableCell>
                  <TableCell>{item.priority}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditId(item._id)
                        setForm({
                          type: item.type ?? "content",
                          placement: item.placement ?? "header_top_full",
                          media: item.media ?? "",
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
                        })
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={deletingId === item._id}
                      onClick={() => void removeAd(item._id)}
                    >
                      {deletingId === item._id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
