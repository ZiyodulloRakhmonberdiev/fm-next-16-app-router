/**
 * Eski yozuvlarda `order` BSON number bo‘lishi mumkin — "008" o‘qilganda "8" bo‘lib qoladi.
 * Yangi `certificateNumber` faqat string; foydalanuvchi nima kiritgan bo‘lsa shu saqlanadi.
 * API javobida ikkala kalit ham bir xil qiymat (dashboard `order` ishlatadi).
 */
export function mapTeamDocToClient(doc: Record<string, unknown>) {
  const cert = doc.certificateNumber
  const guvohnoma =
    typeof cert === "string"
      ? cert
      : doc.order === undefined || doc.order === null
        ? ""
        : String(doc.order)

  const { order: _drop, certificateNumber: _c, ...rest } = doc
  return {
    ...rest,
    order: guvohnoma,
    certificateNumber: guvohnoma,
  }
}
