"use client"

import type { ReactNode } from "react"
import { usePublicSiteSettingsQuery } from "@/shared/common/lib/public-site-settings-query"

type Props = {
  children: ReactNode
}

export default function ClientSiteNothingGate({ children }: Props) {
  const { data: settings } = usePublicSiteSettingsQuery()
  const mode = settings?.clientDelivery.mode ?? "normal"
  const title = settings?.clientDelivery.title ?? "Texnik ishlar"
  const description =
    settings?.clientDelivery.description ??
    "Hozir tizimda texnik ishlar olib borilmoqda. Iltimos, birozdan keyin qayta urinib ko'ring."

  if (mode === "nothing") {
    return (
      <main className="min-h-screen w-full bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{description}</p>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
