"use client"

import * as React from "react"
import { Radio as RadioIcon } from "lucide-react"
import { cn } from "@/shared/common/lib/utils"
import type { UzRadioStationDTO } from "@/features/radio/model/uz-radio-types"

type RadioStationGridCardProps = {
  station: UzRadioStationDTO
  /** Ijro etilayotgan kartochka */
  isPlaying: boolean
  onToggle: (station: UzRadioStationDTO) => void
}

export function RadioStationGridCard({
  station,
  isPlaying,
  onToggle,
}: RadioStationGridCardProps) {
  const title = station.cardTitle ?? station.name
  const subtitle = station.frequencyLine ?? "FM"
  const logo = (station.logoSrc || station.favicon || "").trim()

  return (
    <button
      type="button"
      onClick={() => onToggle(station)}
      aria-pressed={isPlaying}
      className={cn(
        "radio-station-card group flex flex-col items-center gap-2 rounded-2xl p-2 sm:p-3 text-left transition-transform duration-200",
        "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        "hover:scale-[1.02] active:scale-[0.98]",
        isPlaying && "active"
      )}
    >
      <div
        className={cn(
          "radio-station-card-logo relative flex size-[5.5rem] shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:size-28",
          "bg-zinc-200/95 dark:bg-zinc-300/95",
          isPlaying
            ? "ring-2 ring-brand shadow-lg shadow-brand/25"
            : "ring-1 ring-white/10"
        )}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- tashqi favicon / mahalliy yo‘l
          <img
            src={logo}
            alt=""
            className="absolute inset-0 m-auto max-h-[88%] max-w-[88%] object-contain"
          />
        ) : (
          <RadioIcon className="size-10 text-zinc-500 sm:size-11" aria-hidden />
        )}
      </div>
      <span className="w-full text-center text-[13px] font-bold leading-tight text-white sm:text-sm">
        {title}
      </span>
      <span className="w-full text-center text-[11px] text-zinc-400 sm:text-xs">
        {subtitle}
      </span>
    </button>
  )
}
