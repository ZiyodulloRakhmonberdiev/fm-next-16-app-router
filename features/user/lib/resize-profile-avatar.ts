/**
 * Brauzerda: markazdan kvadrat crop (cover), `size` px (masalan 100), JPEG.
 */
export function resizeImageToSquareJpeg(file: File, size = 100): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas unavailable"))
        return
      }
      const w = img.naturalWidth
      const h = img.naturalHeight
      if (w < 1 || h < 1) {
        reject(new Error("Invalid image"))
        return
      }
      const scale = Math.max(size / w, size / h)
      const dw = w * scale
      const dh = h * scale
      const dx = (size - dw) / 2
      const dy = (size - dh) / 2
      ctx.drawImage(img, dx, dy, dw, dh)
      canvas.toBlob(
        (b) => {
          if (b) resolve(b)
          else reject(new Error("Could not encode image"))
        },
        "image/jpeg",
        0.88
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Could not load image"))
    }
    img.src = url
  })
}
