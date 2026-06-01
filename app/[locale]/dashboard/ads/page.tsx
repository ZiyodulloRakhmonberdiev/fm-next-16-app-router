"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/shared/common/components/ui/card"
import { useRouter } from "@/i18n/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { invalidatePublicClientCaches } from "@/features/news/model/invalidate-public-client-cache"
import { Loader2 } from "lucide-react"
import { uploadFileViaPresignedUrl } from "@/shared/infra/cloudinary-client-upload"
import { applyAdItemToForm, emptyForm, type AdItem } from "./_components/ads-dashboard-types"
import { AdsFormActions } from "./_components/ads-form-actions"
import { AdsFormLinksSection } from "./_components/ads-form-links-section"
import { AdsFormMediaSection } from "./_components/ads-form-media-section"
import { AdsFormMetaFields } from "./_components/ads-form-meta-fields"
import { AdsFormOptionalUrls } from "./_components/ads-form-optional-urls"
import { AdsFormPlacementSection } from "./_components/ads-form-placement-section"
import { AdsFormUrlLogo } from "./_components/ads-form-url-logo"
import { AdsList, AdsListCardHeader } from "./_components/ads-list"

function DashboardAdsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
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
    return uploadFileViaPresignedUrl(file, kind)
  }

  async function handleMediaFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    setMediaUploading(true)
    try {
      const file = files[0]
      const ext = (file.name?.split(".").pop() ?? "").toLowerCase()
      const kind = ["mp4", "webm", "ogg", "mov", "m4v"].includes(ext) ? "video" : "image"
      const url = await uploadMedia(file, kind)
      setForm((p) => {
        return { ...p, media: [url] }
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
    if (!form.placements.length) {
      toast.error("Kamida bitta joylashuv (placement) tanlang")
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
        media: [mediaList[0]],
        // Hozircha prioritet va soniya bo'yicha rotation ishlatilmaydi.
        priority: 0,
        displaySeconds: 12,
        type: form.type ?? "content",
        placements: form.placements.length ? form.placements : ["header_top_full"],
        placement: form.placements[0] ?? "header_top_full",
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
    invalidatePublicClientCaches(queryClient)
    router.refresh()
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
      invalidatePublicClientCaches(queryClient)
      router.refresh()
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
      <Card className="overflow-hidden mb-4">
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
          <AdsFormPlacementSection form={form} setForm={setForm} />
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
