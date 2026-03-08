"use client"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/common/components/ui/command"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { seedNews } from "@/scripts/seed-news"

type NewsItem = (typeof seedNews.news)[number]

function matchNews(item: NewsItem, search: string): boolean {
  if (!search.trim()) return false
  const q = search.toLowerCase().trim()
  const title = item.title.toLowerCase()
  const desc = item.description.toLowerCase()
  return title.includes(q) || desc.includes(q)
}

export function SearchBar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("common")
  const router = useRouter()

  return (
    <CommandDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Command
        filter={(value, search) => {
          const item = seedNews.news.find((n) => n.slug === value)
          if (!item) return 0
          return matchNews(item, search) ? 1 : 0
        }}
      >
        <CommandInput placeholder={t("search_placeholder")} />
        <CommandList>
          <CommandEmpty>{t("search_results_empty")}</CommandEmpty>
          <CommandGroup heading={t("results")}>
            {seedNews.news.map((item) => (
              <CommandItem
                key={item.slug}
                value={item.slug}
                onSelect={() => {
                  router.push(`/news/${item.slug}`)
                  onClose()
                }}
                className="flex flex-col items-start gap-0.5 py-2"
              >
                <span className="font-medium">{item.title}</span>
                <span className="line-clamp-1 text-xs text-muted-foreground">
                  {item.description}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
