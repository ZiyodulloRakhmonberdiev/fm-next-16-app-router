
"use client"

import { useMemo, useRef, useState } from "react"
import {
  LinkIcon,
  BoldIcon,
  ItalicIcon,
  QuoteIcon,
  ImageIcon,
  PlaySquareIcon,
} from "lucide-react"
import { Button } from "@/shared/common/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/common/components/ui/dialog"
import { Label } from "@/shared/common/components/ui/label"
import { cn } from "@/shared/common/lib/utils"
import {
  latinToCyrillicUz,
  cyrillicToLatinUz,
} from "@/features/news/lib/latin-cyrill-translator"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import { toast } from "sonner"
import { uploadFileViaPresignedUrl } from "@/shared/infra/cloudinary-client-upload"

type LocalMedia = {
  id: string
  url: string
  file: File
}

type ContentFormProps = {
  locale: AppLocale
  value: string
  allContents: Record<AppLocale, string>
  onChange: (next: string) => void
}

const placeholder = "Matn kiriting..."

export function ContentForm({
  locale,
  value,
  allContents,
  onChange,
}: ContentFormProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [localImages, setLocalImages] = useState<LocalMedia[]>([])
  const [localVideos, setLocalVideos] = useState<LocalMedia[]>([])
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [mediaSource, setMediaSource] = useState<"url" | "local">("url")

  const content = value

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const updateContent = (updater: (prev: string) => string) => {
    onChange(updater(content))
  }

  const uploadMedia = async (file: File, kind: "image" | "video"): Promise<string> => {
    return uploadFileViaPresignedUrl(file, kind)
  }

  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current

    if (!textarea) {
      updateContent((prev) => prev + textToInsert)
      return
    }

    const start = textarea.selectionStart ?? content.length
    const end = textarea.selectionEnd ?? content.length

    const next = content.slice(0, start) + textToInsert + content.slice(end)

    onChange(next)

    requestAnimationFrame(() => {
      const pos = start + textToInsert.length
      textarea.focus()
      textarea.setSelectionRange(pos, pos)
    })
  }

  const applyAroundSelection = (before: string, after: string = before) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart ?? 0
    const end = textarea.selectionEnd ?? 0

    const selected = content.slice(start, end)
    const next =
      content.slice(0, start) + before + selected + after + content.slice(end)

    onChange(next)

    requestAnimationFrame(() => {
      const pos = start + before.length + selected.length + after.length
      textarea.focus()
      textarea.setSelectionRange(pos, pos)
    })
  }

  const handleInsertLink = () => {
    const url = prompt("Havola URL manzilini kiriting:")
    if (!url) return
    applyAroundSelection("[", `](${url})`)
  }

  const handleAddImageUrl = () => {
    const trimmed = imageUrl.trim()
    if (!trimmed) return
    const line = `\n![rasm](${trimmed})\n`
    insertAtCursor(line)
    setImageUrl("")
  }

  const handleAddVideoUrl = () => {
    const trimmed = videoUrl.trim()
    if (!trimmed) return
    const line = `\n@@video(${trimmed})\n`
    insertAtCursor(line)
    setVideoUrl("")
  }

  const handleLocalImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const selected = Array.from(files)
    const uploadedUrls: string[] = []
    for (const file of selected) {
      try {
        const uploadedUrl = await uploadMedia(file, "image")
        uploadedUrls.push(uploadedUrl)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Rasm upload bo'lmadi")
      }
    }

    if (uploadedUrls.length > 0) {
      const markers = uploadedUrls.map((url) => `\n![rasm](${url})\n`).join("")
      insertAtCursor(markers)
    }
    e.target.value = ""
  }

  const handleLocalVideos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const selected = Array.from(files)
    const uploadedUrls: string[] = []
    for (const file of selected) {
      try {
        const uploadedUrl = await uploadMedia(file, "video")
        uploadedUrls.push(uploadedUrl)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Video upload bo'lmadi")
      }
    }

    if (uploadedUrls.length > 0) {
      const markers = uploadedUrls.map((url) => `\n@@video(${url})\n`).join("")
      insertAtCursor(markers)
    }
    e.target.value = ""
  }

  const renderedPreview = useMemo(() => {
    const lines = content.split(/\r?\n/)

    const renderInline = (text: string, keyBase: string) => {
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
              <span
                key={`${keyBase}-u-${segIndex}-${subIdx}`}
                className="underline"
              >
                {underline}
              </span>
            )
          } else if (bold) {
            finalParts.push(
              <strong key={`${keyBase}-b-${segIndex}-${subIdx}`}>
                {bold}
              </strong>
            )
          } else if (italic) {
            finalParts.push(
              <em key={`${keyBase}-i-${segIndex}-${subIdx}`}>{italic}</em>
            )
          } else {
            finalParts.push(full)
          }
          subIdx += 1
          rest = rest.slice(m.index + full.length)
        }
      })

      return finalParts
    }

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

      const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^\s)]+)\)$/)
      if (imgMatch) {
        elements.push(
          <div key={keyBase} className="my-2">
            <img
              src={imgMatch[2]}
              alt={imgMatch[1] || "image"}
              className="w-full rounded-md border object-cover"
            />
          </div>
        )
        return
      }

      const videoMatch = trimmed.match(/^@@video\((.+)\)$/)
      if (videoMatch) {
        const url = videoMatch[1]
        const youtubeMatch = url.match(
          /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        )
        const youtubeId =
          youtubeMatch && youtubeMatch[2]?.length === 11
            ? youtubeMatch[2]
            : null

        if (youtubeId) {
          elements.push(
            <div key={keyBase} className="my-3 aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
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

      const localImgMatch = trimmed.match(/^@@local-image\((\d+)\)$/)
      if (localImgMatch) {
        const idx = parseInt(localImgMatch[1], 10)
        const item = localImages[idx]
        if (item) {
          elements.push(
            <div key={keyBase} className="my-2">
              <img
                src={item.url}
                alt={item.file.name}
                className="w-full rounded-md border object-cover"
              />
            </div>
          )
        }
        return
      }

      const localVidMatch = trimmed.match(/^@@local-video\((\d+)\)$/)
      if (localVidMatch) {
        const idx = parseInt(localVidMatch[1], 10)
        const item = localVideos[idx]
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
          {renderInline(line, keyBase)}
        </p>
      )
    })

    return elements
  }, [content, localImages, localVideos])

  // Generate: uz <-> uzb (translit) yoki boshqa tillar uchun nusxa
  type GenerateMode = "copy" | "uzToUzb" | "uzbToUz" | null

  const computeGenerateSource = (): {
    mode: GenerateMode
    source: string
  } => {
    // uzb tab: uz dan kirillga o'tkazish
    if (locale === "uzb" && allContents.uz?.trim()) {
      return { mode: "uzToUzb", source: allContents.uz }
    }
    // uz tab: uzb dan lotinga o'tkazish
    if (locale === "uz" && allContents.uzb?.trim()) {
      return { mode: "uzbToUz", source: allContents.uzb }
    }
    // qolgan tillar (ru, en ...) uchun: uz yoki uzb dan nusxa
    if (locale !== "uz" && locale !== "uzb") {
      if (allContents.uz?.trim()) {
        return { mode: "copy", source: allContents.uz }
      }
      if (allContents.uzb?.trim()) {
        return { mode: "copy", source: allContents.uzb }
      }
    }
    return { mode: null, source: "" }
  }

  const convertContentPreserveMarkup = (
    source: string,
    mode: GenerateMode
  ): string => {
    if (!source || !mode || mode === "copy") return source

    const convert =
      mode === "uzToUzb" ? latinToCyrillicUz : cyrillicToLatinUz

    return source
      .split(/\r?\n/)
      .map((line) => {
        const trimmed = line.trim()

        // to'liq media markerlarini buzmaymiz
        if (
          /^@@video\(.+\)$/.test(trimmed) ||
          /^@@local-image\(\d+\)$/.test(trimmed) ||
          /^@@local-video\(\d+\)$/.test(trimmed) ||
          /^!\[[^\]]*]\(((?:https?:\/\/|\/)[^\s)]+)\)$/.test(trimmed)
        ) {
          return line
        }

        // [text](url) bloklarini saqlab, tashqaridagi matnni translit qilamiz
      const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
        let result = ""
        let lastIndex = 0
        let match: RegExpExecArray | null

        while ((match = linkRegex.exec(line)) !== null) {
          const before = line.slice(lastIndex, match.index)
          result += convert(before)
          // Faqat link label (matn)ni translit qilamiz, URLni o'zgartirmaymiz
          const label = match[1]
          const url = match[2]
          result += `[${convert(label)}](${url})`
          lastIndex = match.index + match[0].length
        }

        const tail = line.slice(lastIndex)
        result += convert(tail)

        return result
      })
      .join("\n")
  }

  const { mode: generateMode, source: generateSource } =
    computeGenerateSource()
  const canGenerate = !!generateMode && !!generateSource.trim()

  const handleGenerate = () => {
    if (!canGenerate || !generateMode) return
    const next =
      generateMode === "copy"
        ? generateSource
        : convertContentPreserveMarkup(generateSource, generateMode)
    onChange(next)
  }

  return (
    <div className="space-y-4 bg-background w-full overflow-hidden rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2 border-b pb-2 text-sm">
        <span className="font-medium text-muted-foreground">Matn tahrirlash</span>
        <div className="ml-auto flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => applyAroundSelection("**")}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
          >
            <BoldIcon className="size-3.5" />
            Bold
          </button>
          <button
            type="button"
            onClick={() => applyAroundSelection("*")}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
          >
            <ItalicIcon className="size-3.5" />
            Italik
          </button>
          <button
            type="button"
            onClick={() => applyAroundSelection("__")}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
          >
            <span className="text-xs font-semibold underline">U</span>
            Underline
          </button>
          <button
            type="button"
            onClick={() => updateContent((prev) => `# ${prev}`)}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
          >
            <span className="text-xs font-semibold">H1</span>
          </button>
          <button
            type="button"
            onClick={() => updateContent((prev) => `## ${prev}`)}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
          >
            <span className="text-xs font-semibold">H2</span>
          </button>
          <button
            type="button"
            onClick={() => updateContent((prev) => `### ${prev}`)}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
          >
            <span className="text-xs font-semibold">H3</span>
          </button>
          <button
            type="button"
            onClick={handleInsertLink}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
          >
            <LinkIcon className="size-3.5" />
            Link
          </button>
          <button
            type="button"
            onClick={() => updateContent((prev) => `${prev}\n> Quote matn...\n`)}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
          >
            <QuoteIcon className="size-3.5" />
            Quote
          </button>
          <button
            type="button"
            onClick={() => {
              setMediaSource("url")
              setImageModalOpen(true)
            }}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
          >
            <ImageIcon className="size-3.5" />
            Rasm
          </button>
          <button
            type="button"
            onClick={() => {
              setMediaSource("url")
              setVideoModalOpen(true)
            }}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
          >
            <PlaySquareIcon className="size-3.5" />
            Video
          </button>
          
        </div>
      </div>

      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rasm qo&apos;shish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMediaSource("url")}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium",
                  mediaSource === "url"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted"
                )}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setMediaSource("local")}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium",
                  mediaSource === "local"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted"
                )}
              >
                Local fayl
              </button>
            </div>
            {mediaSource === "url" ? (
              <div className="space-y-2">
                <Label className="text-xs">Rasm manzili</Label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      handleAddImageUrl()
                      setImageModalOpen(false)
                    }}
                    disabled={!imageUrl.trim()}
                  >
                    Qo&apos;shish
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs">Fayl tanlang</Label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    handleLocalImages(e)
                    setImageModalOpen(false)
                  }}
                  className="w-full text-sm"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Video qo&apos;shish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMediaSource("url")}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium",
                  mediaSource === "url"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted"
                )}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setMediaSource("local")}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium",
                  mediaSource === "local"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted"
                )}
              >
                Local fayl
              </button>
            </div>
            {mediaSource === "url" ? (
              <div className="space-y-2">
                <Label className="text-xs">Video manzili (yoki YouTube link)</Label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      handleAddVideoUrl()
                      setVideoModalOpen(false)
                    }}
                    disabled={!videoUrl.trim()}
                  >
                    Qo&apos;shish
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs">Fayl tanlang</Label>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => {
                    handleLocalVideos(e)
                    setVideoModalOpen(false)
                  }}
                  className="w-full text-sm"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-64 w-full resize-vertical rounded-md border bg-background px-3 py-2 text-sm  outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
          />
          <Button
            type="button"
            variant="default"
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            Tarjima qilish
          </Button>
        </div>

        <div className="space-y-3 rounded-md border bg-muted/30 p-3">
          <div className="mb-1 text-xs font-semibold text-muted-foreground">
            Preview
          </div>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {renderedPreview}
          </div>
        </div>
      </div>
    </div>
  )
}