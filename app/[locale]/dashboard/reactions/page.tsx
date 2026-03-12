"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/common/components/ui/card"
import { Button } from "@/shared/common/components/ui/button"
import { Input } from "@/shared/common/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/common/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/common/components/ui/table"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Link } from "@/i18n/navigation"

type ReactionType = "like" | "love" | "laugh" | "sad" | "angry"

type ReactionRow = {
  _id: string
  newsSlug: string
  userId?: string
  anonId?: string
  userName: string
  type: ReactionType
  createdAt: string
}

type ApiResponse = {
  data: ReactionRow[]
  meta: { total: number; page: number; limit: number; totalPages: number }
  count: number
}

const reactionOptions: ReactionType[] = ["like", "love", "laugh", "sad", "angry"]

export default function DashboardReactionsPage() {
  const [items, setItems] = useState<ReactionRow[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [type, setType] = useState<ReactionType | "all">("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function load(nextPage = 1) {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(nextPage))
    params.set("limit", "30")
    if (type !== "all") params.set("type", type)
    if (search.trim()) params.set("q", search.trim())
    const res = await fetch(`/api/reactions?${params.toString()}`, { cache: "no-store" })
    setLoading(false)
    if (!res.ok) {
      return toast.error("Reaksiyalarni yuklab bo'lmadi")
    }
    const data = (await res.json()) as ApiResponse
    setItems(data.data)
    setPage(data.meta.page)
    setTotalPages(Math.max(1, data.meta.totalPages))
  }

  useEffect(() => {
    void load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function remove(id: string) {
    setDeletingId(id)
    const res = await fetch(`/api/reactions/${id}`, { method: "DELETE" })
    setDeletingId(null)
    if (!res.ok) return toast.error("O'chirib bo'lmadi")
    toast.success("Reaksiya o'chirildi")
    void load(page)
  }

  return (
    <Card className="p-0 py-4 md:py-6">
      <CardHeader className="px-4 md:px-6 space-y-3">
        <CardTitle>Reaksiyalar</CardTitle>
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Turi:</span>
            <Select value={type} onValueChange={(v) => setType(v as ReactionType | "all")}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Barchasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barchasi</SelectItem>
                {reactionOptions.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Qidiruv:</span>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="slug yoki sarlavha bo'yicha"
              className="w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => void load(1)} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Filtrlash"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={loading && !search && type === "all"}
              onClick={() => {
                setType("all")
                setSearch("")
                void load(1)
              }}
            >
              Tozalash
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 md:px-6">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Yangilik</TableHead>
                <TableHead>Foydalanuvchi</TableHead>
                <TableHead>Turi</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-mono text-xs">
                    <Link href={`/dashboard/news/${item.newsSlug}/edit`} className="underline hover:text-primary">
                      {item.newsSlug}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="font-medium">{item.userName}</span>
                      {item.userId ? <span className="text-muted-foreground">userId: {item.userId}</span> : null}
                      {item.anonId ? <span className="text-muted-foreground">anonId: {item.anonId}</span> : null}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-xs">{item.type === "like" ? "👍 like" : item.type === "love" ? "❤️ love" : item.type === "laugh" ? "😂 laugh" : item.type === "sad" ? "😢 sad" : "😡 angry"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deletingId === item._id}
                      onClick={() => void remove(item._id)}
                    >
                      {deletingId === item._id ? <Loader2 className="size-4 animate-spin" /> : "O'chirish"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {items.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Reaksiyalar yo&apos;q.</p>
        ) : null}
        {totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => void load(page - 1)}
            >
              Oldingi
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages || loading}
              onClick={() => void load(page + 1)}
            >
              Keyingi
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

