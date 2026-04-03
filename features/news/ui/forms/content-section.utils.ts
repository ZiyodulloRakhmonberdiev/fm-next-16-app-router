import {
  cyrillicToLatinUz,
  latinToCyrillicUz,
} from "@/features/news/lib/latin-cyrill-translator"
import type { AppLocale } from "@/shared/common/lib/locale-api"

export type GenerateMode = "copy" | "uzToUzb" | "uzbToUz" | null

export function getCaretPositionInTextarea(
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

export function normalizeBlankLines(text: string): string {
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

export function resolveWrapToken(before: string, after: string): string | null {
  if (before === "**" && after === "**") return "bold"
  if (before === "*" && after === "*") return "italic"
  if (before === "__" && after === "__") return "underline"
  if (before === "~~" && after === "~~") return "strike"
  if (before === "<sub>" && after === "</sub>") return "sub"
  if (before === "<sup>" && after === "</sup>") return "sup"
  return null
}

export function computeGenerateSource(
  locale: AppLocale,
  allContents: Record<AppLocale, string>
): { mode: GenerateMode; source: string } {
  if (locale === "uzb" && allContents.uz?.trim()) {
    return { mode: "uzToUzb", source: allContents.uz }
  }
  if (locale === "uz" && allContents.uzb?.trim()) {
    return { mode: "uzbToUz", source: allContents.uzb }
  }
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

export function convertContentPreserveMarkup(
  source: string,
  mode: GenerateMode
): string {
  if (!source || !mode || mode === "copy") return source

  const convert =
    mode === "uzToUzb" ? latinToCyrillicUz : cyrillicToLatinUz

  return source
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim()
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

      const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
      let result = ""
      let lastIndex = 0
      let match: RegExpExecArray | null

      while ((match = linkRegex.exec(line)) !== null) {
        const before = line.slice(lastIndex, match.index)
        result += convert(before)
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
