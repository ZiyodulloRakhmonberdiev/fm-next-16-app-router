'use client'

import type { AppLocale } from '@/shared/common/lib/locale-api'
import { Button } from '@/shared/common/components/ui/button'

export type TranslationsState = Record<AppLocale, { title: string; description: string }>

export function latinToCyrillicUz(text: string): string {
  if (!text) return ''

  let result = text

  const multiReplacements: [RegExp, string][] = [
    [/O['ʻ’`]/g, 'Ў'],
    [/o['ʻ’`]/g, 'ў'],
    [/G['ʻ’`]/g, 'Ғ'],
    [/g['ʻ’`]/g, 'ғ'],
    [/Sh/g, 'Ш'],
    [/SH/g, 'Ш'],
    [/sh/g, 'ш'],
    [/Ch/g, 'Ч'],
    [/CH/g, 'Ч'],
    [/ch/g, 'ч'],
    [/Ng/g, 'Нг'],
    [/NG/g, 'НГ'],
    [/ng/g, 'нг'],
    [/Yo/g, 'Ё'],
    [/YO/g, 'Ё'],
    [/yo/g, 'ё'],
    [/Ya/g, 'Я'],
    [/YA/g, 'Я'],
    [/ya/g, 'я'],
    [/Yu/g, 'Ю'],
    [/YU/g, 'Ю'],
    [/yu/g, 'ю'],
    [/Ts/g, 'Ц'],
    [/TS/g, 'Ц'],
    [/ts/g, 'ц'],
  ]

  for (const [re, rep] of multiReplacements) {
    result = result.replace(re, rep)
  }

  const table: Record<string, string> = {
    A: 'А',
    a: 'а',
    B: 'Б',
    b: 'б',
    D: 'Д',
    d: 'д',
    E: 'Е',
    e: 'е',
    F: 'Ф',
    f: 'ф',
    G: 'Г',
    g: 'г',
    H: 'Ҳ',
    h: 'ҳ',
    I: 'И',
    i: 'и',
    J: 'Ж',
    j: 'ж',
    K: 'К',
    k: 'к',
    L: 'Л',
    l: 'л',
    M: 'М',
    m: 'м',
    N: 'Н',
    n: 'н',
    O: 'О',
    o: 'о',
    P: 'П',
    p: 'п',
    Q: 'Қ',
    q: 'қ',
    R: 'Р',
    r: 'р',
    S: 'С',
    s: 'с',
    T: 'Т',
    t: 'т',
    U: 'У',
    u: 'у',
    V: 'В',
    v: 'в',
    X: 'Х',
    x: 'х',
    Y: 'Й',
    y: 'й',
    Z: 'З',
    z: 'з',
  }

  return result
    .split('')
    .map((ch) => table[ch] ?? ch)
    .join('')
}

export function cyrillicToLatinUz(text: string): string {
  if (!text) return ''

  const table: Record<string, string> = {
    А: 'A',
    а: 'a',
    Б: 'B',
    б: 'b',
    В: 'V',
    в: 'v',
    Г: 'G',
    г: 'g',
    Д: 'D',
    д: 'd',
    Е: 'E',
    е: 'e',
    Ё: 'Yo',
    ё: 'yo',
    Ж: 'J',
    ж: 'j',
    З: 'Z',
    з: 'z',
    И: 'I',
    и: 'i',
    Й: 'Y',
    й: 'y',
    К: 'K',
    к: 'k',
    Л: 'L',
    л: 'l',
    М: 'M',
    м: 'm',
    Н: 'N',
    н: 'n',
    О: 'O',
    о: 'o',
    П: 'P',
    п: 'p',
    Р: 'R',
    р: 'r',
    С: 'S',
    с: 's',
    Т: 'T',
    т: 't',
    У: 'U',
    у: 'u',
    Ф: 'F',
    ф: 'f',
    Х: 'X',
    х: 'x',
    Ц: 'Ts',
    ц: 'ts',
    Ч: 'Ch',
    ч: 'ch',
    Ш: 'Sh',
    ш: 'sh',
    Ъ: "'",
    ъ: "'",
    Ь: '',
    ь: '',
    Э: 'E',
    э: 'e',
    Ю: 'Yu',
    ю: 'yu',
    Я: 'Ya',
    я: 'ya',
    Қ: 'Q',
    қ: 'q',
    Ғ: "G'",
    ғ: "g'",
    Ҳ: 'H',
    ҳ: 'h',
    Ў: "O'",
    ў: "o'",
  }

  return text
    .split('')
    .map((ch) => table[ch] ?? ch)
    .join('')
}

type UzUzbTranslateControlsProps = {
  activeTab: AppLocale
  translations: TranslationsState
  field: 'title' | 'description'
  onChangeTranslation: (loc: AppLocale, field: 'title' | 'description', value: string) => void
}

export function UzUzbTranslateControls({
  activeTab,
  translations,
  field,
  onChangeTranslation,
}: UzUzbTranslateControlsProps) {
  const sourceUz = translations.uz?.[field] ?? ''
  const sourceUzb = translations.uzb?.[field] ?? ''

  const handleFromUz = () => {
    if (!sourceUz.trim()) return
    const converted = latinToCyrillicUz(sourceUz)
    onChangeTranslation('uzb', field, converted)
  }

  const handleFromUzb = () => {
    if (!sourceUzb.trim()) return
    const converted = cyrillicToLatinUz(sourceUzb)
    onChangeTranslation('uz', field, converted)
  }

  return (
    <>
      {activeTab === 'uz' && sourceUzb.trim() !== '' && (
        <div className="flex justify-end">
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={handleFromUzb}
          >
            Generate
          </Button>
        </div>
      )}
      {activeTab === 'uzb' && sourceUz.trim() !== '' && (
        <div className="flex justify-end">
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={handleFromUz}
          >
            Generate
          </Button>
        </div>
      )}
    </>
  )
}

