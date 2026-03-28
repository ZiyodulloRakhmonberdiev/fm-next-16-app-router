/**
 * Optimize and resize an image before upload.
 *
 * @param file - The original image file
 * @param config - Optional configuration for resizing and quality
 * @returns A promise that resolves to the optimized File object
 */
export async function optimizeImage(
  file: File,
  config: { maxWidth?: number; maxHeight?: number; quality?: number } = {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.8,
  }
): Promise<File> {
  // If not an image, skip optimization
  if (!file.type.startsWith("image/")) {
    return file
  }

  // PNG may have transparency, but JPEG is usually smaller.
  // We'll target image/jpeg for most efficient compression.
  const targetType = "image/jpeg"

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let { width, height } = img

        const maxWidth = config.maxWidth || 1600
        const maxHeight = config.maxHeight || 1600

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          return resolve(file)
        }

        // Use high-quality interpolation
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"

        // Fill white background (useful for transparent PNGs converted to JPEG)
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, width, height)

        ctx.drawImage(img, 0, 0, width, height)

        // Convert canvas back to Blob/File
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file)
            }
            // Create a new File wrapper for the optimized blob
            const optimizedFile = new File([blob], file.name, {
              type: targetType,
              lastModified: Date.now(),
            })
            resolve(optimizedFile)
          },
          targetType,
          config.quality || 0.8
        )
      }
      img.onerror = (e) => {
        console.warn("Failed to load image for optimization:", e)
        resolve(file)
      }
    }
    reader.onerror = (e) => {
      console.warn("Failed to read file for optimization:", e)
      resolve(file)
    }
  })
}
