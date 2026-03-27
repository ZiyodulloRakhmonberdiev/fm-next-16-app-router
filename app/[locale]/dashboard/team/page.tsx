"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/common/components/ui/card"
import { Button } from "@/shared/common/components/ui/button"
import { Input } from "@/shared/common/components/ui/input"
import { Label } from "@/shared/common/components/ui/label"
import { toast } from "sonner"
import { TeamTable } from "./_components/team-table"
import { TeamDeleteDialog } from "./_components/team-delete-dialog"
import { emptyForm, type TeamForm, type TeamRow } from "./_components/team-types"

export default function DashboardTeamPage() {
  const [items, setItems] = useState<TeamRow[]>([])
  const [form, setForm] = useState<TeamForm>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState<"image" | "qr" | "badge" | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const qrInputRef = useRef<HTMLInputElement | null>(null)
  const badgeInputRef = useRef<HTMLInputElement | null>(null)

  async function load() {
    const res = await fetch("/api/team", { cache: "no-store" })
    if (!res.ok) return
    const raw = (await res.json()) as (TeamRow & { order?: unknown })[]
    setItems(
      raw.map((m) => {
        const cert =
          typeof m.certificateNumber === "string"
            ? m.certificateNumber
            : typeof m.order === "string"
              ? m.order
              : String(m.order ?? "")
        return { ...m, order: cert, certificateNumber: cert }
      })
    )
  }

  useEffect(() => {
    void load()
  }, [])

  async function save() {
    if (!form.fullName.trim() || !form.position.trim()) {
      toast.error("Ism va lavozim majburiy")
      return
    }
    setLoading(true)
    const url = editId ? `/api/team/${editId}` : "/api/team"
    const method = editId ? "PATCH" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        certificateNumber: String(form.certificateNumber ?? ""),
        fullName: form.fullName.trim(),
        position: form.position.trim(),
        image: form.image?.trim() || undefined,
        qrCode: form.qrCode?.trim() || undefined,
        badgeImage: form.badgeImage?.trim() || undefined,
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const errBody = (await res.json().catch(() => null)) as {
        error?: string
        issues?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] }
      } | null
      const fieldMsgs = errBody?.issues?.fieldErrors
        ? Object.values(errBody.issues.fieldErrors).flat()
        : []
      const formMsgs = errBody?.issues?.formErrors ?? []
      const detail = [...fieldMsgs, ...formMsgs].filter(Boolean).join(" · ")
      toast.error(detail || errBody?.error || "Saqlab bo'lmadi")
      return
    }
    toast.success(editId ? "Team a'zo yangilandi" : "Team a'zo qo'shildi")
    setForm(emptyForm)
    setEditId(null)
    void load()
  }

  async function remove(id: string) {
    const res = await fetch(`/api/team/${id}`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("O'chirib bo'lmadi")
      return
    }
    toast.success("O'chirildi")
    setDeleteTargetId(null)
    void load()
  }

  async function handleUpload(kind: "image" | "qr" | "badge", file?: File | null) {
    if (!file) return
    setUploadingImage(kind)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("kind", "image")
      const res = await fetch("/api/uploads", { method: "POST", body: formData })
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null
      const uploadedUrl = data?.url
      if (!res.ok || !uploadedUrl) {
        toast.error(data?.error || "Rasmni yuklab bo'lmadi")
        return
      }
      if (kind === "image") {
        setForm((p) => ({ ...p, image: uploadedUrl }))
      } else if (kind === "qr") {
        setForm((p) => ({ ...p, qrCode: uploadedUrl }))
      } else {
        setForm((p) => ({ ...p, badgeImage: uploadedUrl }))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rasmni yuklab bo'lmadi")
    } finally {
      setUploadingImage(null)
    }
  }

  return (
    <Card className="p-0 py-4 md:py-6">
      <CardHeader className="px-4 md:px-6">
        <CardTitle>Team a'zolari</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-4 md:px-6">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="team-certificate">Guvohnoma raqami</Label>
            <Input
              id="team-certificate"
              type="text"
              inputMode="text"
              value={form.certificateNumber}
              maxLength={24}
              autoComplete="off"
              onChange={(e) =>
                setForm((p) => ({ ...p, certificateNumber: e.target.value }))
              }
              placeholder="Raqam"
            />
            <p className="text-xs text-muted-foreground">Maksimal 24 belgi</p>
          </div>
          <div className="space-y-2">
            <Label>Ism familiya</Label>
            <Input
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Lavozim</Label>
            <Input
              value={form.position}
              onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Rasm</Label>
            <div className="flex gap-2">
              <Input
                value={form.image}
                onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                placeholder="Rasm URL"
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  void handleUpload("image", file)
                  e.target.value = ""
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingImage === "image"}
                onClick={() => imageInputRef.current?.click()}
              >
                Localdan
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>QR code</Label>
            <div className="flex gap-2">
              <Input
                value={form.qrCode}
                onChange={(e) => setForm((p) => ({ ...p, qrCode: e.target.value }))}
                placeholder="QR URL"
              />
              <input
                ref={qrInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  void handleUpload("qr", file)
                  e.target.value = ""
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingImage === "qr"}
                onClick={() => qrInputRef.current?.click()}
              >
                Localdan
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Badge image</Label>
            <div className="flex gap-2">
              <Input
                value={form.badgeImage}
                onChange={(e) => setForm((p) => ({ ...p, badgeImage: e.target.value }))}
                placeholder="Badge URL"
              />
              <input
                ref={badgeInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  void handleUpload("badge", file)
                  e.target.value = ""
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingImage === "badge"}
                onClick={() => badgeInputRef.current?.click()}
              >
                Localdan
              </Button>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => void save()} disabled={loading}>
            {editId ? "Yangilash" : "Qo'shish"}
          </Button>
          {editId && (
            <Button
              variant="outline"
              onClick={() => {
                setEditId(null)
                setForm(emptyForm)
              }}
            >
              Bekor qilish
            </Button>
          )}
        </div>

        <TeamTable
          items={items}
          onEdit={(id, nextForm) => {
            setEditId(id)
            setForm(nextForm)
          }}
          onDelete={setDeleteTargetId}
        />

        <TeamDeleteDialog
          open={deleteTargetId !== null}
          onOpenChange={(open) => !open && setDeleteTargetId(null)}
          onConfirm={() => deleteTargetId && void remove(deleteTargetId)}
        />
      </CardContent>
    </Card>
  )
}