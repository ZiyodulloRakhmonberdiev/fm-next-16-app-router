"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/common/components/ui/card"
import { Button } from "@/shared/common/components/ui/button"
import { Input } from "@/shared/common/components/ui/input"
import { Label } from "@/shared/common/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/common/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/common/components/ui/dialog"
import { toast } from "sonner"

type TeamRow = {
  _id: string
  order: number
  image?: string
  fullName: string
  position: string
  qrCode?: string
  badgeImage?: string
}

const emptyForm: Omit<TeamRow, "_id"> = {
  order: 0,
  image: "",
  fullName: "",
  position: "",
  qrCode: "",
  badgeImage: "",
}

export default function DashboardTeamPage() {
  const [items, setItems] = useState<TeamRow[]>([])
  const [form, setForm] = useState(emptyForm)
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
    setItems((await res.json()) as TeamRow[])
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
        ...form,
        order: Number(form.order) || 0,
        image: form.image?.trim() || undefined,
        qrCode: form.qrCode?.trim() || undefined,
        badgeImage: form.badgeImage?.trim() || undefined,
      }),
    })
    setLoading(false)
    if (!res.ok) {
      toast.error("Saqlab bo'lmadi")
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
      const res = await fetch("/api/uploads", { method: "POST", credentials: "include", body: formData })
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null
      if (!res.ok || !data?.url) {
        toast.error(data?.error || "Rasmni yuklab bo'lmadi")
        return
      }
      if (kind === "image") {
        setForm((p) => ({ ...p, image: data.url }))
      } else if (kind === "qr") {
        setForm((p) => ({ ...p, qrCode: data.url }))
      } else {
        setForm((p) => ({ ...p, badgeImage: data.url }))
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
            <Label>Order</Label>
            <Input
              type="number"
              value={form.order}
              onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
            />
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

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Rasm</TableHead>
                <TableHead>Ism</TableHead>
                <TableHead>Lavozim</TableHead>
                <TableHead>QR</TableHead>
                <TableHead>Badge</TableHead>
                <TableHead>Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((m) => (
                <TableRow key={m._id}>
                  <TableCell>{m.order}</TableCell>
                  <TableCell>{m.image ? <span className="text-xs text-muted-foreground">Rasm bor</span> : "-"}</TableCell>
                  <TableCell>{m.fullName}</TableCell>
                  <TableCell>{m.position}</TableCell>
                  <TableCell>{m.qrCode ? "Bor" : "-"}</TableCell>
                  <TableCell>{m.badgeImage ? "Bor" : "-"}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditId(m._id)
                        setForm({
                          order: m.order,
                          image: m.image ?? "",
                          fullName: m.fullName,
                          position: m.position,
                          qrCode: m.qrCode ?? "",
                          badgeImage: m.badgeImage ?? "",
                        })
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTargetId(m._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={deleteTargetId !== null} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
          <DialogContent showCloseButton={true}>
            <DialogHeader>
              <DialogTitle>O&apos;chirishni tasdiqlaysizmi?</DialogTitle>
              <DialogDescription>
                Bu team a&apos;zosini ro&apos;yxatdan o&apos;chiradi. Amalni qaytarib bo&apos;lmaydi.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton={false}>
              <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
                Bekor qilish
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteTargetId && void remove(deleteTargetId)}
              >
                O&apos;chirish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}