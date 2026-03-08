import { Card } from "@/shared/common/components/ui/card"
import { useTranslations } from "next-intl"

type TagsProps = {
    tags: string[]
}

export default function Tags({ tags }: TagsProps) {
  const t = useTranslations("common")
  return (
    <Card className="rounded-lg border-border px-4 py-3 shadow-none w-full">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t("tags")}
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-xs border border-border bg-muted px-2.5 py-1 text-xs font-medium">
            {tag}
          </span>
        ))}
      </div>
    </Card>
  )
}
