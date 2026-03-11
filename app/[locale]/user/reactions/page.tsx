"use client"

import { useEffect, useState } from "react"
import { Button } from "@/shared/common/components/ui/button"
import { toast } from "sonner"
import { Link } from "@/i18n/navigation"
import { Trash2 } from "lucide-react"
import { useLocale } from "next-intl"

type Row = {
  _id: string
  newsSlug: string
  type: "like" | "love" | "laugh" | "sad" | "angry"
  newsTitle?: Record<string, string>
  createdAt: string
}

export default function MyReactionsPage() {
  const locale = useLocale()
  const [items, setItems] = useState<Row[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const emojiMap: Record<Row["type"], string> = {
    like: "👍",
    love: "❤️",
    laugh: "😂",
    sad: "😢",
    angry: "😡",
  }

  async function load(nextPage = 1) {
    const res = await fetch(`/api/me/reactions?page=${nextPage}&limit=30`, { cache: "no-store" })
    if (!res.ok) return
    const payload = (await res.json()) as { data?: Row[]; meta?: { totalPages?: number } }
    setItems(payload.data ?? [])
    setTotalPages(Math.max(1, payload.meta?.totalPages ?? 1))
    setPage(nextPage)
  }
  useEffect(() => {
    void load(1)
  }, [])

  async function remove(slug: string) {
    const res = await fetch(`/api/news/${slug}/reactions`, { method: "DELETE" })
    if (!res.ok) return toast.error("O'chirib bo'lmadi")
    toast.success("Reaksiya o'chirildi")
    void load(page)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Mening reaksiyalarim</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => (
          <div key={item._id} className="rounded-md border p-3 flex items-center justify-between">
            <div className="space-y-1">
              <Link href={`/news/${item.newsSlug}`} className="text-sm font-medium hover:underline line-clamp-2">
                {item.newsTitle?.[locale] ?? item.newsTitle?.uz ?? item.newsTitle?.uzb ?? item.newsSlug}
              </Link>
              <p className="text-lg">{emojiMap[item.type]}</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => void remove(item.newsSlug)} aria-label="O'chirish">
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">Reaksiyalar yo&apos;q</p> : null}
      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => void load(page - 1)}>
            Oldingi
          </Button>
          <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => void load(page + 1)}>
            Keyingi
          </Button>
        </div>
      ) : null}
    </div>
  )
}
