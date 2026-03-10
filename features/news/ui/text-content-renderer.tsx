"use client"

import * as React from "react"
import { getYoutubeEmbedUrl } from "@/shared/common/lib/youtube"

type TextContentRendererProps = {
  content: string
}

function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const partsWithLinks: React.ReactNode[] = []
  let remaining = text
  let idx = 0
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/

  while (remaining.length > 0) {
    const match = remaining.match(linkRegex)
    if (!match || match.index === undefined) {
      partsWithLinks.push(remaining)
      break
    }
    if (match.index > 0) {
      partsWithLinks.push(remaining.slice(0, match.index))
    }
    partsWithLinks.push(
      <a
        key={`${keyBase}-link-${idx}`}
        href={match[2]}
        target="_blank"
        rel="noreferrer"
        className="text-blue-500 underline"
      >
        {match[1]}
      </a>
    )
    idx += 1
    remaining = remaining.slice(match.index + match[0].length)
  }

  const formatRegex = /(__([^_]+)__|\*\*([^*]+)\*\*|\*([^*]+)\*)/
  const finalParts: React.ReactNode[] = []

  partsWithLinks.forEach((segment, segIndex) => {
    if (typeof segment !== "string") {
      finalParts.push(segment)
      return
    }
    let rest = segment
    let subIdx = 0
    while (rest.length > 0) {
      const m = rest.match(formatRegex)
      if (!m || m.index === undefined) {
        finalParts.push(rest)
        break
      }
      if (m.index > 0) {
        finalParts.push(rest.slice(0, m.index))
      }
      const full = m[1]
      const underline = m[2]
      const bold = m[3]
      const italic = m[4]

      if (underline) {
        finalParts.push(
          <span key={`${keyBase}-u-${segIndex}-${subIdx}`} className="underline">
            {underline}
          </span>
        )
      } else if (bold) {
        finalParts.push(<strong key={`${keyBase}-b-${segIndex}-${subIdx}`}>{bold}</strong>)
      } else if (italic) {
        finalParts.push(<em key={`${keyBase}-i-${segIndex}-${subIdx}`}>{italic}</em>)
      } else {
        finalParts.push(full)
      }
      subIdx += 1
      rest = rest.slice(m.index + full.length)
    }
  })

  return finalParts
}

export function TextContentRenderer({ content }: TextContentRendererProps) {
  const rendered = React.useMemo(() => {
    const lines = content.split(/\r?\n/)
    const elements: React.ReactNode[] = []
    lines.forEach((line, i) => {
      const keyBase = `line-${i}`
      const trimmed = line.trim()

      if (!trimmed) {
        elements.push(<br key={keyBase} />)
        return
      }

      if (trimmed.startsWith("# ")) {
        elements.push(
          <h2 key={keyBase} className="text-lg font-semibold">
            {renderInline(trimmed.replace(/^#\s+/, ""), keyBase)}
          </h2>
        )
        return
      }
      if (trimmed.startsWith("## ")) {
        elements.push(
          <h3 key={keyBase} className="text-base font-semibold">
            {renderInline(trimmed.replace(/^##\s+/, ""), keyBase)}
          </h3>
        )
        return
      }
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h4 key={keyBase} className="text-sm font-semibold">
            {renderInline(trimmed.replace(/^###\s+/, ""), keyBase)}
          </h4>
        )
        return
      }
      if (trimmed.startsWith(">")) {
        elements.push(
          <blockquote
            key={keyBase}
            className="border-l-4 border-muted-foreground/40 pl-3 italic text-muted-foreground"
          >
            {renderInline(trimmed.replace(/^>\s?/, ""), keyBase)}
          </blockquote>
        )
        return
      }

      const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^\s)]+)\)$/)
      if (imageMatch) {
        elements.push(
          <div key={keyBase} className="my-3 mx-auto w-full max-w-3xl">
            <img
              src={imageMatch[2]}
              alt={imageMatch[1] || "image"}
              className="h-auto max-h-[460px] w-full rounded-md border object-cover"
            />
          </div>
        )
        return
      }

      const videoMatch = trimmed.match(/^@@video\((.+)\)$/)
      if (videoMatch) {
        const url = videoMatch[1]
        const embedUrl = getYoutubeEmbedUrl(url)
        if (embedUrl) {
          elements.push(
            <div key={keyBase} className="my-3 mx-auto aspect-video w-full max-w-3xl">
              <iframe
                src={embedUrl}
                className="h-full w-full rounded-md border"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video"
              />
            </div>
          )
        } else {
          elements.push(
            <video
              key={keyBase}
              src={url}
              controls
              controlsList="nodownload"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
              className="my-3 mx-auto aspect-video w-full max-w-3xl rounded-md border object-cover"
            />
          )
        }
        return
      }

      elements.push(
        <p key={keyBase} className="whitespace-pre-wrap">
          {renderInline(line, keyBase)}
        </p>
      )
    })

    return elements
  }, [content])

  return <div className="prose prose-neutral dark:prose-invert max-w-none">{rendered}</div>
}
