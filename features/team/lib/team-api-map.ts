/**
 * Eski yozuvlarda `order` BSON number bo‘lishi mumkin — "008" o‘qilganda "8" bo‘lib qoladi.
 * Yangi `certificateNumber` faqat string; foydalanuvchi nima kiritgan bo‘lsa shu saqlanadi.
 * API javobida ikkala kalit ham bir xil qiymat (dashboard `order` ishlatadi).
 */
export function mapTeamDocToClient(doc: object) {
  const d = doc as Record<string, unknown>
  const cert = d.certificateNumber
  const guvohnoma =
    typeof cert === "string"
      ? cert
      : d.order === undefined || d.order === null
        ? ""
        : String(d.order)

  const { order: _drop, certificateNumber: _c, ...rest } = d
  return {
    ...rest,
    order: guvohnoma,
    certificateNumber: guvohnoma,
  }
}
