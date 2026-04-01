"use client"

import * as React from "react"
import { getYoutubeEmbedUrl } from "@/features/news/lib/youtube"
import { QuoteIcon } from "lucide-react"
import { BiSolidQuoteAltLeft } from "react-icons/bi";


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
        className="text-blue-500 no-underline hover:underline"
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
          <div key={keyBase} className="my-3 rounded-md bg-brand/10 dark:bg-card p-4">
            <div className="relative">
              <span className="absolute -left-3 -top-4 text-4xl leading-none text-  e-300">
                <BiSolidQuoteAltLeft className="size-7 text-brand/10 dark:text-muted-foreground/20" />
              </span>
              <blockquote className="italic text-foreground/90 pt-2">
                {renderInline(trimmed.replace(/^>\s?/, ""), keyBase)}
              </blockquote>
            </div>
          </div>
        )
        return
      }

      if (/^[-*•]\s+/.test(trimmed)) {
        elements.push(
          <div key={keyBase} className="my-1 flex items-center gap-2 ml-2">
            <div className="mt-1.5 size-4 rounded-full border bg-foreground/80 flex items-center justify-center"><span className="size-2 rounded-full bg-background block"></span></div>
            <p className="m-0 font-bold">{renderInline(trimmed.replace(/^[-*•]\s+/, ""), keyBase)}</p>
          </div>
        )
        return
      }

      if (/^\d+[.)]\s+/.test(trimmed)) {
        const num = trimmed.match(/^(\d+)[.)]\s+/)?.[1] ?? "1"
        elements.push(
          <div key={keyBase} className="my-1 flex items-start gap-2">
            <span className="ml-2 mt-0.5 min-w-4 text-sm font-bold text-foreground/80">
              {num}.
            </span>
            <p className="m-0 font-bold">{renderInline(trimmed.replace(/^\d+[.)]\s+/, ""), keyBase)}</p>
          </div>
        )
        return
      }

      const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^\s)]+)\)$/)
      if (imageMatch) {
        elements.push(
          <div key={keyBase} className="my-3 w-full">
            <img
              src={imageMatch[2]}
              alt={imageMatch[1] || "image"}
              className="h-auto w-full object-cover"
            />
          </div>
        )
        return
      }

      const captionMatch = trimmed.match(/^@@caption\((.+)\)$/)
      if (captionMatch) {
        elements.push(
          <p key={keyBase} className="px-2 text-xs -mt-1  ">
            {renderInline(captionMatch[1], keyBase)}
          </p>
        )
        return
      }

      const videoMatch = trimmed.match(/^@@video\((.+)\)$/)
      if (videoMatch) {
        const url = videoMatch[1]
        const embedUrl = getYoutubeEmbedUrl(url)
        if (embedUrl) {
          elements.push(
            <div key={keyBase} className="my-3 aspect-video w-full">
              <iframe
                src={embedUrl}
                className="h-full w-full"
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
              className="my-3 aspect-video w-full rounded-md border object-cover"
            />
          )
        }
        return
      }

      const audioMatch = trimmed.match(/^@@audio\((.+)\)$/)
      if (audioMatch) {
        const url = audioMatch[1]
        elements.push(
          <audio
            key={keyBase}
            src={url}
            controls
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            className="my-3 w-full bg-foreground/10 border dark:border-0 rounded-full"
          />
        )
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
