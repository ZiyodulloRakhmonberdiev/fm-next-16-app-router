"use client"

import * as React from "react"
import { getYoutubeEmbedUrl } from "@/features/news/lib/youtube"
import { BiSolidQuoteAltLeft } from "react-icons/bi"

type LocalMediaLike = { url: string; file?: { name?: string } | null }

export type RichTextRenderOptions = {
  localImages?: LocalMediaLike[]
  localVideos?: LocalMediaLike[]
  className?: string
}

const COLOR_MAP: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  orange: "#f97316",
  purple: "#a855f7",
  gray: "#6b7280",
}

const BG_MAP: Record<string, string> = {
  yellow: "#fef08a",
  cyan: "#a5f3fc",
  green: "#bbf7d0",
  pink: "#fbcfe8",
  gray: "#e5e7eb",
  none: "transparent",
}

function fontStyleFor(name: string): React.CSSProperties {
  if (name === "serif") return { fontFamily: "serif" }
  if (name === "mono") return { fontFamily: "monospace" }
  if (name === "inter") return { fontFamily: "Inter, sans-serif" }
  if (name === "georgia") return { fontFamily: "Georgia, serif" }
  if (name === "display") return { fontFamily: "ui-rounded, system-ui, sans-serif" }
  return { fontFamily: "inherit" }
}

function parseInline(text: string, keyBase: string, depth = 0): React.ReactNode[] {
  if (depth > 8) return [text]

  const tokenRegex =
    /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\[color:(red|blue|green|orange|purple|gray)\]([\s\S]+?)\[\/color\]|\[bg:(yellow|cyan|green|pink|gray|none)\]([\s\S]+?)\[\/bg\]|\[font:(sans|serif|mono|inter|georgia|display)\]([\s\S]+?)\[\/font\]|<sub>([\s\S]+?)<\/sub>|<sup>([\s\S]+?)<\/sup>|<strong>([\s\S]+?)<\/strong>|<em>([\s\S]+?)<\/em>|<u>([\s\S]+?)<\/u>|<s>([\s\S]+?)<\/s>|~~([\s\S]+?)~~|`([^`]+)`|__([\s\S]+?)__|\*\*([\s\S]+?)\*\*|\*([\s\S]+?)\*)/

  const out: React.ReactNode[] = []
  let remaining = text
  let idx = 0

  while (remaining.length > 0) {
    const match = remaining.match(tokenRegex)
    if (!match || match.index === undefined) {
      out.push(remaining)
      break
    }
    if (match.index > 0) out.push(remaining.slice(0, match.index))

    const full = match[1]
    const linkLabel = match[2]
    const linkUrl = match[3]
    const colorName = match[4]
    const colorText = match[5]
    const bgName = match[6]
    const bgText = match[7]
    const fontName = match[8]
    const fontText = match[9]
    const subText = match[10]
    const supText = match[11]
    const strongText = match[12]
    const emText = match[13]
    const uText = match[14]
    const strikeTagText = match[15]
    const strikeMdText = match[16]
    const codeText = match[17]
    const underlineMd = match[18]
    const boldMd = match[19]
    const italicMd = match[20]

    if (linkLabel && linkUrl) {
      out.push(
        <a
          key={`${keyBase}-link-${idx}`}
          href={linkUrl}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 no-underline hover:underline"
        >
          {parseInline(linkLabel, `${keyBase}-link-${idx}`, depth + 1)}
        </a>
      )
    } else if (colorName && colorText) {
      out.push(
        <span key={`${keyBase}-c-${idx}`} style={{ color: COLOR_MAP[colorName] ?? colorName }}>
          {parseInline(colorText, `${keyBase}-c-${idx}`, depth + 1)}
        </span>
      )
    } else if (bgName && bgText) {
      out.push(
        <span key={`${keyBase}-bg-${idx}`} style={{ backgroundColor: BG_MAP[bgName] ?? "transparent" }}>
          {parseInline(bgText, `${keyBase}-bg-${idx}`, depth + 1)}
        </span>
      )
    } else if (fontName && fontText) {
      out.push(
        <span key={`${keyBase}-f-${idx}`} style={fontStyleFor(fontName)}>
          {parseInline(fontText, `${keyBase}-f-${idx}`, depth + 1)}
        </span>
      )
    } else if (subText) {
      out.push(<sub key={`${keyBase}-sub-${idx}`}>{parseInline(subText, `${keyBase}-sub-${idx}`, depth + 1)}</sub>)
    } else if (supText) {
      out.push(<sup key={`${keyBase}-sup-${idx}`}>{parseInline(supText, `${keyBase}-sup-${idx}`, depth + 1)}</sup>)
    } else if (strongText || boldMd) {
      out.push(
        <strong key={`${keyBase}-b-${idx}`}>
          {parseInline((strongText ?? boldMd) as string, `${keyBase}-b-${idx}`, depth + 1)}
        </strong>
      )
    } else if (emText || italicMd) {
      out.push(
        <em key={`${keyBase}-i-${idx}`}>
          {parseInline((emText ?? italicMd) as string, `${keyBase}-i-${idx}`, depth + 1)}
        </em>
      )
    } else if (uText || underlineMd) {
      out.push(
        <u key={`${keyBase}-u-${idx}`}>
          {parseInline((uText ?? underlineMd) as string, `${keyBase}-u-${idx}`, depth + 1)}
        </u>
      )
    } else if (strikeTagText || strikeMdText) {
      out.push(
        <s key={`${keyBase}-s-${idx}`}>
          {parseInline((strikeTagText ?? strikeMdText) as string, `${keyBase}-s-${idx}`, depth + 1)}
        </s>
      )
    } else if (codeText) {
      out.push(
        <code key={`${keyBase}-code-${idx}`} className="rounded bg-muted px-1 py-0.5 text-[0.9em]">
          {codeText}
        </code>
      )
    } else {
      out.push(full)
    }

    idx += 1
    remaining = remaining.slice(match.index + full.length)
  }

  return out
}

function wrapNodeByToken(token: string, children: React.ReactNode, key: string): React.ReactNode {
  if (token === "bold") return <strong key={key}>{children}</strong>
  if (token === "italic") return <em key={key}>{children}</em>
  if (token === "underline") return <u key={key}>{children}</u>
  if (token === "strike") return <s key={key}>{children}</s>
  if (token === "sub") return <sub key={key}>{children}</sub>
  if (token === "sup") return <sup key={key}>{children}</sup>
  if (token.startsWith("color:")) {
    const c = token.split(":")[1] ?? ""
    return (
      <span key={key} style={{ color: COLOR_MAP[c] ?? c }}>
        {children}
      </span>
    )
  }
  if (token.startsWith("bg:")) {
    const c = token.split(":")[1] ?? ""
    return (
      <span key={key} style={{ backgroundColor: BG_MAP[c] ?? "transparent" }}>
        {children}
      </span>
    )
  }
  if (token.startsWith("font:")) {
    const f = token.split(":")[1] ?? ""
    return (
      <span key={key} style={fontStyleFor(f)}>
        {children}
      </span>
    )
  }
  return <React.Fragment key={key}>{children}</React.Fragment>
}

export function renderRichText(content: string, options: RichTextRenderOptions = {}): React.ReactNode[] {
  const lines = content.split(/\r?\n/)
  const skipped = new Set<number>()
  const elements: React.ReactNode[] = []

  lines.forEach((line, i) => {
    if (skipped.has(i)) return
    const keyBase = `line-${i}`
    const trimmed = line.trim()

    if (!trimmed) {
      elements.push(<br key={keyBase} />)
      return
    }

    const wrapMatch = trimmed.match(/^@@wrap\((.+)\)$/)
    if (wrapMatch) {
      const token = wrapMatch[1]
      const blockLines: string[] = []
      let j = i + 1
      while (j < lines.length) {
        const next = lines[j]
        if (next.trim() === "@@/wrap") {
          skipped.add(j)
          break
        }
        blockLines.push(next)
        skipped.add(j)
        j += 1
      }
      const inner = blockLines.map((blockLine, idx) => (
        <p key={`${keyBase}-w-${idx}`} className="whitespace-pre-wrap">
          {parseInline(blockLine, `${keyBase}-w-${idx}`)}
        </p>
      ))
      elements.push(wrapNodeByToken(token, inner, `${keyBase}-wrap`))
      return
    }

    if (trimmed.startsWith("# ")) {
      elements.push(<h2 key={keyBase} className="text-lg font-semibold">{parseInline(trimmed.replace(/^#\s+/, ""), keyBase)}</h2>)
      return
    }
    if (trimmed.startsWith("## ")) {
      elements.push(<h3 key={keyBase} className="text-base font-semibold">{parseInline(trimmed.replace(/^##\s+/, ""), keyBase)}</h3>)
      return
    }
    if (trimmed.startsWith("### ")) {
      elements.push(<h4 key={keyBase} className="text-sm font-semibold">{parseInline(trimmed.replace(/^###\s+/, ""), keyBase)}</h4>)
      return
    }

    if (trimmed === "```") {
      const codeLines: string[] = []
      let j = i + 1
      while (j < lines.length) {
        const next = lines[j]
        if (next.trim() === "```") {
          skipped.add(j)
          break
        }
        codeLines.push(next)
        skipped.add(j)
        j += 1
      }
      elements.push(
        <pre key={keyBase} className="my-3 overflow-x-auto rounded-md border bg-muted/40 p-3 text-sm">
          <code>{codeLines.join("\n")}</code>
        </pre>
      )
      return
    }

    const alignMatch = trimmed.match(/^@@align\((left|center|right|end)\)$/)
    if (alignMatch) {
      const align = alignMatch[1] === "end" ? "right" : alignMatch[1]
      const blockLines: string[] = []
      let j = i + 1
      while (j < lines.length) {
        const next = lines[j]
        if (next.trim() === "@@/align") {
          skipped.add(j)
          break
        }
        blockLines.push(next)
        skipped.add(j)
        j += 1
      }
      elements.push(
        <div key={keyBase} className={align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"}>
          {blockLines.map((blockLine, idx) => (
            <p key={`${keyBase}-a-${idx}`} className="whitespace-pre-wrap">
              {parseInline(blockLine, `${keyBase}-a-${idx}`)}
            </p>
          ))}
        </div>
      )
      return
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [trimmed.replace(/^>\s?/, "")]
      let j = i + 1
      while (j < lines.length) {
        const nextTrimmed = lines[j].trim()
        if (!nextTrimmed.startsWith(">")) break
        quoteLines.push(nextTrimmed.replace(/^>\s?/, ""))
        skipped.add(j)
        j += 1
      }
      elements.push(
        <div key={keyBase} className="my-3 rounded-md bg-brand/10 dark:bg-card p-4">
          <div className="relative">
            <span className="absolute -left-3 -top-4 text-4xl leading-none">
              <BiSolidQuoteAltLeft className="size-7 text-brand/10 dark:text-muted-foreground/20" />
            </span>
            <blockquote className="italic text-foreground/90 pt-2">
              {quoteLines.map((qLine, qIdx) => (
                <p key={`${keyBase}-q-${qIdx}`} className={qIdx === 0 ? "m-0" : "m-0 mt-1"}>
                  {parseInline(qLine, `${keyBase}-q-${qIdx}`)}
                </p>
              ))}
            </blockquote>
          </div>
        </div>
      )
      return
    }

    if (/^[-*•]\s+/.test(trimmed)) {
      elements.push(
        <div key={keyBase} className="my-1 flex items-start gap-2">
          <span className="mt-2.5 size-2 rounded-full border border-muted-foreground/50 bg-foreground" />
          <p className="m-0">{parseInline(trimmed.replace(/^[-*•]\s+/, ""), keyBase)}</p>
        </div>
      )
      return
    }

    if (/^\d+[.)]\s+/.test(trimmed)) {
      const num = trimmed.match(/^(\d+)[.)]\s+/)?.[1] ?? "1"
      elements.push(
        <div key={keyBase} className="my-1 flex items-start gap-2">
          <span className="mt-0.5 min-w-6 text-sm font-semibold text-muted-foreground">{num}.</span>
          <p className="m-0">{parseInline(trimmed.replace(/^\d+[.)]\s+/, ""), keyBase)}</p>
        </div>
      )
      return
    }

    const captionMatch = trimmed.match(/^@@caption\((.+)\)$/)
    if (captionMatch) {
      elements.push(
        <p key={keyBase} className="mt-1 px-2 py-1 text-xs text-muted-foreground">
          {parseInline(captionMatch[1], keyBase)}
        </p>
      )
      return
    }

    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^\s)]+)\)$/)
    if (imgMatch) {
      elements.push(
        <div key={keyBase} className="my-2">
          <img src={imgMatch[2]} alt={imgMatch[1] || "image"} className="w-full rounded-md border object-cover" />
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
          <div key={keyBase} className="my-3 aspect-video w-full">
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
            className="my-3 aspect-video w-full rounded-md border object-cover"
          />
        )
      }
      return
    }

    const audioMatch = trimmed.match(/^@@audio\((.+)\)$/)
    if (audioMatch) {
      elements.push(
        <audio
          key={keyBase}
          src={audioMatch[1]}
          controls
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          className="my-3 w-full rounded-md border bg-background p-2"
        />
      )
      return
    }

    const localImgMatch = trimmed.match(/^@@local-image\((\d+)\)$/)
    if (localImgMatch) {
      const item = options.localImages?.[parseInt(localImgMatch[1], 10)]
      if (item) {
        elements.push(
          <div key={keyBase} className="my-2">
            <img src={item.url} alt={item.file?.name ?? "image"} className="w-full rounded-md border object-cover" />
          </div>
        )
      }
      return
    }

    const localVidMatch = trimmed.match(/^@@local-video\((\d+)\)$/)
    if (localVidMatch) {
      const item = options.localVideos?.[parseInt(localVidMatch[1], 10)]
      if (item) {
        elements.push(
          <video
            key={keyBase}
            src={item.url}
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

    elements.push(
      <p key={keyBase} className="whitespace-pre-wrap">
        {parseInline(line, keyBase)}
      </p>
    )
  })

  return elements
}

export function RichTextContent({ content, ...options }: { content: string } & RichTextRenderOptions) {
  const rendered = React.useMemo(
    () => renderRichText(content, options),
    [content, options.localImages, options.localVideos]
  )

  return (
    <div className={options.className ?? "prose prose-sm max-w-none dark:prose-invert"}>
      {rendered}
    </div>
  )
}
