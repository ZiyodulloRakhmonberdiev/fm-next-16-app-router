"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/common/components/ui/card"
import { Button } from "@/shared/common/components/ui/button"
import { Input } from "@/shared/common/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/common/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/common/components/ui/table"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useReactionsQuery, useDeleteReactionMutation } from "@/features/dashboard/model/admin-hooks"
import type { ReactionType, ReactionRow } from "@/features/dashboard/model/admin-api"

const reactionOptions: ReactionType[] = ["like", "love", "laugh", "sad", "angry"]

export default function DashboardReactionsPage() {
  const [page, setPage] = useState(1)
  const [type, setType] = useState<ReactionType | "all">("all")
  const [search, setSearch] = useState("")
  const [appliedType, setAppliedType] = useState<ReactionType | "all">("all")
  const [appliedSearch, setAppliedSearch] = useState("")

  const { data, isLoading, isError } = useReactionsQuery({
    page,
    limit: 100,
    type: appliedType,
    q: appliedSearch || undefined,
  })
  const deleteMutation = useDeleteReactionMutation()

  const items: ReactionRow[] = data?.data ?? []
  const totalPages = Math.max(1, data?.meta?.totalPages ?? 1)

  const handleFilter = () => {
    setAppliedType(type)
    setAppliedSearch(search.trim())
    setPage(1)
  }
  const handleReset = () => {
    setType("all")
    setSearch("")
    setAppliedType("all")
    setAppliedSearch("")
    setPage(1)
  }

  const remove = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Reaksiya o'chirildi"),
      onError: () => toast.error("O'chirib bo'lmadi"),
    })
  }

  useEffect(() => {
    if (isError) toast.error("Reaksiyalarni yuklab bo'lmadi")
  }, [isError])

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
            <Button size="sm" onClick={handleFilter} disabled={isLoading}>
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Filtrlash"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isLoading && !search && type === "all"}
              onClick={handleReset}
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
                      disabled={deleteMutation.isPending && deleteMutation.variables === item._id}
                      onClick={() => remove(item._id)}
                    >
                      {deleteMutation.isPending && deleteMutation.variables === item._id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "O'chirish"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {items.length === 0 && !isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Reaksiyalar yo&apos;q.</p>
        ) : null}
        {totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Oldingi
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Keyingi
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
