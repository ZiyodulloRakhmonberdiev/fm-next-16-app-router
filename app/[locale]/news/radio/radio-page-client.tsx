"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { RadioStationGridCard } from "@/features/radio/ui/radio-station-grid-card"
import type { UzRadioStationDTO } from "@/features/radio/model/uz-radio-types"
import { useRadioPlayback } from "@/features/radio/lib/use-radio-playback"

export function RadioNewsPageClient() {
  const t = useTranslations("common")

  const [stations, setStations] = React.useState<UzRadioStationDTO[]>([])
  const [stationsLoading, setStationsLoading] = React.useState(true)
  const [stationsError, setStationsError] = React.useState(false)

  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)

  const activeStation = activeIndex !== null ? stations[activeIndex] ?? null : null
  const streamUrl = activeStation?.streamUrl ?? null

  const onPlayError = React.useCallback(() => {
    setIsPlaying(false)
  }, [])

  const audioRef = useRadioPlayback(streamUrl, Boolean(streamUrl && isPlaying), onPlayError)

  React.useEffect(() => {
    let cancelled = false
    setStationsLoading(true)
    setStationsError(false)
    fetch("/api/radio/uz")
      .then((r) => {
        if (!r.ok) throw new Error("bad response")
        return r.json()
      })
      .then((json) => {
        if (!json || cancelled) return
        const list = Array.isArray(json.stations) ? (json.stations as UzRadioStationDTO[]) : []
        setStations(list)
      })
      .catch(() => {
        if (!cancelled) {
          setStations([])
          setStationsError(true)
        }
      })
      .finally(() => {
        if (!cancelled) setStationsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleToggle = React.useCallback(
    (station: UzRadioStationDTO) => {
      const idx = stations.findIndex((s) => s.id === station.id)
      if (idx === -1) return
      if (activeIndex === idx) {
        setIsPlaying((prev) => !prev)
      } else {
        setActiveIndex(idx)
        setIsPlaying(true)
      }
    },
    [stations, activeIndex]
  )

  return (
    <div className="min-h-[60vh] bg-zinc-950 pb-10 pt-4 md:min-h-[70vh] md:pt-6">
      <audio ref={audioRef} className="hidden" playsInline preload="none" />

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {stationsLoading ? (
          <div className="py-16 text-center text-sm text-zinc-400">{t("loading")}</div>
        ) : stations.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-400">
            {stationsError ? t("radio_load_error") : t("radio_stations_empty")}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {stations.map((station, idx) => (
              <RadioStationGridCard
                key={station.id}
                station={station}
                isPlaying={activeIndex === idx && isPlaying}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
