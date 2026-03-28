"use client"

import { useState } from "react"
import { Link } from "@/i18n/navigation"
import { ArrowRight } from "lucide-react"
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
    <div className="mx-auto max-w-7xl space-y-12 md:space-y-16">
      <section className="border-b border-border pb-12 md:pb-16">
        <div className="space-y-6">
          <h1 className="text-4xl font-light tracking-tight text-foreground md:text-6xl">
            {title}
          </h1>
          <p className="max-w-3xl text-lg font-light leading-relaxed text-muted-foreground md:text-xl">
            {activeText}
          </p>
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
          {sections.map((section, index) => (
            <button
              key={`${title}-section-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "group flex w-full flex-col gap-4 rounded-xl border p-6 text-left transition-all",
                activeIndex === index
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background hover:border-foreground/30 hover:shadow-sm"
              )}
            >
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-widest",
                  activeIndex === index ? "text-background/60" : "text-muted-foreground"
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={cn("text-base leading-relaxed tracking-tight font-medium", activeIndex === index ? "text-background" : "text-foreground")}>
                {section.length > 80 ? section.slice(0, 80) + "..." : section}
              </span>
            </button>
          ))}
        </div>

        {ctaHref && ctaLabel ? (
           <aside className="lg:sticky lg:top-32 space-y-8">
              <div className="rounded-xl border border-border p-8 space-y-6 bg-muted/20">
                <p className="text-sm text-foreground/80 leading-relaxed font-light italic">
                  &quot;{activeText.slice(0, 120)}...&quot;
                </p>
                <Link
                  href={ctaHref}
                  className="inline-flex w-full items-center justify-between rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:bg-foreground/90"
                >
                  {ctaLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
           </aside>
        ) : (
          <aside className="lg:sticky lg:top-32 space-y-8">
              <div className="rounded-xl border border-border p-8 space-y-6 bg-muted/20">
                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                  {sections[activeIndex]}
                </p>
              </div>
          </aside>
        )}
      </div>
    </div>
  )
}
