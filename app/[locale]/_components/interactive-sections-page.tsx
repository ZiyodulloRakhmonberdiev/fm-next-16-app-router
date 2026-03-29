"use client"

import { useState } from "react"
import { Link } from "@/i18n/navigation"
import { ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/shared/common/lib/utils"

type InteractiveSectionsPageProps = {
  title: string
  sections: string[]
  ctaHref?: string
  ctaLabel?: string
}

export function InteractiveSectionsPage({
  title,
  sections,
  ctaHref,
  ctaLabel,
}: InteractiveSectionsPageProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeText = sections[activeIndex] ?? sections[0] ?? ""

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="overflow-hidden rounded-[28px] border border-brand/15 bg-linear-to-br from-brand/10 via-background to-background">
        <div className="grid gap-6 px-6 py-8 md:px-10 md:py-12 lg:grid-cols-[minmax(0,1.35fr)_260px] lg:items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              <Sparkles className="size-3.5" />
              {title}
            </span>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {activeText}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {sections.map((section, index) => (
              <button
                key={`${title}-metric-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all",
                  activeIndex === index
                    ? "border-brand bg-brand text-white shadow-lg"
                    : "border-brand/15 bg-white/85 hover:-translate-y-0.5 hover:border-brand/35 dark:bg-card/80"
                )}
              >
                <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", activeIndex === index ? "text-white/80" : "text-brand")}>
                  0{index + 1}
                </p>
                <p className={cn("mt-2 line-clamp-3 text-sm leading-relaxed", activeIndex === index ? "text-white" : "text-muted-foreground")}>
                  {section}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <div className="space-y-3">
          {sections.map((section, index) => (
            <button
              key={`${title}-section-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all",
                activeIndex === index
                  ? "border-brand bg-brand text-white shadow-lg"
                  : "border-border bg-background hover:border-brand/35 hover:shadow-sm"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  activeIndex === index ? "bg-white/15 text-white" : "bg-brand/10 text-brand"
                )}
              >
                {index + 1}
              </span>
              <span className={cn("text-sm leading-relaxed", activeIndex === index ? "text-white" : "text-muted-foreground")}>
                {section}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-[28px] border border-brand/15 bg-white p-6 shadow-[0_20px_60px_-32px_rgba(209,0,28,0.35)] dark:bg-card md:p-8 lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Section 0{activeIndex + 1}
          </p>
          <p className="mt-4 text-base leading-8 text-foreground md:text-lg">{activeText}</p>
          {ctaHref && ctaLabel ? (
            <div className="mt-6">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand/90"
              >
                {ctaLabel}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
