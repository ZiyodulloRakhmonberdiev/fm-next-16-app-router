"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button, buttonVariants } from "@/shared/common/components/ui/button"
import { toast } from "sonner"
import { Link } from "@/i18n/navigation"
import { Bookmark } from "lucide-react"
import { cn } from "@/shared/common/lib/utils"

export function SavedNewsActions({ slug, overlay = false }: { slug: string; overlay?: boolean }) {
  const { data: session } = useSession()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return
    void (async () => {
      const res = await fetch("/api/me/saved-news", { cache: "no-store" })
      if (!res.ok) return
      const payload = (await res.json()) as { data?: Array<{ newsSlug: string }> }
      const rows = payload.data ?? []
      setSaved(rows.some((r) => r.newsSlug === slug))
    })()
  }, [session?.user?.id, slug])

  async function toggle() {
    if (!session?.user?.id) {
      toast.error("Bu funksiya uchun login qiling")
      return
    }
    const res = await fetch("/api/me/saved-news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newsSlug: slug }),
    })
    if (!res.ok) return toast.error("Saqlab bo'lmadi")
    const data = await res.json()
    setSaved(Boolean(data.saved))
  }

  if (!session?.user?.id) {
    if (overlay) {
      return (
        <Link
          href="/auth/login"
          className={cn(buttonVariants({ size: "icon", variant: "secondary" }), "size-8")}
          aria-label="Login qilish"
        >
          <Bookmark className="size-4" />
        </Link>
      )
    }
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/auth/login" className="underline">Login</Link> qilsangiz, newsni saqlash imkoniyati ochiladi.
      </p>
    )
  }

  if (overlay) {
    return (
      <Button
        size="icon"
        variant={saved ? "default" : "secondary"}
        className="size-8"
        onClick={() => void toggle()}
        aria-label="Saqlash"
      >
        <Bookmark className="size-4" />
      </Button>
    )
  }

  return <Button size="sm" variant={saved ? "default" : "outline"} onClick={() => void toggle()}>Saqlash</Button>
}
