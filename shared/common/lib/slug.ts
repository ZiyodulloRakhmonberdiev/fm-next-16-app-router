/**
 * News uchun: title dan slug (URL).
 * @example titleToSlug("Nike Air Max 270") → "nike-air-max-270"
 */
export function titleToSlug(title: string): string {
  return slugify(title)
}

export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const CYRILLIC_TO_LATIN: Record<string, string> = {
  А: 'a', а: 'a', Б: 'b', б: 'b', В: 'v', в: 'v', Г: 'g', г: 'g',
  Д: 'd', д: 'd', Е: 'e', е: 'e', Ё: 'yo', ё: 'yo', Ж: 'j', ж: 'j',
  З: 'z', з: 'z', И: 'i', и: 'i', Й: 'y', й: 'y', К: 'k', к: 'k',
  Л: 'l', л: 'l', М: 'm', м: 'm', Н: 'n', н: 'n', О: 'o', о: 'o',
  П: 'p', п: 'p', Р: 'r', р: 'r', С: 's', с: 's', Т: 't', т: 't',
  У: 'u', у: 'u', Ф: 'f', ф: 'f', Х: 'x', х: 'x', Ц: 'ts', ц: 'ts',
  Ч: 'ch', ч: 'ch', Ш: 'sh', ш: 'sh', Щ: 'sh', щ: 'sh',
  Ъ: '', ъ: '', Ы: 'y', ы: 'y', Ь: '', ь: '',
  Э: 'e', э: 'e', Ю: 'yu', ю: 'yu', Я: 'ya', я: 'ya',
  Қ: 'q', қ: 'q', Ғ: "g'", ғ: "g'", Ҳ: 'h', ҳ: 'h', Ў: "o'", ў: "o'",
}

export function cyrillicToLatinForSlug(text: string): string {
  if (!text) return ''
  return text
    .split('')
    .map((ch) => CYRILLIC_TO_LATIN[ch] ?? ch)
    .join('')
}
