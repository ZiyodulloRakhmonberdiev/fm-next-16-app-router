import type { AppLocale } from "./locale-api"

export type UzbekRegionKey =
  | "fargona"
  | "nukus"
  | "toshkent"
  | "andijon"
  | "namangan"
  | "samarqand"
  | "buxoro"
  | "xorazm"
  | "surxondaryo"
  | "qashqadaryo"
  | "jizzax"
  | "sirdaryo"
  | "navoiy"

export type UzbekRegion = {
  key: UzbekRegionKey
  lat: number
  lon: number
  name: Record<AppLocale, string>
}

export const UZBEK_REGIONS: UzbekRegion[] = [
  { key: "fargona", lat: 40.3894, lon: 71.7872, name: { uz: "Farg'ona", uzb: "Фарғона", ru: "Фергана", en: "Fergana" } },
  { key: "nukus", lat: 42.4613, lon: 59.6166, name: { uz: "Nukus", uzb: "Нукус", ru: "Нукус", en: "Nukus" } },
  { key: "toshkent", lat: 41.2995, lon: 69.2401, name: { uz: "Toshkent", uzb: "Тошкент", ru: "Ташкент", en: "Tashkent" } },
  { key: "andijon", lat: 40.7821, lon: 72.3442, name: { uz: "Andijon", uzb: "Андижон", ru: "Андижан", en: "Andijan" } },
  { key: "namangan", lat: 40.9983, lon: 71.6726, name: { uz: "Namangan", uzb: "Наманган", ru: "Наманган", en: "Namangan" } },
  { key: "samarqand", lat: 39.6542, lon: 66.9597, name: { uz: "Samarqand", uzb: "Самарқанд", ru: "Самарканд", en: "Samarkand" } },
  { key: "buxoro", lat: 39.7681, lon: 64.4556, name: { uz: "Buxoro", uzb: "Бухоро", ru: "Бухара", en: "Bukhara" } },
  { key: "xorazm", lat: 41.5533, lon: 60.6310, name: { uz: "Xorazm", uzb: "Хоразм", ru: "Хорезм", en: "Khorezm" } },
  { key: "surxondaryo", lat: 37.2242, lon: 67.2783, name: { uz: "Surxondaryo", uzb: "Сурхондарё", ru: "Сурхандарья", en: "Surkhandarya" } },
  { key: "qashqadaryo", lat: 38.8606, lon: 65.7891, name: { uz: "Qashqadaryo", uzb: "Қашқадарё", ru: "Кашкадарья", en: "Kashkadarya" } },
  { key: "jizzax", lat: 40.1158, lon: 67.8422, name: { uz: "Jizzax", uzb: "Жиззах", ru: "Джизак", en: "Jizzakh" } },
  { key: "sirdaryo", lat: 40.8389, lon: 68.6610, name: { uz: "Sirdaryo", uzb: "Сирдарё", ru: "Сырдарья", en: "Syrdarya" } },
  { key: "navoiy", lat: 40.0844, lon: 65.3792, name: { uz: "Navoiy", uzb: "Навоий", ru: "Навои", en: "Navoi" } },
]

export function getRegionByKey(key?: string): UzbekRegion {
  return UZBEK_REGIONS.find((r) => r.key === key) ?? UZBEK_REGIONS[0]
}
