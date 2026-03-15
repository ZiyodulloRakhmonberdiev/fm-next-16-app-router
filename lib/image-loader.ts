/**
 * Barcha rasmlar to'g'ridan-to'g'ri yuklanadi (Cloudinary 400 sabab, custom loader da
 * _next/image ishlamayapti). src ni o'zgartirmasdan qaytaramiz.
 */
export default function imageLoader({ src }: { src: string; width: number; quality?: number }) {
  return src
}
