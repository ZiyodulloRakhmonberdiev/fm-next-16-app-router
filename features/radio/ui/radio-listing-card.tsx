"use client"

import { Pause, Play, Radio as RadioIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/shared/common/lib/utils"
import type { UzRadioStationDTO } from "@/features/radio/model/uz-radio-types"

type RadioListingCardProps = {
  station: UzRadioStationDTO
  isActive: boolean
  isPlaying: boolean
  onPlay: (station: UzRadioStationDTO) => void
}

export function RadioListingCard({
  station,
  isActive,
  isPlaying,
  onPlay,
}: RadioListingCardProps) {
  const t = useTranslations("common")
  const thumbSrc = station.favicon?.trim() || ""

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${t("radio")}: ${station.name}`}
      onClick={() => onPlay(station)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPlay(station)}
      className={cn(
        "group relative flex gap-0 overflow-hidden rounded-sm border transition-all duration-200 cursor-pointer outline-none",
        isActive
          ? ""
          : "border-border/60 bg-card hover:border-brand/20 hover:shadow-sm hover:bg-card/80"
      )}
    >
      <div className="flex w-full gap-0 sm:gap-0">
        <div className="relative md:w-24 md:h-24 w-16 h-16 shrink-0 overflow-hidden rounded-sm bg-muted flex items-center justify-center">
          {thumbSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- tashqi favicon domenlari cheksiz
            <img
              src={thumbSrc}
              alt=""
              className="absolute inset-0 m-auto max-h-[85%] max-w-[85%] object-contain"
            />
          ) : (
            <RadioIcon className="size-8 text-brand/50" aria-hidden />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between px-3 py-1 md:p-4">
          <div className="hidden md:flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground uppercase tracking-wide">
              <span
                className={cn(
                  "block h-1.5 w-1.5 rounded-full",
                  isActive ? "bg-brand animate-pulse" : "bg-muted-foreground/50"
                )}
              />
              {t("radio")}
            </span>
            {station.bitrate ? (
              <span className="text-[11px] text-muted-foreground">
                {station.bitrate} kbps
              </span>
            ) : null}
          </div>

          <p
            className={cn(
              "text-sm font-semibold leading-snug line-clamp-2 lg:line-clamp-4 transition-colors duration-200"
            )}
          >
            {station.name}
          </p>

          <div className="md:pt-2 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {station.codec ? station.codec : "\u00a0"}
            </span>
            {isActive ? (
              <span
                className={cn(
                  "text-[11px] font-medium transition-colors",
                  isPlaying ? "text-brand" : "text-muted-foreground"
                )}
              >
                {isPlaying ? t("radio_live") : t("radio_paused")}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label={isActive && isPlaying ? "Pause" : "Play"}
        className={cn(
          "hidden md:flex items-center justify-center p-4 pr-2 transition-all duration-200 mx-4",
          isActive ? "opacity-100" : "group-hover:opacity-100"
        )}
      >
        <span
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-full shadow-lg ring-2 transition-all duration-200",
            isActive ? "bg-brand text-white" : "scale-90 group-hover:scale-100"
          )}
        >
          {isActive && isPlaying ? (
            <Pause className="size-4 fill-white ml-0.5 text-white" />
          ) : (
            <Play className="size-4 fill-white ml-0.5" />
          )}
        </span>
      </button>
    </article>
  )
}
