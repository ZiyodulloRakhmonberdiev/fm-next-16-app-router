
"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/shared/common/components/ui/button"
import { cn } from "@/shared/common/lib/utils"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import { toast } from "sonner"
import { uploadFileViaPresignedUrl } from "@/shared/infra/cloudinary-client-upload"
import { RichTextContent } from "@fm/rich-editor"
import {
  AudioToolDialog,
  EditorToolbar,
  ImageToolDialog,
  SlashCommandMenu,
  VideoToolDialog,
  type EditorToolId,
  type MobileViewMode,
  type RichTextBg,
  type RichTextColor,
  type RichTextFont,
} from "./rich-editor-ui"
import {
  computeGenerateSource,
  convertContentPreserveMarkup,
  getCaretPositionInTextarea,
  normalizeBlankLines,
  resolveWrapToken,
} from "./content-section.utils"

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

export type { EditorToolId } from "./rich-editor-ui"

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
  const [mobileViewMode, setMobileViewMode] = useState<MobileViewMode>("edit")
  const [debouncedContent, setDebouncedContent] = useState(value)
  const [slashMenuOpen, setSlashMenuOpen] = useState(false)
  const [slashQuery, setSlashQuery] = useState("")
  const [slashActiveIndex, setSlashActiveIndex] = useState(0)
  const [slashPosition, setSlashPosition] = useState({ top: 0, left: 0 })
  const [activeColor, setActiveColor] = useState<RichTextColor>("")
  const [activeBg, setActiveBg] = useState<RichTextBg>("")
  const [activeFont, setActiveFont] = useState<RichTextFont>("")

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

  const applyBlockWrapByToken = (token: string, start: number, end: number) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const selected = content.slice(start, end)
    const wrapped = `@@wrap(${token})\n${selected}\n@@/wrap`
    const next = content.slice(0, start) + wrapped + content.slice(end)
    applyContent(next)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + wrapped.length, start + wrapped.length)
    })
  }

  const applyAroundSelection = (before: string, after: string = before) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart ?? 0
    const end = textarea.selectionEnd ?? 0

    const selected = content.slice(start, end)
    if (selected.includes("\n")) {
      const token = resolveWrapToken(before, after)
      if (token) {
        applyBlockWrapByToken(token, start, end)
        return
      }
    }
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

  const insertCaptionMarker = () => {
    const textarea = textareaRef.current
    if (!textarea) {
      insertAtCursor("\n@@caption()\n")
      return
    }
    const start = textarea.selectionStart ?? 0
    const end = textarea.selectionEnd ?? 0
    const selected = content.slice(start, end).trim()
    const line = `\n@@caption(${selected})\n`
    insertAtCursor(line)
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
      const selected = content.slice(start, end)
      if (selected.includes("\n")) {
        applyBlockWrapByToken(`${kind}:${valueToken}`, start, end)
        return
      }
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
    const cap = imageCaption.trim()
    const captionLine = cap ? `@@caption(${cap})\n` : ""
    const line = `\n![rasm](${trimmed})\n${captionLine}`
    insertAtCursor(line)
    setImageUrl("")
    setImageCaption("")
  }

  const handleAddVideoUrl = () => {
    const trimmed = videoUrl.trim()
    if (!trimmed) return
    const cap = videoCaption.trim()
    const captionLine = cap ? `@@caption(${cap})\n` : ""
    const line = `\n@@video(${trimmed})\n${captionLine}`
    insertAtCursor(line)
    setVideoUrl("")
    setVideoCaption("")
  }

  const handleAddAudioUrl = () => {
    const trimmed = audioUrl.trim()
    if (!trimmed) return
    const cap = audioCaption.trim()
    const captionLine = cap ? `@@caption(${cap})\n` : ""
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
          const cap = imageCaption.trim()
          const captionLine = cap ? `@@caption(${cap})\n` : ""
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
          const cap = videoCaption.trim()
          const captionLine = cap ? `@@caption(${cap})\n` : ""
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
          const cap = audioCaption.trim()
          const captionLine = cap ? `@@caption(${cap})\n` : ""
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

  const { mode: generateMode, source: generateSource } = computeGenerateSource(
    locale,
    allContents
  )
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
    { id: "caption", tool: "caption", label: "Caption", action: insertCaptionMarker },
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
      <EditorToolbar
        mobileViewMode={mobileViewMode}
        onMobileViewModeChange={setMobileViewMode}
        isToolEnabled={isToolEnabled}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onBold={() => applyAroundSelection("**")}
        onItalic={() => applyAroundSelection("*")}
        onUnderline={() => applyAroundSelection("__")}
        onStrike={() => applyAroundSelection("~~")}
        onSub={() => applyAroundSelection("<sub>", "</sub>")}
        onSup={() => applyAroundSelection("<sup>", "</sup>")}
        onCode={() => wrapBlock("```", "```")}
        onH1={() => applyHeadingAtCursor("# ")}
        onH2={() => applyHeadingAtCursor("## ")}
        onH3={() => applyHeadingAtCursor("### ")}
        onLink={handleInsertLink}
        onQuote={applyQuoteAtCursor}
        onBullet={() => applyPrefixToSelectionLines(() => "- ")}
        onNumbered={() => applyPrefixToSelectionLines((idx) => `${idx + 1}. `)}
        onAlignLeft={() => wrapBlock("@@align(left)", "@@/align")}
        onAlignCenter={() => wrapBlock("@@align(center)", "@@/align")}
        onAlignRight={() => wrapBlock("@@align(right)", "@@/align")}
        activeColor={activeColor}
        activeBg={activeBg}
        activeFont={activeFont}
        onColor={(value) => {
          applyInlineToken("color", value)
          setActiveColor(value)
        }}
        onBg={(value) => {
          applyInlineToken("bg", value)
          setActiveBg(value)
        }}
        onFont={(value) => {
          applyInlineToken("font", value)
          setActiveFont(value)
        }}
        onImage={() => {
          setMediaSource("url")
          setImageModalOpen(true)
        }}
        onVideo={() => {
          setMediaSource("url")
          setVideoModalOpen(true)
        }}
        onAudio={() => {
          setMediaSource("url")
          setAudioModalOpen(true)
        }}
        onCaption={insertCaptionMarker}
      />
      <SlashCommandMenu
        open={slashMenuOpen}
        top={slashPosition.top}
        left={slashPosition.left}
        query={slashQuery}
        activeIndex={slashActiveIndex}
        commands={filteredSlashCommands}
        onQueryChange={setSlashQuery}
        onActiveIndexChange={setSlashActiveIndex}
        onExecute={executeSlashCommand}
      />

      <ImageToolDialog
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        mediaSource={mediaSource}
        onMediaSourceChange={setMediaSource}
        imageUrl={imageUrl}
        onImageUrlChange={setImageUrl}
        imageCaption={imageCaption}
        onImageCaptionChange={setImageCaption}
        onAddImageUrl={() => {
          handleAddImageUrl()
          setImageModalOpen(false)
        }}
        onLocalImagesChange={(e) => {
          handleLocalImages(e)
          setImageModalOpen(false)
        }}
      />

      <VideoToolDialog
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
        mediaSource={mediaSource}
        onMediaSourceChange={setMediaSource}
        videoUrl={videoUrl}
        onVideoUrlChange={setVideoUrl}
        videoCaption={videoCaption}
        onVideoCaptionChange={setVideoCaption}
        onAddVideoUrl={() => {
          handleAddVideoUrl()
          setVideoModalOpen(false)
        }}
        onLocalVideosChange={(e) => {
          handleLocalVideos(e)
          setVideoModalOpen(false)
        }}
      />

      <AudioToolDialog
        open={audioModalOpen}
        onOpenChange={setAudioModalOpen}
        mediaSource={mediaSource}
        onMediaSourceChange={setMediaSource}
        audioUrl={audioUrl}
        onAudioUrlChange={setAudioUrl}
        audioCaption={audioCaption}
        onAudioCaptionChange={setAudioCaption}
        onAddAudioUrl={() => {
          handleAddAudioUrl()
          setAudioModalOpen(false)
        }}
        onLocalAudiosChange={(e) => {
          handleLocalAudios(e)
          setAudioModalOpen(false)
        }}
      />

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
            className="min-h-56 w-full resize-vertical rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 text-[16px] md:min-h-72"
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

        <div className={cn("space-y-3 rounded-md border bg-transparent p-3", mobileViewMode === "edit" ? "hidden md:block" : "block")}>
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