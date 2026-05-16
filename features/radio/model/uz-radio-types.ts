/** O‘zbekiston radiostansiyalari */
export type UzRadioStationDTO = {
  id: string
  name: string
  streamUrl: string
  favicon: string | null
  /** Kartochka sarlavhasi */
  cardTitle?: string
  /** Masalan FM chastota qatori */
  frequencyLine?: string
  /** Mahalliy logotip yo‘li */
  logoSrc?: string | null
  codec?: string
  bitrate?: number
}
