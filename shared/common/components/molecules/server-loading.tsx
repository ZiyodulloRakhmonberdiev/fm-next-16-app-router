"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

type ServerLoadingProps = {
  className?: string
}

export default function ServerLoading({ className = "" }: ServerLoadingProps) {
  const t = useTranslations("common")
  return (
    <div className={`flex min-h-[50vh] w-full items-center justify-center px-4 ${className}`}>
      <div className="flex flex-col items-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground md:text-base">{t("loading")}</p>
      </div>
    </div>
  );
}