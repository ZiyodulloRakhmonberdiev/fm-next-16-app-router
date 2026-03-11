"use client"

import { useEffect, useState } from "react"
import { Button } from "@/shared/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/common/components/ui/card"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/common/components/ui/select"

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

  async function load() {
    const res = await fetch(`/api/comments?status=${status}`, { cache: "no-store" })
    if (!res.ok) return
    setItems((await res.json()) as CommentRow[])
  }
  useEffect(() => {
    void load()
  }, [status])

  async function moderate(id: string, nextStatus: "confirmed" | "rejected") {
    const res = await fetch(`/api/comments/${id}/moderate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    })
    if (!res.ok) return toast.error("Tasdiqlashda xatolik")
    toast.success(nextStatus === "confirmed" ? "Izoh tasdiqlandi" : "Izoh rad etildi")
    void load()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Izohlarni moderatsiya qilish</CardTitle>
        <div className="max-w-[220px]">
          <Select value={status} onValueChange={(v) => setStatus(v as "pending" | "confirmed" | "rejected")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">pending</SelectItem>
              <SelectItem value="confirmed">confirmed</SelectItem>
              <SelectItem value="rejected">rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="rounded-md border p-3 space-y-2">
            <p className="text-xs text-muted-foreground">Yangilik: {item.newsSlug}</p>
            <p className="text-sm font-medium">{item.userName}</p>
            <p className="text-xs text-muted-foreground">createdAt: {new Date(item.createdAt).toLocaleString()}</p>
            {item.confirmedAt ? (
              <p className="text-xs text-muted-foreground">confirmedAt: {new Date(item.confirmedAt).toLocaleString()}</p>
            ) : null}
            <p>{item.content}</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => void moderate(item._id, "confirmed")}>Confirm</Button>
              <Button size="sm" variant="outline" onClick={() => void moderate(item._id, "rejected")}>Reject</Button>
            </div>
          </div>
        ))}
        {items.length === 0 ? <p className="text-sm text-muted-foreground">Izohlar yo&apos;q.</p> : null}
      </CardContent>
    </Card>
  )
}
