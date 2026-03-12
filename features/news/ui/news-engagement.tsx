"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/shared/common/components/ui/button"
import { Textarea } from "@/shared/common/components/ui/textarea"
import { toast } from "sonner"
import { Link } from "@/i18n/navigation"
import { User } from "lucide-react"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"

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

export function NewsEngagement({ slug }: { slug: string }) {
  const t = useTranslations("common")
  const locale = useLocale()
  const { data: session } = useSession()
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
    const res = await fetch(`/api/news/${slug}/comments?limit=5&offset=${offset}`, { cache: "no-store" })
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
      ? `/api/news/${slug}/reactions`
      : `/api/news/${slug}/reactions?anonId=${encodeURIComponent(anonId)}`
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return
    const data = await res.json()
    setCounts(data.counts ?? counts)
    setMyReaction((data.myReaction ?? null) as ReactionType | null)
  }

  useEffect(() => {
    void loadComments(0, false)
    void loadReactions()
  }, [slug])

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

  async function submitComment(rawContent: string, replyToCommentId?: string) {
    if (!session?.user?.id) return toast.error("Izoh qoldirish uchun login qiling")
    const trimmed = rawContent.trim()
    if (!trimmed) return
    if (trimmed.length > 512) {
      toast.error("Izoh 512 belgidan oshmasligi kerak")
      return
    }
    const res = await fetch(`/api/news/${slug}/comments`, {
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
    const res = await fetch(`/api/news/${slug}/reactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(isAuthed ? {} as Record<string, string> : { "x-anon-id": anonId }),
      },
      body: JSON.stringify({ type }),
    })
    if (!res.ok) return toast.error("Reaksiya saqlanmadi")
    await loadReactions()
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
          <p className="text-sm text-muted-foreground">
            Izoh qoldirish uchun <Link href="/auth/login" className="underline">login qiling</Link>.
          </p>
        )}

        <div className="space-y-3">
          {rootComments.map((c) => (
            <div key={c._id} className="rounded-md border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted">
                    {c.userImage ? (
                      <img src={c.userImage} alt={c.userName} className="size-6 rounded-full object-cover" />
                    ) : (
                      <User className="size-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="font-medium">
                    {c.userName}
                    {" "}
                    <span className="text-xs text-muted-foreground">
                      (
                      {c.userLogin ? `@${c.userLogin}` : "@user"}
                      , {c.userPosition?.trim() || fallbackPositionLabel()})
                    </span>
                  </span>
                  {c.status === "pending" ? (
                    <span className="text-xs text-amber-600">(pending)</span>
                  ) : null}
                </div>
                {myUserId && c.userId === myUserId ? (
                  <Button variant="ghost" size="sm" onClick={() => void removeMyComment(c._id)}>
                    O'chirish
                  </Button>
                ) : null}
              </div>
              {c.replyToUserLogin ? (
                <p className="text-xs text-muted-foreground">↪ @{c.replyToUserLogin}</p>
              ) : null}
              <p className="text-sm">{c.content}</p>
              {repliesByParentId.get(c._id)?.length ? (
                <div className="space-y-2 rounded-md border-l-2 pl-3">
                  {repliesByParentId.get(c._id)?.map((reply) => (
                    <div key={reply._id} className="space-y-1 text-sm">
                      <p className="text-xs text-muted-foreground">
                        {reply.userName} ({reply.userLogin ? `@${reply.userLogin}` : "@user"}, {reply.userPosition?.trim() || fallbackPositionLabel()})
                      </p>
                      <p>{reply.content}</p>
                    </div>
                  ))}
                </div>
              ) : null}
              {session?.user?.id ? (
                <div>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs"
                    onClick={() => {
                      setReplyTo({ id: c._id, userLogin: c.userLogin })
                      setReplyContent("")
                    }}
                  >
                    Javob berish
                  </Button>
                </div>
              ) : null}
              {replyTo?.id === c._id ? (
                <div className="space-y-2 rounded-md border p-2">
                  <p className="text-xs text-muted-foreground">
                    {replyTo.userLogin ? `@${replyTo.userLogin}` : "foydalanuvchi"} izohiga javob
                  </p>
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Javob yozing..."
                    maxLength={512}
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{replyContent.length}/512</p>
                    <div className="flex items-center gap-2">
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
          ))}
          {rootComments.length === 0 ? <p className="text-sm text-muted-foreground">Izohlar yo'q.</p> : null}
          {hasMore ? (
            <Button variant="outline" size="sm" onClick={() => void loadComments(commentOffset + 5, true)}>
              Read more
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
