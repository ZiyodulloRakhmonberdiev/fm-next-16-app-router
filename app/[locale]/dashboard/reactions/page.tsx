"use client"

import { useState, useEffect } from "react"
import { Button } from "@/shared/common/components/ui/button"
import { Input } from "@/shared/common/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/common/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/common/components/ui/table"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useReactionsQuery, useDeleteReactionMutation } from "@/features/dashboard/model/admin-hooks"
import type { ReactionType, ReactionRow } from "@/features/dashboard/model/admin-api"
import { truncateChars } from "@/shared/common/lib/truncate"

const TITLE_MAX = 36

const reactionOptions: ReactionType[] = ["like", "love", "laugh", "sad", "angry"]

function reactionLabel(type: ReactionType): string {
  const map: Record<ReactionType, string> = {
    like: "like",
    love: "love",
    laugh: "laugh",
    sad: "sad",
    angry: "angry",
  }
  return map[type] ?? type
}

function newsLinkLabel(item: ReactionRow): string {
  const raw = (item.newsTitle?.trim() || item.newsSlug || "—").trim()
  return truncateChars(raw, TITLE_MAX)
}

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-lg font-medium tracking-tight">Reaksiyalar</h1>
          <p className="text-sm text-muted-foreground">Yangilik bo&apos;yicha reaksiyalar ro&apos;yxati</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Select value={type} onValueChange={(v) => setType(v as ReactionType | "all")}>
            <SelectTrigger className="h-9 w-full sm:w-[140px]">
              <SelectValue placeholder="Turi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha turlar</SelectItem>
              {reactionOptions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Slug, sarlavha yoki ism"
            className="h-9 w-full sm:max-w-xs"
          />
          <div className="flex gap-2">
            <Button size="sm" className="h-9" onClick={handleFilter} disabled={isLoading}>
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Filtrlash"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9"
              disabled={isLoading && !search && type === "all"}
              onClick={handleReset}
            >
              Tozalash
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card/30">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[180px] font-medium">Yangilik</TableHead>
                <TableHead className="font-medium">Foydalanuvchi</TableHead>
                <TableHead className="w-[100px] font-medium">Tur</TableHead>
                <TableHead className="whitespace-nowrap font-medium">Sana</TableHead>
                <TableHead className="text-right font-medium">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const fullTitle = item.newsTitle?.trim() || item.newsSlug || "—"
                return (
                  <TableRow key={item._id} className="border-b border-border/60">
                    <TableCell className="align-top">
                      <Link
                        href={`/dashboard/news/${item.newsSlug}/edit`}
                        className="text-sm text-primary underline-offset-4 hover:underline"
                        title={fullTitle}
                      >
                        {newsLinkLabel(item)}
                      </Link>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex flex-col gap-0.5 text-sm">
                        <span>{item.userName}</span>
                        {item.userId ? (
                          <span className="text-xs text-muted-foreground">id: {item.userId}</span>
                        ) : null}
                        {item.anonId ? (
                          <span className="text-xs text-muted-foreground">anon: {item.anonId}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-sm capitalize text-muted-foreground">
                      {reactionLabel(item.type)}
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="align-top text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 text-white hover:text-white"
                        disabled={deleteMutation.isPending && deleteMutation.variables === item._id}
                        onClick={() => remove(item._id)}
                      >
                        {deleteMutation.isPending && deleteMutation.variables === item._id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          "O'chirish"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        {items.length === 0 && !isLoading ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">Reaksiyalar yo&apos;q.</p>
        ) : null}
        {totalPages > 1 ? (
          <div className="flex items-center justify-center gap-2 border-t px-4 py-3">
            <Button
              size="sm"
              variant="outline"
              className="h-8"
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
              className="h-8"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Keyingi
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
