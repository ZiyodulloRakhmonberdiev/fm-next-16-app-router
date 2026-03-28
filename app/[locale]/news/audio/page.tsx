'use client'

import * as React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Footer } from "@/widgets/client-footer"
import { Header } from "@/widgets/client-header"
import { ClientSidebar } from "@/widgets/client-sidebar"
import ClientSiteNothingGate from "../../_components/client-site-nothing-gate"
import ClientServerOffGate from "../../_components/client-server-off-gate"
import { NewsListingPageContent } from "@/features/news/ui/news-listing-page-content"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { AudioPlayerBar } from "@/widgets/audio-player-bar/ui/audio-player-bar"
import type { NewsItem } from "@/features/news/model"

async function fetchInitial(locale: AppLocale) {
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000'
  const proto = typeof window !== 'undefined' ? window.location.protocol : 'http:'
  const origin = `${proto}//${host}`
  
  try {
    const res = await fetch(
      `/api/news?status=published&audio=1&sortBy=publishedAt&page=1&limit=9`
    )
    if (!res.ok) return { items: [], page: 1, totalPages: 1 }
    const json = await res.json()
    // Manual normalization for simple client fetch if needed, 
    // but NewsListingPageContent handles initial items.
    return {
      items: json.data || [],
      page: Number(json.meta?.page ?? 1),
      totalPages: Math.max(1, Number(json.meta?.totalPages ?? 1)),
    }
  } catch {
    return { items: [], page: 1, totalPages: 1 }
  }
}

export default function AudioNewsPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>
}) {
  const unwrappedParams = React.use(params)
  const locale = unwrappedParams.locale
  const [initial, setInitial] = React.useState<{ items: NewsItem[]; page: number; totalPages: number } | null>(null)
  const [activeAudio, setActiveAudio] = React.useState<NewsItem | null>(null)

  React.useEffect(() => {
    void fetchInitial(locale).then(setInitial)
  }, [locale])

  if (!initial) return null

  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col pb-24 md:pb-32">
        <Header />
        <main className="flex-1">
          <ClientServerOffGate model="news">
            <div className="mx-auto max-w-7xl">
              <div className="px-4 py-6 md:px-6">
                <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl tracking-tight text-brand">Audio</h1>
                <p className="mt-2 text-muted-foreground">Oxirgi audio xabarlar va tahlillar.</p>
              </div>

              <NewsListingPageContent
                initial={initial}
                pageSize={9}
                showAuthorsChoice={false}
                layout="list"
              />
            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
        
        {/* We use a simple logic: the first item in the list is the default active audio if none selected. 
            Actually, let's let the user click play. But per requirement, we can show it. */}
        <AudioPlayerBar 
          activeNews={activeAudio || initial.items[0] || null} 
          onClose={() => setActiveAudio(null)} 
        />
      </div>
    </ClientSiteNothingGate>
  )
}
