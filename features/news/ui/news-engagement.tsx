"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/shared/common/components/ui/button"
import { Textarea } from "@/shared/common/components/ui/textarea"
import { toast } from "sonner"
import { formatDateTimeLocale } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { Input } from "@/shared/common/components/ui/input"
import { Label } from "@/shared/common/components/ui/label"
import { AuthModal } from "@/features/auth/ui/auth-modal"

type ReactionType = "like" | "love" | "laugh" | "sad" | "angry"
type CommentItem = {
  _id: string
  userId: string
  userName: string
  userLogin?: string
  userPosition?: string
  userImage?: string | null
  content: string
  status: "pending" | "confirmed" | "approved" | "rejected"
  replyToCommentId?: string
  replyToUserLogin?: string
  createdAt: string
  confirmedAt?: string
}

const reactionButtons: { type: ReactionType; label: string }[] = [
  { type: "like", label: "👍" },
  { type: "love", label: "❤️" },
  { type: "laugh", label: "😂" },
  { type: "sad", label: "😢" },
  { type: "angry", label: "😡" },
]

export function NewsEngagement({ slug, newsId }: { slug: string; newsId?: string }) {
  const t = useTranslations("common")
  const locale = useLocale()
  const { data: session } = useSession()
  const newsRef = newsId ?? slug
  const [comments, setComments] = useState<CommentItem[]>([])
  const [commentOffset, setCommentOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [totalComments, setTotalComments] = useState(0)
  const [replyTo, setReplyTo] = useState<{ id: string; userLogin?: string } | null>(null)
  const [content, setContent] = useState("")
  const [replyContent, setReplyContent] = useState("")
  const [counts, setCounts] = useState<Record<ReactionType, number>>({
    like: 0, love: 0, laugh: 0, sad: 0, angry: 0,
  })
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null)
  const myUserId = session?.user?.id

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

  function getAnonId() {
    if (typeof window === "undefined") return ""
    const key = "anon-reaction-id"
    const existing = window.localStorage.getItem(key)
    if (existing) return existing
    const generated = Math.random().toString(36).slice(2) + Date.now().toString(36)
    window.localStorage.setItem(key, generated)
    return generated
  }

  async function loadComments(offset = 0, append = false) {
    const res = await fetch(`/api/news/${newsRef}/comments?limit=5&offset=${offset}`, { cache: "no-store" })
    if (!res.ok) return
    const data = await res.json()
    const next = (data.comments ?? []) as CommentItem[]
    setComments((prev) => (append ? [...prev, ...next] : next))
    setHasMore(Boolean(data.hasMore))
    setTotalComments(Number(data.totalPublic ?? 0))
    setCommentOffset(offset)
  }
  async function loadReactions() {
    const isAuthed = Boolean(session?.user?.id)
    const anonId = isAuthed ? "" : getAnonId()
    const url = isAuthed
      ? `/api/news/${newsRef}/reactions`
      : `/api/news/${newsRef}/reactions?anonId=${encodeURIComponent(anonId)}`
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return
    const data = await res.json()
    setCounts(data.counts ?? counts)
    setMyReaction((data.myReaction ?? null) as ReactionType | null)
  }

  useEffect(() => {
    void loadComments(0, false)
    void loadReactions()
  }, [newsRef, slug])

  const visibleComments = useMemo(
    () => comments.filter((c) => c.status === "approved" || c.status === "confirmed" || (myUserId && c.userId === myUserId && c.status === "pending")),
    [comments, myUserId]
  )

  function fallbackPositionLabel() {
    if (locale === "ru") return "Пользователь"
    if (locale === "uzb") return "Фойдаланувчи"
    if (locale === "en") return "User"
    return "Foydalanuvchi"
  }

  function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    if (name.length >= 2) return name.slice(0, 2).toUpperCase()
    return name.slice(0, 1).toUpperCase() || "?"
  }

  function formatCommentDate(createdAt: string): string {
    try {
      const loc: AppLocale = ["en", "ru", "uz", "uzb"].includes(locale) ? (locale as AppLocale) : "uz"
      return formatDateTimeLocale(createdAt, loc)
    } catch {
      return createdAt
    }
  }

  async function submitComment(rawContent: string, replyToCommentId?: string) {
    if (!session?.user?.id) return toast.error("Izoh qoldirish uchun login qiling")
    const trimmed = rawContent.trim()
    if (!trimmed) return
    if (trimmed.length > 512) {
      toast.error("Izoh 512 belgidan oshmasligi kerak")
      return
    }
    const res = await fetch(`/api/news/${newsRef}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: trimmed, replyToCommentId }),
    })
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null
      toast.error(payload?.error ?? "Izoh yuborib bo'lmadi")
      return
    }
    toast.success("Izoh yuborildi")
    if (replyToCommentId) {
      setReplyContent("")
      setReplyTo(null)
    } else {
      setContent("")
    }
    void loadComments(0, false)
  }

  async function removeMyComment(id: string) {
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("Izohni o'chirib bo'lmadi")
      return
    }
    toast.success("Izoh o'chirildi")
    void loadComments()
  }

  async function setReaction(type: ReactionType) {
    const isAuthed = Boolean(session?.user?.id)
    const anonId = isAuthed ? "" : getAnonId()
    const res = await fetch(`/api/news/${newsRef}/reactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(isAuthed ? {} as Record<string, string> : { "x-anon-id": anonId }),
      },
      body: JSON.stringify({ type }),
    })
    const data = (await res.json().catch(() => null)) as { error?: string; type?: ReactionType; removed?: boolean } | null
    if (!res.ok) {
      return toast.error(data?.error ?? "Reaksiya saqlanmadi")
    }
    setCounts((prev) => {
      const next = { ...prev }
      if (data?.removed) {
        if (myReaction) next[myReaction] = Math.max(0, (next[myReaction] ?? 1) - 1)
        return next
      }
      const newType = (data?.type ?? type) as ReactionType
      if (myReaction && myReaction !== newType) next[myReaction] = Math.max(0, (next[myReaction] ?? 1) - 1)
      next[newType] = (next[newType] ?? 0) + 1
      return next
    })
    setMyReaction(data?.removed ? null : (data?.type ?? type))
  }

  const rootComments = useMemo(
    () => visibleComments.filter((c) => !c.replyToCommentId),
    [visibleComments]
  )
  const repliesByParentId = useMemo(() => {
    const map = new Map<string, CommentItem[]>()
    for (const item of visibleComments) {
      if (!item.replyToCommentId) continue
      const prev = map.get(item.replyToCommentId) ?? []
      prev.push(item)
      map.set(item.replyToCommentId, prev)
    }
    return map
  }, [visibleComments])

  return (
    <section className="mt-8 space-y-6 border-t pt-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t("reactions")}</h3>
        <div className="flex flex-wrap gap-2">
          {reactionButtons.map((r) => (
            <Button
              key={r.type}
              size="sm"
              variant={myReaction === r.type ? "default" : "outline"}
              onClick={() => void setReaction(r.type)}
            >
              {r.label} ({counts[r.type] ?? 0})
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{t("comments")} ({totalComments})</h3>
        {session?.user ? (
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Izoh yozing..."
              maxLength={512}
              rows={3}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{content.length}/512</p>
              <Button onClick={() => void submitComment(content)}>Yuborish</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              disabled
              placeholder="Siz avtorizatsiya qilmagansiz. Izoh yozish uchun saytga kiring yoki ro'yxatdan o'ting"
              rows={4}
              className="resize-none bg-muted/50 border-muted-foreground/20 cursor-not-allowed"
            />
            <div className="flex justify-center">
              <Button onClick={() => setAuthModalOpen(true)} size="default" className="min-w-[120px]">
                Kirish
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {rootComments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {c.userImage ? (
                  <img src={c.userImage} alt={c.userName} className="size-10 rounded-full object-cover" />
                ) : (
                  getInitials(c.userName)
                )}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div>
                  <p className="font-semibold text-foreground">{c.userName}</p>
                  <p className="text-xs text-muted-foreground">{formatCommentDate(c.createdAt)}</p>
                </div>
                {c.replyToUserLogin ? (
                  <p className="text-xs text-muted-foreground">↪ @{c.replyToUserLogin}</p>
                ) : null}
                <p className="text-sm text-foreground leading-snug">{c.content}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {session?.user?.id ? (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                      onClick={() => {
                        setReplyTo({ id: c._id, userLogin: c.userLogin })
                        setReplyContent("")
                      }}
                    >
                      Javob berish
                    </button>
                  ) : null}
                  {myUserId && c.userId === myUserId ? (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-destructive hover:underline"
                      onClick={() => void removeMyComment(c._id)}
                    >
                      O&apos;chirish
                    </button>
                  ) : null}
                  {c.status === "pending" ? (
                    <span className="text-xs text-amber-600">(pending)</span>
                  ) : null}
                </div>
                {repliesByParentId.get(c._id)?.length ? (
                  <div className="mt-3 space-y-3 border-l-2 border-muted pl-3">
                    {repliesByParentId.get(c._id)?.map((reply) => (
                      <div key={reply._id} className="flex gap-2">
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/80 text-xs font-medium text-primary-foreground">
                          {reply.userImage ? (
                            <img src={reply.userImage} alt={reply.userName} className="size-8 rounded-full object-cover" />
                          ) : (
                            getInitials(reply.userName)
                          )}
                        </span>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="font-medium text-sm text-foreground">{reply.userName}</p>
                          <p className="text-xs text-muted-foreground">{formatCommentDate(reply.createdAt)}</p>
                          <p className="text-sm text-foreground">{reply.content}</p>
                          {myUserId && reply.userId === myUserId ? (
                            <button
                              type="button"
                              className="text-xs text-muted-foreground hover:text-destructive hover:underline"
                              onClick={() => void removeMyComment(reply._id)}
                            >
                              O&apos;chirish
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                {replyTo?.id === c._id ? (
                  <div className="mt-2 space-y-2 rounded-md border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      {replyTo.userLogin ? `@${replyTo.userLogin}` : "foydalanuvchi"} izohiga javob
                    </p>
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Javob yozing..."
                      maxLength={512}
                      rows={2}
                      className="resize-none"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">{replyContent.length}/512</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                          Bekor qilish
                        </Button>
                        <Button size="sm" onClick={() => void submitComment(replyContent, c._id)}>
                          Yuborish
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {rootComments.length === 0 ? <p className="text-sm text-muted-foreground">Izohlar yo&apos;q.</p> : null}
          {hasMore ? (
            <Button variant="outline" size="sm" onClick={() => void loadComments(commentOffset + 5, true)}>
              Ko&apos;proq
            </Button>
          ) : null}
        </div>
      </div>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultMode={authMode}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </section>
  )
}
