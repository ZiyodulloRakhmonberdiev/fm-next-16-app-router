
"use client"

import { useEffect, useRef, useState } from "react"
import {
  LinkIcon,
  BoldIcon,
  ItalicIcon,
  QuoteIcon,
  ImageIcon,
  PlaySquareIcon,
  ListIcon,
  ListOrderedIcon,
  AudioLinesIcon,
  Undo2Icon,
  Redo2Icon,
  StrikethroughIcon,
  Code2Icon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
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
import { RichTextContent } from "@/features/news/lib/rich-text-renderer"

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
  enabledTools?: EditorToolId[]
}

const placeholder = "Matn kiriting..."

export type EditorToolId =
  | "undo"
  | "redo"
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "sub"
  | "sup"
  | "code"
  | "h1"
  | "h2"
  | "h3"
  | "link"
  | "quote"
  | "bullet"
  | "numbered"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "color"
  | "bg"
  | "font"
  | "image"
  | "video"
  | "audio"

function getCaretPositionInTextarea(
  textarea: HTMLTextAreaElement,
  caretIndex: number
): { top: number; left: number } {
  const div = document.createElement("div")
  const style = window.getComputedStyle(textarea)
  const properties = [
    "boxSizing",
    "width",
    "height",
    "overflowX",
    "overflowY",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "fontStretch",
    "fontSize",
    "fontSizeAdjust",
    "lineHeight",
    "fontFamily",
    "textAlign",
    "textTransform",
    "textIndent",
    "textDecoration",
    "letterSpacing",
    "wordSpacing",
    "tabSize",
  ] as const

  div.style.position = "absolute"
  div.style.visibility = "hidden"
  div.style.whiteSpace = "pre-wrap"
  div.style.wordWrap = "break-word"

  properties.forEach((prop) => {
    const value = style.getPropertyValue(prop)
    div.style.setProperty(prop, value)
  })

  div.textContent = textarea.value.slice(0, caretIndex)
  const marker = document.createElement("span")
  marker.textContent = textarea.value.slice(caretIndex) || "."
  div.appendChild(marker)
  document.body.appendChild(div)

  const top = marker.offsetTop - textarea.scrollTop
  const left = marker.offsetLeft - textarea.scrollLeft
  document.body.removeChild(div)
  return { top, left }
}

export function ContentForm({
  locale,
  value,
  allContents,
  onChange,
  enabledTools,
}: ContentFormProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [audioUrl, setAudioUrl] = useState("")
  const [imageCaption, setImageCaption] = useState("")
  const [videoCaption, setVideoCaption] = useState("")
  const [audioCaption, setAudioCaption] = useState("")
  const [localImages, setLocalImages] = useState<LocalMedia[]>([])
  const [localVideos, setLocalVideos] = useState<LocalMedia[]>([])
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [audioModalOpen, setAudioModalOpen] = useState(false)
  const [mediaSource, setMediaSource] = useState<"url" | "local">("url")
  const [mobileViewMode, setMobileViewMode] = useState<"edit" | "preview" | "split">("edit")
  const [debouncedContent, setDebouncedContent] = useState(value)
  const [slashMenuOpen, setSlashMenuOpen] = useState(false)
  const [slashQuery, setSlashQuery] = useState("")
  const [slashActiveIndex, setSlashActiveIndex] = useState(0)
  const [slashPosition, setSlashPosition] = useState({ top: 0, left: 0 })
  const [activeColor, setActiveColor] = useState<"red" | "blue" | "green" | "orange" | "purple" | "gray" | "">("")
  const [activeBg, setActiveBg] = useState<"yellow" | "cyan" | "green" | "pink" | "gray" | "none" | "">("")
  const [activeFont, setActiveFont] = useState<"sans" | "serif" | "mono" | "inter" | "georgia" | "display" | "">("")

  const content = value
  const isToolEnabled = (tool: EditorToolId) =>
    !enabledTools || enabledTools.includes(tool)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const editorRootRef = useRef<HTMLDivElement | null>(null)
  const undoStackRef = useRef<string[]>([])
  const redoStackRef = useRef<string[]>([])

  const applyContent = (next: string, trackHistory = true) => {
    if (next === content) return
    if (trackHistory) {
      undoStackRef.current.push(content)
      if (undoStackRef.current.length > 200) {
        undoStackRef.current = undoStackRef.current.slice(-200)
      }
      redoStackRef.current = []
    }
    onChange(next)
  }

  const canUndo = undoStackRef.current.length > 0
  const canRedo = redoStackRef.current.length > 0

  const handleUndo = () => {
    const prev = undoStackRef.current.pop()
    if (prev === undefined) return
    redoStackRef.current.push(content)
    onChange(prev)
  }

  const handleRedo = () => {
    const next = redoStackRef.current.pop()
    if (next === undefined) return
    undoStackRef.current.push(content)
    onChange(next)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedContent(content), 150)
    return () => window.clearTimeout(timer)
  }, [content])

  useEffect(() => {
    if (mobileViewMode !== "preview" && mobileViewMode !== "split") return
    setSlashMenuOpen(false)
    setSlashQuery("")
    setSlashActiveIndex(0)
  }, [mobileViewMode])

  useEffect(() => {
    if (!slashMenuOpen) return
    const onPointerDown = (event: MouseEvent) => {
      const root = editorRootRef.current
      if (!root) return
      if (root.contains(event.target as Node)) return
      setSlashMenuOpen(false)
      setSlashQuery("")
      setSlashActiveIndex(0)
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [slashMenuOpen])

  const updateContent = (updater: (prev: string) => string) => {
    applyContent(updater(content))
  }

  const uploadMedia = async (
    file: File,
    kind: "image" | "video" | "audio"
  ): Promise<string> => {
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

    applyContent(next)

    requestAnimationFrame(() => {
      const pos = start + textToInsert.length
      textarea.focus()
      textarea.setSelectionRange(pos, pos)
    })
  }

  const normalizeBlankLines = (text: string): string => {
    const lines = text.split(/\r?\n/)
    const out: string[] = []
    let emptyStreak = 0

    lines.forEach((line) => {
      const isEmpty = line.trim() === ""
      if (isEmpty) {
        emptyStreak += 1
        if (emptyStreak <= 1) out.push("")
      } else {
        emptyStreak = 0
        out.push(line)
      }
    })

    return out.join("\n")
  }

  const applyAroundSelection = (before: string, after: string = before) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart ?? 0
    const end = textarea.selectionEnd ?? 0

    const selected = content.slice(start, end)
    const next =
      content.slice(0, start) + before + selected + after + content.slice(end)

    applyContent(next)

    requestAnimationFrame(() => {
      const hasSelection = selected.length > 0
      const pos = hasSelection
        ? start + before.length + selected.length + after.length
        : start + before.length
      textarea.focus()
      textarea.setSelectionRange(pos, pos)
    })
  }

  const handleInsertLink = () => {
    const url = prompt("Havola URL manzilini kiriting:")
    if (!url) return
    applyAroundSelection("[", `](${url})`)
  }

  const applyPrefixToSelectionLines = (prefixFactory: (lineIndex: number) => string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart ?? 0
    const end = textarea.selectionEnd ?? 0
    if (start === end) {
      const lineStart = content.lastIndexOf("\n", Math.max(0, start - 1)) + 1
      const next = content.slice(0, lineStart) + prefixFactory(0) + content.slice(lineStart)
      applyContent(next)
      requestAnimationFrame(() => {
        const pos = start + prefixFactory(0).length
        textarea.focus()
        textarea.setSelectionRange(pos, pos)
      })
      return
    }
    const beforeSelection = content.slice(0, start)
    const selected = content.slice(start, end)
    const afterSelection = content.slice(end)
    const selectedLines = selected.split("\n")
    const nextSelected = selectedLines
      .map((line, idx) => {
        if (!line.trim()) return line
        return `${prefixFactory(idx)}${line}`
      })
      .join("\n")

    const next = `${beforeSelection}${nextSelected}${afterSelection}`
    applyContent(next)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start, start + nextSelected.length)
    })
  }

  const applyHeadingAtCursor = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart ?? 0
    const end = textarea.selectionEnd ?? 0
    const lineStart = content.lastIndexOf("\n", Math.max(0, start - 1)) + 1

    if (start !== end) {
      applyPrefixToSelectionLines(() => prefix)
      return
    }

    const next = content.slice(0, lineStart) + prefix + content.slice(lineStart)
    applyContent(next)
    requestAnimationFrame(() => {
      const pos = start + prefix.length
      textarea.focus()
      textarea.setSelectionRange(pos, pos)
    })
  }

  const applyQuoteAtCursor = () => {
    applyPrefixToSelectionLines(() => "> ")
  }

  const wrapBlock = (startMarker: string, endMarker: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart ?? 0
    const end = textarea.selectionEnd ?? 0
    const selected = content.slice(start, end).trim()
    const inner = selected || "Matn..."
    const insert = `${startMarker}\n${inner}\n${endMarker}`
    const next = content.slice(0, start) + insert + content.slice(end)
    applyContent(next)
    requestAnimationFrame(() => {
      const pos = start + startMarker.length + 1
      textarea.focus()
      textarea.setSelectionRange(pos, pos + inner.length)
    })
  }

  const applyInlineToken = (kind: "color" | "bg" | "font", valueToken: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart ?? 0
    const end = textarea.selectionEnd ?? 0

    if (start !== end) {
      applyAroundSelection(`[${kind}:${valueToken}]`, `[/${kind}]`)
      return
    }

    const lineStart = content.lastIndexOf("\n", Math.max(0, start - 1)) + 1
    const rawLineEnd = content.indexOf("\n", start)
    const lineEnd = rawLineEnd === -1 ? content.length : rawLineEnd
    const lineText = content.slice(lineStart, lineEnd)

    if (!lineText.trim()) {
      applyAroundSelection(`[${kind}:${valueToken}]`, `[/${kind}]`)
      return
    }

    const wrapped = `[${kind}:${valueToken}]${lineText}[/${kind}]`
    const next = content.slice(0, lineStart) + wrapped + content.slice(lineEnd)
    applyContent(next)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(lineStart + wrapped.length, lineStart + wrapped.length)
    })
  }

  const handleAddImageUrl = () => {
    const trimmed = imageUrl.trim()
    if (!trimmed) return
    const captionLine = imageCaption.trim() ? `@@caption(${imageCaption.trim()})\n` : ""
    const line = `\n![rasm](${trimmed})\n${captionLine}`
    insertAtCursor(line)
    setImageUrl("")
    setImageCaption("")
  }

  const handleAddVideoUrl = () => {
    const trimmed = videoUrl.trim()
    if (!trimmed) return
    const captionLine = videoCaption.trim() ? `@@caption(${videoCaption.trim()})\n` : ""
    const line = `\n@@video(${trimmed})\n${captionLine}`
    insertAtCursor(line)
    setVideoUrl("")
    setVideoCaption("")
  }

  const handleAddAudioUrl = () => {
    const trimmed = audioUrl.trim()
    if (!trimmed) return
    const captionLine = audioCaption.trim() ? `@@caption(${audioCaption.trim()})\n` : ""
    const line = `\n@@audio(${trimmed})\n${captionLine}`
    insertAtCursor(line)
    setAudioUrl("")
    setAudioCaption("")
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
      const markers = uploadedUrls
        .map((url) => {
          const captionLine = imageCaption.trim()
            ? `@@caption(${imageCaption.trim()})\n`
            : ""
          return `\n![rasm](${url})\n${captionLine}`
        })
        .join("")
      insertAtCursor(markers)
    }
    setImageCaption("")
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
      const markers = uploadedUrls
        .map((url) => {
          const captionLine = videoCaption.trim()
            ? `@@caption(${videoCaption.trim()})\n`
            : ""
          return `\n@@video(${url})\n${captionLine}`
        })
        .join("")
      insertAtCursor(markers)
    }
    setVideoCaption("")
    e.target.value = ""
  }

  const handleLocalAudios = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const selected = Array.from(files)
    const uploadedUrls: string[] = []
    for (const file of selected) {
      try {
        const uploadedUrl = await uploadMedia(file, "audio")
        uploadedUrls.push(uploadedUrl)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Audio upload bo'lmadi")
      }
    }

    if (uploadedUrls.length > 0) {
      const markers = uploadedUrls
        .map((url) => {
          const captionLine = audioCaption.trim()
            ? `@@caption(${audioCaption.trim()})\n`
            : ""
          return `\n@@audio(${url})\n${captionLine}`
        })
        .join("")
      insertAtCursor(markers)
    }
    setAudioCaption("")
    e.target.value = ""
  }

  const renderedPreview = (
    <RichTextContent
      content={debouncedContent}
      localImages={localImages}
      localVideos={localVideos}
      className="prose prose-sm max-w-none dark:prose-invert"
    />
  )

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
          /^@@audio\(.+\)$/.test(trimmed) ||
          /^@@local-image\(\d+\)$/.test(trimmed) ||
          /^@@local-video\(\d+\)$/.test(trimmed) ||
          /^!\[[^\]]*]\(((?:https?:\/\/|\/)[^\s)]+)\)$/.test(trimmed)
        ) {
          return line
        }

        if (/^@@caption\(.+\)$/.test(trimmed)) {
          return line.replace(
            /^(\s*@@caption\()(.+)(\)\s*)$/,
            (_m, p1: string, body: string, p3: string) => `${p1}${convert(body)}${p3}`
          )
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
    applyContent(next)
  }

  const slashCommands: Array<{ id: string; tool: EditorToolId; label: string; action: () => void }> = [
    { id: "h1", tool: "h1", label: "H1 sarlavha", action: () => applyHeadingAtCursor("# ") },
    { id: "h2", tool: "h2", label: "H2 sarlavha", action: () => applyHeadingAtCursor("## ") },
    { id: "h3", tool: "h3", label: "H3 sarlavha", action: () => applyHeadingAtCursor("### ") },
    { id: "quote", tool: "quote", label: "Quote", action: applyQuoteAtCursor },
    { id: "bullet", tool: "bullet", label: "Nuqtali ro'yxat", action: () => applyPrefixToSelectionLines(() => "- ") },
    { id: "numbered", tool: "numbered", label: "Raqamli ro'yxat", action: () => applyPrefixToSelectionLines((idx) => `${idx + 1}. `) },
    { id: "strike", tool: "strike", label: "Strikethrough", action: () => applyAroundSelection("~~") },
    { id: "sub", tool: "sub", label: "Subscript", action: () => applyAroundSelection("<sub>", "</sub>") },
    { id: "sup", tool: "sup", label: "Superscript", action: () => applyAroundSelection("<sup>", "</sup>") },
    { id: "code", tool: "code", label: "Code block", action: () => wrapBlock("```", "```") },
    { id: "left", tool: "alignLeft", label: "Align left", action: () => wrapBlock("@@align(left)", "@@/align") },
    { id: "center", tool: "alignCenter", label: "Align center", action: () => wrapBlock("@@align(center)", "@@/align") },
    { id: "right", tool: "alignRight", label: "Align end", action: () => wrapBlock("@@align(right)", "@@/align") },
  ]

  const filteredSlashCommands = slashCommands
    .filter((cmd) => isToolEnabled(cmd.tool))
    .filter((cmd) => cmd.label.toLowerCase().includes(slashQuery.toLowerCase()))

  const executeSlashCommand = (idx: number) => {
    const cmd = filteredSlashCommands[idx]
    if (!cmd) return
    cmd.action()
    setSlashMenuOpen(false)
    setSlashQuery("")
    setSlashActiveIndex(0)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const openSlashMenuAtCursor = (textarea: HTMLTextAreaElement, cursor: number) => {
    const coords = getCaretPositionInTextarea(textarea, cursor)
    setSlashPosition({
      top: coords.top + 28,
      left: Math.max(8, Math.min(coords.left, textarea.clientWidth - 280)),
    })
    setSlashMenuOpen(true)
    setSlashQuery("")
    setSlashActiveIndex(0)
  }

  return (
    <div ref={editorRootRef} className="relative space-y-4 bg-background w-full overflow-hidden rounded-lg border p-4">
      <div className="sticky inset-x-0 top-0 z-20 -mx-4 align-start  flex flex-wrap items-center gap-2 border-b bg-background px-4 pb-2 pt-1 text-sm">
        <span className="font-medium text-muted-foreground">Matn tahrirlash</span>
        <div className="md:hidden flex items-center gap-1 rounded-md border p-1">
          <button
            type="button"
            onClick={() => setMobileViewMode("edit")}
            className={cn("rounded px-2 py-1 text-xs", mobileViewMode === "edit" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMobileViewMode("preview")}
            className={cn("rounded px-2 py-1 text-xs", mobileViewMode === "preview" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => setMobileViewMode("split")}
            className={cn("rounded px-2 py-1 text-xs", mobileViewMode === "split" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
          >
            Split
          </button>
        </div>
        <div className="ml-auto flex flex-wrap gap-1">
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50", !isToolEnabled("undo") && "hidden")}
          >
            <Undo2Icon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50", !isToolEnabled("redo") && "hidden")}
          >
            <Redo2Icon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyAroundSelection("**")}
            title="Qalin"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("bold") && "hidden")}
          >
            <BoldIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyAroundSelection("*")}
            title="Kursiv"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("italic") && "hidden")}
          >
            <ItalicIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyAroundSelection("__")}
            title="Pastki chiziq"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("underline") && "hidden")}
          >
            <span className="text-xs font-semibold underline">U</span>
          </button>
          <button
            type="button"
            onClick={() => applyAroundSelection("~~")}
            title="Strikethrough"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("strike") && "hidden")}
          >
            <StrikethroughIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyAroundSelection("<sub>", "</sub>")}
            title="Subscript"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("sub") && "hidden")}
          >
            x₂
          </button>
          <button
            type="button"
            onClick={() => applyAroundSelection("<sup>", "</sup>")}
            title="Superscript"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("sup") && "hidden")}
          >
            x²
          </button>
          <button
            type="button"
            onClick={() => wrapBlock("```", "```")}
            title="Code block"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("code") && "hidden")}
          >
            <Code2Icon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyHeadingAtCursor("# ")}
            title="H1"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("h1") && "hidden")}
          >
            <span className="text-xs font-semibold">H1</span>
          </button>
          <button
            type="button"
            onClick={() => applyHeadingAtCursor("## ")}
            title="H2"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("h2") && "hidden")}
          >
            <span className="text-xs font-semibold">H2</span>
          </button>
          <button
            type="button"
            onClick={() => applyHeadingAtCursor("### ")}
            title="H3"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("h3") && "hidden")}
          >
            <span className="text-xs font-semibold">H3</span>
          </button>
          <button
            type="button"
            onClick={handleInsertLink}
            title="Havola"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("link") && "hidden")}
          >
            <LinkIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={applyQuoteAtCursor}
            title="Qo'shtirnoq"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("quote") && "hidden")}
          >
            <QuoteIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyPrefixToSelectionLines(() => "- ")}
            title="Nuqtali ro'yxat"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("bullet") && "hidden")}
          >
            <ListIcon className="size-3.5" />
          </button>
          <button
            type="button"

            onClick={() => applyPrefixToSelectionLines((idx) => `${idx + 1}. `)}
            title="Raqamli ro'yxat"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("numbered") && "hidden")}
          >
            <ListOrderedIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapBlock("@@align(left)", "@@/align")}
            className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("alignLeft") && "hidden")}
          >
            <AlignLeftIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapBlock("@@align(center)", "@@/align")}
            className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("alignCenter") && "hidden")}
          >
            <AlignCenterIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapBlock("@@align(right)", "@@/align")}
            className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("alignRight") && "hidden")}
          >
            <AlignRightIcon className="size-3.5" />
          </button>
          <select
            onChange={(e) => {
              if (!e.target.value) return
              applyInlineToken("color", e.target.value)
              setActiveColor(e.target.value as typeof activeColor)
              e.currentTarget.value = ""
            }}
            defaultValue=""
            style={activeColor ? { color: { red: "#ef4444", blue: "#3b82f6", green: "#22c55e", orange: "#f97316", purple: "#a855f7", gray: "#6b7280" }[activeColor] } : undefined}
            className={cn("rounded-md border bg-background px-2 py-1 text-xs", !isToolEnabled("color") && "hidden")}
          >
            <option value="">Matn rangi</option>
            <option value="red" style={{ color: "#ef4444" }}>Aa</option>
            <option value="blue" style={{ color: "#3b82f6" }}>Aa</option>
            <option value="green" style={{ color: "#22c55e" }}>Aa</option>
            <option value="orange" style={{ color: "#f97316" }}>Aa</option>
            <option value="purple" style={{ color: "#a855f7" }}>Aa</option>
            <option value="gray" style={{ color: "#6b7280" }}>Aa</option>
          </select>
          <select
            onChange={(e) => {
              if (!e.target.value) return
              applyInlineToken("bg", e.target.value)
              setActiveBg(e.target.value as typeof activeBg)
              e.currentTarget.value = ""
            }}
            defaultValue=""
            style={activeBg ? { backgroundColor: { yellow: "#fef08a", cyan: "#a5f3fc", green: "#bbf7d0", pink: "#fbcfe8", gray: "#e5e7eb", none: "transparent" }[activeBg] } : undefined}
            className={cn("rounded-md border bg-background px-2 py-1 text-xs", !isToolEnabled("bg") && "hidden")}
          >
            <option value="">Bo'yash</option>
            <option value="yellow" style={{ backgroundColor: "#fef08a" }}>Aa</option>
            <option value="cyan" style={{ backgroundColor: "#a5f3fc" }}>Aa</option>
            <option value="green" style={{ backgroundColor: "#bbf7d0" }}>Aa</option>
            <option value="pink" style={{ backgroundColor: "#fbcfe8" }}>Aa</option>
            <option value="gray" style={{ backgroundColor: "#e5e7eb" }}>Aa</option>
            <option value="none">Aa</option>
          </select>
          <select
            onChange={(e) => {
              if (!e.target.value) return
              applyInlineToken("font", e.target.value)
              setActiveFont(e.target.value as typeof activeFont)
              e.currentTarget.value = ""
            }}
            defaultValue=""
            title="Shrift"
            style={
              activeFont
                ? activeFont === "serif"
                  ? { fontFamily: "serif" }
                  : activeFont === "mono"
                    ? { fontFamily: "monospace" }
                    : activeFont === "inter"
                      ? { fontFamily: "Inter, sans-serif" }
                      : activeFont === "georgia"
                        ? { fontFamily: "Georgia, serif" }
                        : activeFont === "display"
                          ? { fontFamily: "ui-rounded, system-ui, sans-serif" }
                          : { fontFamily: "system-ui, sans-serif" }
                : undefined
            }
            className={cn("rounded-md border bg-background px-2 py-1 text-xs", !isToolEnabled("font") && "hidden")}
          >
            <option value="">Shrift</option>
            <option value="sans" style={{ fontFamily: "system-ui, sans-serif" }}>Sans</option>
            <option value="serif" style={{ fontFamily: "serif" }}>Serif</option>
            <option value="mono" style={{ fontFamily: "monospace" }}>Mono</option>
            <option value="inter" style={{ fontFamily: "Inter, sans-serif" }}>Inter</option>
            <option value="georgia" style={{ fontFamily: "Georgia, serif" }}>Georgia</option>
            <option value="display" style={{ fontFamily: "ui-rounded, system-ui, sans-serif" }}>Display</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setMediaSource("url")
              setImageModalOpen(true)
            }}
            title="Rasm"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("image") && "hidden")}
          >
            <ImageIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setMediaSource("url")
              setVideoModalOpen(true)
            }}
            title="Video"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("video") && "hidden")}
          >
            <PlaySquareIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setMediaSource("url")
              setAudioModalOpen(true)
            }}
            title="Audio"
            className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted", !isToolEnabled("audio") && "hidden")}
          >
            <AudioLinesIcon className="size-3.5" />
          </button>

        </div>
      </div>
      {slashMenuOpen ? (
        <div
          className="absolute z-30 w-[280px] rounded-md border bg-background p-2 shadow-lg"
          style={{ top: slashPosition.top, left: slashPosition.left }}
        >
          <div className="mb-1 px-1 text-xs text-muted-foreground">/ Buyruqlar</div>
          <input
            value={slashQuery}
            onChange={(e) => {
              setSlashQuery(e.target.value)
              setSlashActiveIndex(0)
            }}
            placeholder="Qidirish..."
            className="mb-2 w-full rounded-md border bg-background px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {filteredSlashCommands.length === 0 ? (
              <div className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
                Topilmadi
              </div>
            ) : (
              filteredSlashCommands.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  type="button"
                  className={cn(
                    "w-full rounded-md border px-2 py-1 text-left text-xs hover:bg-muted",
                    idx === slashActiveIndex && "bg-muted"
                  )}
                  onMouseEnter={() => setSlashActiveIndex(idx)}
                  onClick={() => executeSlashCommand(idx)}
                >
                  {cmd.label}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}

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
                <div className="space-y-1">
                  <Label className="text-xs">Caption (ixtiyoriy)</Label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Rasm uchun qisqa izoh..."
                    className="w-full rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
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
                <div className="space-y-1">
                  <Label className="text-xs">Caption (ixtiyoriy)</Label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Rasm uchun qisqa izoh..."
                    className="w-full rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
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
                <div className="space-y-1">
                  <Label className="text-xs">Caption (ixtiyoriy)</Label>
                  <input
                    type="text"
                    value={videoCaption}
                    onChange={(e) => setVideoCaption(e.target.value)}
                    placeholder="Video uchun qisqa izoh..."
                    className="w-full rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
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
                <div className="space-y-1">
                  <Label className="text-xs">Caption (ixtiyoriy)</Label>
                  <input
                    type="text"
                    value={videoCaption}
                    onChange={(e) => setVideoCaption(e.target.value)}
                    placeholder="Video uchun qisqa izoh..."
                    className="w-full rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={audioModalOpen} onOpenChange={setAudioModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Audio qo&apos;shish</DialogTitle>
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
                <Label className="text-xs">Audio manzili</Label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="https://example.com/audio.mp3"
                    className="flex-1 rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      handleAddAudioUrl()
                      setAudioModalOpen(false)
                    }}
                    disabled={!audioUrl.trim()}
                  >
                    Qo&apos;shish
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Caption (ixtiyoriy)</Label>
                  <input
                    type="text"
                    value={audioCaption}
                    onChange={(e) => setAudioCaption(e.target.value)}
                    placeholder="Audio uchun qisqa izoh..."
                    className="w-full rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs">Fayl tanlang</Label>
                <input
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={(e) => {
                    handleLocalAudios(e)
                    setAudioModalOpen(false)
                  }}
                  className="w-full text-sm"
                />
                <div className="space-y-1">
                  <Label className="text-xs">Caption (ixtiyoriy)</Label>
                  <input
                    type="text"
                    value={audioCaption}
                    onChange={(e) => setAudioCaption(e.target.value)}
                    placeholder="Audio uchun qisqa izoh..."
                    className="w-full rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={cn("space-y-3", mobileViewMode === "preview" ? "hidden md:block" : "block")}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => applyContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSlashMenuOpen(false)
                setSlashQuery("")
                setSlashActiveIndex(0)
                return
              }
              if (slashMenuOpen) {
                if (e.key === "ArrowDown") {
                  e.preventDefault()
                  if (filteredSlashCommands.length === 0) return
                  setSlashActiveIndex((idx) =>
                    Math.min(filteredSlashCommands.length - 1, idx + 1)
                  )
                  return
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault()
                  if (filteredSlashCommands.length === 0) return
                  setSlashActiveIndex((idx) => Math.max(0, idx - 1))
                  return
                }
                if (e.key === "Enter") {
                  e.preventDefault()
                  executeSlashCommand(slashActiveIndex)
                  return
                }
                if (e.key === "Backspace") {
                  e.preventDefault()
                  setSlashQuery((q) => {
                    const next = q.slice(0, -1)
                    if (!next) {
                      setSlashMenuOpen(false)
                      setSlashActiveIndex(0)
                    }
                    return next
                  })
                  return
                }
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                  e.preventDefault()
                  setSlashQuery((q) => q + e.key)
                  return
                }
              }
              if (
                e.key === "/" &&
                !e.shiftKey &&
                !e.ctrlKey &&
                !e.metaKey &&
                !e.altKey
              ) {
                const textarea = e.currentTarget
                const cursor = textarea.selectionStart ?? 0
                const prevChar = cursor > 0 ? content[cursor - 1] : "\n"
                if (cursor === 0 || /\s/.test(prevChar)) {
                  e.preventDefault()
                  openSlashMenuAtCursor(textarea, cursor)
                  return
                }
              }
              if (e.key !== "Enter" || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return
              const textarea = e.currentTarget
              const start = textarea.selectionStart ?? 0
              const end = textarea.selectionEnd ?? 0
              if (start !== end) return

              const lineStart = content.lastIndexOf("\n", Math.max(0, start - 1)) + 1
              const rawLineEnd = content.indexOf("\n", start)
              const lineEnd = rawLineEnd === -1 ? content.length : rawLineEnd
              const currentLine = content.slice(lineStart, lineEnd)
              const quotePrefixMatch = currentLine.match(/^(\s*>\s?)/)
              if (!quotePrefixMatch) return

              e.preventDefault()
              const isEmptyQuoteLine = /^\s*>\s*$/.test(currentLine)
              if (isEmptyQuoteLine) {
                const lineEndWithBreak = rawLineEnd === -1 ? lineEnd : rawLineEnd + 1
                const replacement = lineStart === 0 ? "" : "\n"
                const next =
                  content.slice(0, lineStart) +
                  replacement +
                  content.slice(lineEndWithBreak)
                applyContent(next)
                requestAnimationFrame(() => {
                  const pos = lineStart + replacement.length
                  textarea.focus()
                  textarea.setSelectionRange(pos, pos)
                })
                return
              }

              const prefix = quotePrefixMatch[1]
              const insert = `\n${prefix}`
              const next = content.slice(0, start) + insert + content.slice(end)
              applyContent(next)
              requestAnimationFrame(() => {
                const pos = start + insert.length
                textarea.focus()
                textarea.setSelectionRange(pos, pos)
              })
            }}
            onPaste={(e) => {
              e.preventDefault()
              const pastedText = e.clipboardData.getData("text")
              insertAtCursor(normalizeBlankLines(pastedText))
            }}
            placeholder={placeholder}
            className="min-h-1/3 w-full resize-vertical rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 text-[16px] md:min-h-52"
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

        <div className={cn("space-y-3 rounded-md border bg-muted/30 p-3", mobileViewMode === "edit" ? "hidden md:block" : "block")}>
          <div className="mb-1 text-xs font-semibold text-muted-foreground">
            Preview (150ms)
          </div>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {renderedPreview}
          </div>
        </div>
      </div>
    </div>
  )
}