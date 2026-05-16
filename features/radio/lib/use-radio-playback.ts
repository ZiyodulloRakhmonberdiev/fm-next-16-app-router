"use client"

import * as React from "react"
import { bindStreamToAudio, resolveRadioPlaybackUrl } from "@/shared/common/lib/hls-audio"

export function useRadioPlayback(
  streamUrl: string | null,
  shouldPlay: boolean,
  onPlayError: () => void
) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const cleanupRef = React.useRef<(() => void) | null>(null)
  const wantPlayRef = React.useRef(shouldPlay)
  wantPlayRef.current = shouldPlay

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio || !streamUrl) {
      cleanupRef.current?.()
      cleanupRef.current = null
      return
    }
    cleanupRef.current?.()
    const url = resolveRadioPlaybackUrl(streamUrl)
    cleanupRef.current = bindStreamToAudio(audio, url, {
      onSourceReady: () => {
        if (wantPlayRef.current) {
          void audio.play().catch(onPlayError)
        }
      },
    })
    return () => {
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [streamUrl])

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio || !streamUrl) return
    if (shouldPlay) {
      void audio.play().catch(onPlayError)
    } else {
      audio.pause()
    }
  }, [shouldPlay, streamUrl, onPlayError])

  return audioRef
}
