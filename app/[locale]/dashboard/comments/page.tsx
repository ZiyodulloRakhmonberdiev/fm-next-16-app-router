"use client"

import { useEffect, useState } from "react"
import { Button } from "@/shared/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/common/components/ui/card"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/common/components/ui/select"
import { Loader2 } from "lucide-react"

type CommentRow = {
  _id: string
  newsSlug: string
  userName: string
  content: string
  status: "pending" | "confirmed" | "rejected" | "approved"
  createdAt: string
  confirmedAt?: string
}

export default function DashboardCommentsPage() {
  const [items, setItems] = useState<CommentRow[]>([])
  const [status, setStatus] = useState<"pending" | "confirmed" | "rejected">("pending")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [moderatingKey, setModeratingKey] = useState<string | null>(null) // "id:confirmed" | "id:rejected"

  async function load() {
    const res = await fetch(`/api/comments?status=${status}`, { cache: "no-store" })
    if (!res.ok) return
    setItems((await res.json()) as CommentRow[])
  }
  useEffect(() => {
    void load()
  }, [status])

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
      void load()
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
    void load()
  }

  return (
    <Card className='p-0 py-4 md:py-6'>
      <CardHeader className='px-4 md:px-6'>
        <CardTitle>Izohlarni moderatsiya qilish</CardTitle>
        <div className="max-w-[220px] mt-2">
          <Select value={status} onValueChange={(v) => setStatus(v as "pending" | "confirmed" | "rejected")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Kutilmoqda</SelectItem>
              <SelectItem value="confirmed">Tasdiqlandi</SelectItem>
              <SelectItem value="rejected">Rad etildi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-2 -mt-3 px-4 md:px-6">
        {items.map((item) => (
          <div key={item._id} className="rounded-md border p-3 space-y-2">
            <p className="text-xs text-muted-foreground">Yangilik: {item.newsSlug}</p>
            <p className="text-sm font-medium">{item.userName}</p>
            <p className="text-xs text-muted-foreground">Sana: {new Date(item.createdAt).toLocaleString()}</p>
            {item.confirmedAt ? (
              <p className="text-xs text-muted-foreground">Tasdiqlangan sana: {new Date(item.confirmedAt).toLocaleString()}</p>
            ) : null}
            <p>{item.content}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={moderatingKey !== null}
                onClick={() => void moderate(item._id, "confirmed")}
              >
                {moderatingKey === `${item._id}:confirmed` ? <Loader2 className="size-4 animate-spin" /> : "Tasdiqlash"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={moderatingKey !== null}
                onClick={() => void moderate(item._id, "rejected")}
              >
                {moderatingKey === `${item._id}:rejected` ? <Loader2 className="size-4 animate-spin" /> : "Rad etish"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={deletingId === item._id}
                onClick={() => void remove(item._id)}
              >
                {deletingId === item._id ? <Loader2 className="size-4 animate-spin" /> : "O'chirish"}
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 ? <p className="text-sm text-muted-foreground">Izohlar yo&apos;q.</p> : null}
      </CardContent>
    </Card>
  )
}
