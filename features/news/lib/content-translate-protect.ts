/** Kontent tarjimasi: media va markup tokenlarini placeholder bilan himoya qilish. */

const SEG_RE = /^<<FM_SEG_(\d+)>>$/

const BLOCK_PATTERNS: RegExp[] = [
  /@@wrap\([^)]+\)\r?\n[\s\S]*?\r?\n@@\/wrap/g,
  /@@align\([^)]+\)\r?\n[\s\S]*?\r?\n@@\/align/g,
  /```[\s\S]*?```/g,
]

function isProtectedLine(trimmed: string): boolean {
  return (
    /^@@video\(.+\)$/.test(trimmed) ||
    /^@@audio\(.+\)$/.test(trimmed) ||
    /^@@local-image\(\d+\)$/.test(trimmed) ||
    /^@@local-video\(\d+\)$/.test(trimmed) ||
    /^!\[[^\]]*]\([^)]+\)$/.test(trimmed) ||
    /^@@caption\(.+\)$/.test(trimmed)
  )
}

export function protectContentForTranslation(source: string): {
  protectedText: string
  segments: string[]
} {
  const segments: string[] = []
  const placeholder = (value: string) => {
    const id = segments.length
    segments.push(value)
    return `<<FM_SEG_${id}>>`
  }

  let text = source
  for (const pattern of BLOCK_PATTERNS) {
    text = text.replace(pattern, (match) => placeholder(match))
  }

  const lines = text.split(/\r?\n/)
  const outLines = lines.map((line) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('<<FM_SEG_') && SEG_RE.test(trimmed)) {
      return line
    }
    if (isProtectedLine(trimmed)) {
      return placeholder(line)
    }
    return line
  })

  return { protectedText: outLines.join('\n'), segments }
}

function countMediaLines(text: string): number {
  return text.split(/\r?\n/).filter((line) => isProtectedLine(line.trim())).length
}

/** Placeholder yo‘qolsa, media qatorlarni manba strukturasiga mos qayta joylaydi. */
export function ensureMediaLinesPreserved(translated: string, originalSource: string): string {
  if (countMediaLines(translated) >= countMediaLines(originalSource)) {
    return translated
  }

  const srcLines = originalSource.split(/\r?\n/)
  const transLines = translated.split(/\r?\n/)
  const result: string[] = []
  let ti = 0

  for (const srcLine of srcLines) {
    if (isProtectedLine(srcLine.trim())) {
      result.push(srcLine)
      continue
    }
    while (
      ti < transLines.length &&
      (isProtectedLine(transLines[ti].trim()) || /^<<FM_SEG_\d+>>/.test(transLines[ti].trim()))
    ) {
      ti++
    }
    if (ti < transLines.length) {
      result.push(transLines[ti])
      ti++
    }
  }
  while (ti < transLines.length) {
    result.push(transLines[ti])
    ti++
  }
  return result.join('\n')
}

export function restoreContentAfterTranslation(
  translated: string,
  segments: string[],
  originalSource?: string
): string {
  let out = translated
  for (let i = 0; i < segments.length; i++) {
    const token = `<<FM_SEG_${i}>>`
    const original = segments[i]
    if (out.includes(token)) {
      out = out.split(token).join(original)
      continue
    }
    const loose = new RegExp(`<<\\s*FM_SEG_${i}\\s*>>`, 'gi')
    if (loose.test(out)) {
      out = out.replace(loose, original)
    }
  }
  if (originalSource) {
    out = ensureMediaLinesPreserved(out, originalSource)
  }
  return out
}
