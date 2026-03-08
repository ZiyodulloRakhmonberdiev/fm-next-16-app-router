import { Card } from "@/shared/common/components/ui/card"
import { useTranslations } from "next-intl"

type CreatedByProps = {
  author: string
}

export default function CreatedBy({ author }: CreatedByProps) {
  const t = useTranslations("common")
  return (
    <Card className="rounded-lg border-border px-4 py-3 shadow-none w-full">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t("createdBy")}
      </p>
      <p className="font-medium">{author}</p>
    </Card>
  )
}
