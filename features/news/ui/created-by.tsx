"use client"

import Image from "next/image"
import { Card } from "@/shared/common/components/ui/card"
import { useTranslations } from "next-intl"
import { User } from "lucide-react"
import { cn } from "@/shared/common/lib/utils"
import { Link } from "@/i18n/navigation"

type CreatedByProps = {
  author: string
  authorId?: string | null
  authorImage?: string | null
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  if (name.length >= 2) return name.slice(0, 2).toUpperCase()
  return name.slice(0, 1).toUpperCase() || "?"
}

export default function CreatedBy({ author, authorId, authorImage }: CreatedByProps) {
  const t = useTranslations("common")
  const initials = getInitials(author)
  const hasImage = Boolean(authorImage?.trim())
  const imageSrc =
    hasImage && (authorImage!.startsWith("http") || authorImage!.startsWith("/"))
      ? authorImage!
      : hasImage
        ? `/uploads/images/${authorImage}`
        : ""

  return (
    <Card className="w-full overflow-hidden rounded-xl border p-0 bg-[#eee] dark:bg-card shadow-sm">
      <div className="flex items-center gap-4 p-4 rounded-md">
        <div className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full bg-primary/10 md:h-14 md:w-14 ring-2 ring-white dark:ring-foreground/50">
          {hasImage && imageSrc ? (
            <Image
              src={imageSrc}
              alt={author}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <span
              className={cn(
                "flex h-full w-full items-center justify-center text-sm font-semibold text-primary md:text-base",
                initials.length === 1 && "text-lg"
              )}
              aria-hidden
            >
              {author.trim() ? initials : <User className="h-6 w-6 text-primary/70 md:h-7 md:w-7" />}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("createdBy")}
          </p>
          {authorId ? (
            <Link
              href={`/author/${authorId}`}
              className="mt-0.5 inline-block truncate font-semibold text-foreground hover:underline"
            >
              {author}
            </Link>
          ) : (
            <p className="mt-0.5 truncate font-semibold text-foreground">{author}</p>
          )}
        </div>
      </div>
    </Card>
  )
}
