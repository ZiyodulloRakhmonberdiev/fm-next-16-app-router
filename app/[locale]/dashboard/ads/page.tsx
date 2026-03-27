"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/shared/common/components/ui/card"
import { useRouter } from "@/i18n/navigation"
import { Loader2 } from "lucide-react"
import { uploadVideoViaApiOrCloudinary } from "@/shared/common/lib/cloudinary-client-upload"
import { applyAdItemToForm, emptyForm, type AdItem } from "./_components/ads-dashboard-types"
import { AdsFormActions } from "./_components/ads-form-actions"
import { AdsFormLinksSection } from "./_components/ads-form-links-section"
import { AdsFormMediaSection } from "./_components/ads-form-media-section"
import { AdsFormMetaFields } from "./_components/ads-form-meta-fields"
import { AdsFormOptionalUrls } from "./_components/ads-form-optional-urls"
import { AdsFormUrlLogo } from "./_components/ads-form-url-logo"
import { AdsList, AdsListCardHeader } from "./_components/ads-list"

function DashboardAdsPage() {
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

  const handleEditFromList = useCallback(
    (item: AdItem) => {
      appliedEditFromQuery.current = item._id
      openAdForEdit(item)
      void router.replace(`/dashboard/ads?edit=${encodeURIComponent(item._id)}`)
      window.setTimeout(() => {
        formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 50)
    },
    [openAdForEdit, router]
  )

  const handleCancelEdit = useCallback(() => {
    setEditId(null)
    setForm(emptyForm)
    clearEditQuery()
  }, [clearEditQuery])

  return (
    <div className="w-full min-w-0">
      <div ref={formTopRef} className="" />
      <Card className="overflow-hidden">
        <CardContent className="grid gap-4 px-4 md:grid-cols-2">
          <AdsFormMediaSection
            form={form}
            setForm={setForm}
            mediaUploading={mediaUploading}
            mediaFileRef={mediaFileRef}
            handleMediaFileChange={handleMediaFileChange}
          />
          <AdsFormUrlLogo
            form={form}
            setForm={setForm}
            logoFileRef={logoFileRef}
            handleLogoFileChange={handleLogoFileChange}
          />
          <AdsFormMetaFields form={form} setForm={setForm} />
          <AdsFormLinksSection form={form} setForm={setForm} />
          <AdsFormOptionalUrls form={form} setForm={setForm} />
          <AdsFormActions
            form={form}
            setForm={setForm}
            editId={editId}
            loading={loading}
            onSave={saveAd}
            onCancelEdit={handleCancelEdit}
          />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <AdsListCardHeader />
        <CardContent className="space-y-3 p-4 sm:p-6">
          <AdsList items={items} deletingId={deletingId} onEditItem={handleEditFromList} onRemove={removeAd} />
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
