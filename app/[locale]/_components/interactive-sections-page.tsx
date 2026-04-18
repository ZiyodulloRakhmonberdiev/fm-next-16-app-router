"use client"

import { useState } from "react"
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
}: InteractiveSectionsPageProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeText = sections[activeIndex] ?? sections[0] ?? ""

  return (
    <div className="mx-auto max-w-7xl space-y-8 md:px-6">
      <section className="overflow-hidden">
        <div className="">
          <div className="space-y-4">
            {/* <h1 className="max-w-3xl text-xl font-bold tracking-tight text-foreground md:text-5xl">
              {title}
            </h1> */}
            <div className="border-b flex justify-start">
              <h1 className="text-xl font-bold md:text-3xl bg-brand text-white inline-block px-3 py-2 rounded-xs">
                {title}
              </h1>
            </div>
            <p className="hidden max-w-2xl text-sm leading-relaxed text-muted-foreground md:block md:text-base">
              {activeText}
            </p>
          </div>

          <div className="relative mt-8 md:mt-10">
            <div
              className="pointer-events-none absolute left-[11px] top-3 bottom-3 w-px bg-border md:left-[15px]"
              aria-hidden
            />

            <ol className="relative m-0 list-none space-y-6 p-0 md:space-y-8">
              {sections.map((section, index) => {
                const isActive = activeIndex === index
                return (
                  <li key={`${title}-step-${index}`} className="relative flex gap-4 md:gap-6">
                    <div className="relative z-10 flex w-6 shrink-0 flex-col items-center pt-1 md:w-8">
                      <button
                        type="button"
                        aria-current={isActive ? "step" : undefined}
                        aria-label={`${index + 1}-bosqich`}
                        onClick={() => setActiveIndex(index)}
                        className={cn(
                          "size-3 shrink-0 rounded-full border-2 bg-background transition-colors md:size-3.5",
                          isActive
                            ? "border-foreground shadow-sm ring-2 ring-foreground/10"
                            : "border-muted-foreground/35 hover:border-muted-foreground/60"
                        )}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        "min-w-0 flex-1 rounded-xl border p-4 text-left transition-colors md:p-5",
                        isActive
                          ? "border-foreground/15 bg-muted/50 shadow-sm"
                          : "border-border bg-card/80 hover:border-foreground/10 hover:bg-muted/30 dark:bg-card/60"
                      )}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground md:text-base">
                        {section}
                      </p>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}
