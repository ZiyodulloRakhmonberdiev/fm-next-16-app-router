"use client"

import { useTranslations } from "next-intl"

type ServerUnavailableProps = {
  className?: string
}

export default function ServerUnavailable({ className = "" }: ServerUnavailableProps) {
  const t = useTranslations("common")
  return (
    <div className={`flex min-h-[50vh] w-full items-center justify-center px-4 ${className}`}>
      <div className="max-w-xl text-center">
        <h2 className="text-xl font-semibold md:text-2xl">{t("server_unavailable")}</h2>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          {t("server_unavailable_description")}
        </p>
      </div>
    </div>
  )
}
