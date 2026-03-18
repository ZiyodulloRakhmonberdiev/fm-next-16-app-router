"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { Heart, MessageSquare } from "lucide-react"
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
  const ta = useTranslations("auth")
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
    if (!session?.user?.id) return toast.error(t("comment_login_required"))
    const trimmed = rawContent.trim()
    if (!trimmed) return
    if (trimmed.length > 512) {
      toast.error(t("comment_too_long"))
      return
    }
    const res = await fetch(`/api/news/${newsRef}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: trimmed, replyToCommentId }),
    })
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null
      toast.error(payload?.error ?? t("comment_submit_failed"))
      return
    }
    toast.success(t("comment_submitted"))
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
      toast.error(t("comment_delete_failed"))
      return
    }
    toast.success(t("comment_deleted"))
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
      return toast.error(data?.error ?? t("reaction_save_failed"))
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

  const totalReactions = (counts.like ?? 0) + (counts.love ?? 0) + (counts.laugh ?? 0) + (counts.sad ?? 0) + (counts.angry ?? 0)

  return (
    <section className="mt-8 space-y-8 shadow-sm">
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          {t("reactions")}
          {/* {totalReactions > 0 && (
            <span className="text-muted-foreground font-normal">({totalReactions})</span>
          )} */}
        </h3>
        <div className="flex flex-wrap gap-2">
          {reactionButtons.map((r) => (
            <Button
              key={r.type}
              size="sm"
              variant={myReaction === r.type ? "outline" : "outline"}
              onClick={() => void setReaction(r.type)}
              className="rounded-md"
            >
              {r.label}  {counts[r.type] ?? 0}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("comments")} </h3>
        {/* ({totalComments})  */}
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
                    {t("reply")}
                  </button>
                ) : null}
                {myUserId && c.userId === myUserId ? (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-destructive hover:underline"
                    onClick={() => void removeMyComment(c._id)}
                  >
                    {t("delete")}
                  </button>
                ) : null}
                {c.status === "pending" ? (
                  <span className="text-xs text-amber-600">({t("pending")})</span>
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
                    {t("replying_to", { user: replyTo.userLogin ? `@${replyTo.userLogin}` : t("user") })}
                  </p>
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={t("reply_placeholder")}
                    maxLength={512}
                    rows={2}
                    className="resize-none"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">{replyContent.length}/512</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                        {ta("cancel")}
                      </Button>
                      <Button size="sm" onClick={() => void submitComment(replyContent, c._id)}>
                        {t("send")}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ))}
        {rootComments.length === 0 ? <p className="text-sm text-muted-foreground">{t("comments_empty")}</p> : null}
        {hasMore ? (
          <Button variant="outline" size="sm" onClick={() => void loadComments(commentOffset + 5, true)}>
            {t("load_more")}
          </Button>
        ) : null}
      </div>
      <div className="space-y-3">
        {session?.user ? (
          <div className="space-y-2 p-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("comment_placeholder")}
              maxLength={512}
              rows={6}
              className="outline-none bg-accent min-h-[160px] resize-none"
            />
            <div className="flex items-center justify-between mt-4">
              <Button onClick={() => void submitComment(content)}>{t("send")}</Button>
              <p className="text-xs text-muted-foreground">{content.length}/512</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              disabled
              placeholder={t("unauth_comment_placeholder")}
              rows={6}
              className="resize-none bg-muted/50 border-muted-foreground/20 cursor-not-allowed outline-none"
            />
            <div className="flex justify-st">
              <Button onClick={() => setAuthModalOpen(true)} size="default" className="min-w-[120px]">
                {ta("login")}
              </Button>
            </div>
          </div>
        )}


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
