"use client"

import type { ReactNode } from "react"
import { usePublicSiteSettingsQuery } from "@/shared/common/lib/public-site-settings-query"

type Props = {
  children: ReactNode
  model?: "news" | "categories" | "tags" | "comments" | "reactions" | "ads" | "team" | "users"
}

export default function ClientServerOffGate({ children, model }: Props) {
  const { data: settings } = usePublicSiteSettingsQuery()
  const mode = settings?.clientDelivery.mode ?? "normal"
  const modelEnabled = model ? (settings?.clientDelivery.models?.[model] ?? true) : true
  const title = settings?.clientDelivery.title ?? "Server vaqtincha o'chirilgan"
  const description =
    settings?.clientDelivery.description ??
    "Hozir serverdan ma'lumot uzatish vaqtincha to'xtatilgan. Iltimos, keyinroq qayta urinib ko'ring."

  if (mode === "server-off" || !modelEnabled) {
    return (
      <section className="mx-auto flex min-h-[55vh] w-full max-w-7xl items-center justify-center px-4 text-center">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">{description}</p>
        </div>
      </section>
    )
  }

  return <>{children}</>
}
